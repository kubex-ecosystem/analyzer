// Package repositories implements real data integrations with GitHub, Jira, WakaTime, and Git.
package repositories

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/kubex-ecosystem/analyzer/internal/metrics"
)

// GitHubClient implements real GitHub API integration
type GitHubClient struct {
	token      string
	httpClient *http.Client
	baseURL    string
}

// NewGitHubClient creates a new GitHub API client
func NewGitHubClient(token string) *GitHubClient {
	return &GitHubClient{
		token:      token,
		httpClient: &http.Client{Timeout: 30 * time.Second},
		baseURL:    "https://api.github.com",
	}
}

// GetPullRequests fetches pull requests from GitHub API
func (g *GitHubClient) GetPullRequests(ctx context.Context, owner, repo string, since time.Time) ([]metrics.PullRequest, error) {
	url := fmt.Sprintf("%s/repos/%s/%s/pulls?state=all&since=%s", g.baseURL, owner, repo, since.Format(time.RFC3339))

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+g.token)
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	resp, err := g.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API error: %d", resp.StatusCode)
	}

	var githubPRs []GitHubPullRequest
	if err := json.NewDecoder(resp.Body).Decode(&githubPRs); err != nil {
		return nil, err
	}

	var prs []metrics.PullRequest
	for _, gpr := range githubPRs {
		pr := metrics.PullRequest{
			Number:       gpr.Number,
			Title:        gpr.Title,
			State:        gpr.State,
			CreatedAt:    gpr.CreatedAt,
			UpdatedAt:    gpr.UpdatedAt,
			MergedAt:     gpr.MergedAt,
			ClosedAt:     gpr.ClosedAt,
			Commits:      gpr.Commits,
			Additions:    gpr.Additions,
			Deletions:    gpr.Deletions,
			ChangedFiles: gpr.ChangedFiles,
		}

		// Get first review time
		if gpr.ReviewComments > 0 {
			firstReview, err := g.getFirstReviewTime(ctx, owner, repo, gpr.Number)
			if err == nil {
				pr.FirstReviewAt = firstReview
			}
		}

		prs = append(prs, pr)
	}

	return prs, nil
}

// GetDeployments fetches deployments from GitHub API
func (g *GitHubClient) GetDeployments(ctx context.Context, owner, repo string, since time.Time) ([]metrics.Deployment, error) {
	url := fmt.Sprintf("%s/repos/%s/%s/deployments", g.baseURL, owner, repo)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+g.token)
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	resp, err := g.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API error: %d", resp.StatusCode)
	}

	var githubDeployments []GitHubDeployment
	if err := json.NewDecoder(resp.Body).Decode(&githubDeployments); err != nil {
		return nil, err
	}

	var deployments []metrics.Deployment
	for _, gd := range githubDeployments {
		if gd.CreatedAt.Before(since) {
			continue
		}

		deployment := metrics.Deployment{
			ID:          gd.ID,
			Environment: gd.Environment,
			State:       gd.State,
			CreatedAt:   gd.CreatedAt,
			UpdatedAt:   gd.UpdatedAt,
			SHA:         gd.SHA,
		}
		deployments = append(deployments, deployment)
	}

	return deployments, nil
}

// GetWorkflowRuns fetches workflow runs from GitHub Actions API
func (g *GitHubClient) GetWorkflowRuns(ctx context.Context, owner, repo string, since time.Time) ([]metrics.WorkflowRun, error) {
	url := fmt.Sprintf("%s/repos/%s/%s/actions/runs?created=>=%s", g.baseURL, owner, repo, since.Format("2006-01-02"))

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+g.token)
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	resp, err := g.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API error: %d", resp.StatusCode)
	}

	var response GitHubWorkflowRunsResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, err
	}

	var runs []metrics.WorkflowRun
	for _, gwr := range response.WorkflowRuns {
		run := metrics.WorkflowRun{
			ID:         gwr.ID,
			Name:       gwr.Name,
			Status:     gwr.Status,
			Conclusion: gwr.Conclusion,
			CreatedAt:  gwr.CreatedAt,
			UpdatedAt:  gwr.UpdatedAt,
			SHA:        gwr.HeadSHA,
		}
		runs = append(runs, run)
	}

	return runs, nil
}

// getFirstReviewTime gets the first review time for a PR
func (g *GitHubClient) getFirstReviewTime(ctx context.Context, owner, repo string, prNumber int) (*time.Time, error) {
	url := fmt.Sprintf("%s/repos/%s/%s/pulls/%d/reviews", g.baseURL, owner, repo, prNumber)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+g.token)
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	resp, err := g.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API error: %d", resp.StatusCode)
	}

	var reviews []GitHubReview
	if err := json.NewDecoder(resp.Body).Decode(&reviews); err != nil {
		return nil, err
	}

	if len(reviews) > 0 {
		return &reviews[0].SubmittedAt, nil
	}

	return nil, nil
}

// GitHubPullRequest GitHub API response types
type GitHubPullRequest struct {
	Number         int        `json:"number"`
	Title          string     `json:"title"`
	State          string     `json:"state"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
	MergedAt       *time.Time `json:"merged_at"`
	ClosedAt       *time.Time `json:"closed_at"`
	Commits        int        `json:"commits"`
	Additions      int        `json:"additions"`
	Deletions      int        `json:"deletions"`
	ChangedFiles   int        `json:"changed_files"`
	ReviewComments int        `json:"review_comments"`
}

type GitHubDeployment struct {
	ID          int       `json:"id"`
	Environment string    `json:"environment"`
	State       string    `json:"state"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	SHA         string    `json:"sha"`
}

type GitHubWorkflowRun struct {
	ID         int       `json:"id"`
	Name       string    `json:"name"`
	Status     string    `json:"status"`
	Conclusion string    `json:"conclusion"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	HeadSHA    string    `json:"head_sha"`
}

type GitHubWorkflowRunsResponse struct {
	TotalCount   int                 `json:"total_count"`
	WorkflowRuns []GitHubWorkflowRun `json:"workflow_runs"`
}

type GitHubReview struct {
	ID          int       `json:"id"`
	State       string    `json:"state"`
	SubmittedAt time.Time `json:"submitted_at"`
}

// JiraClient implements real Jira API integration
type JiraClient struct {
	baseURL    string
	username   string
	apiToken   string
	httpClient *http.Client
}

// NewJiraClient creates a new Jira API client
func NewJiraClient(baseURL, username, apiToken string) *JiraClient {
	return &JiraClient{
		baseURL:    strings.TrimSuffix(baseURL, "/"),
		username:   username,
		apiToken:   apiToken,
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
}

// GetIssues fetches issues from Jira API
func (j *JiraClient) GetIssues(ctx context.Context, project string, since time.Time) ([]metrics.Issue, error) {
	jql := fmt.Sprintf("project = %s AND created >= %s ORDER BY created DESC",
		project, since.Format("2006-01-02"))

	url := fmt.Sprintf("%s/rest/api/3/search?jql=%s&fields=key,issuetype,status,priority,created,updated,resolutiondate",
		j.baseURL, jql)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.SetBasicAuth(j.username, j.apiToken)
	req.Header.Set("Accept", "application/json")

	resp, err := j.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Jira API error: %d", resp.StatusCode)
	}

	var response JiraSearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, err
	}

	var issues []metrics.Issue
	for _, ji := range response.Issues {
		issue := metrics.Issue{
			Key:       ji.Key,
			Type:      ji.Fields.IssueType.Name,
			Status:    ji.Fields.Status.Name,
			Priority:  ji.Fields.Priority.Name,
			CreatedAt: ji.Fields.Created,
			UpdatedAt: ji.Fields.Updated,
		}

		if ji.Fields.ResolutionDate != nil {
			issue.ResolvedAt = ji.Fields.ResolutionDate
		}

		issues = append(issues, issue)
	}

	return issues, nil
}

// Jira API response types
type JiraSearchResponse struct {
	Issues []JiraIssue `json:"issues"`
}

type JiraIssue struct {
	Key    string     `json:"key"`
	Fields JiraFields `json:"fields"`
}

type JiraFields struct {
	IssueType      JiraIssueType `json:"issuetype"`
	Status         JiraStatus    `json:"status"`
	Priority       JiraPriority  `json:"priority"`
	Created        time.Time     `json:"created"`
	Updated        time.Time     `json:"updated"`
	ResolutionDate *time.Time    `json:"resolutiondate"`
}

type JiraIssueType struct {
	Name string `json:"name"`
}

type JiraStatus struct {
	Name string `json:"name"`
}

type JiraPriority struct {
	Name string `json:"name"`
}

// WakaTimeClient implements real WakaTime API integration
type WakaTimeClient struct {
	apiKey     string
	httpClient *http.Client
	baseURL    string
}

// NewWakaTimeClient creates a new WakaTime API client
func NewWakaTimeClient(apiKey string) *WakaTimeClient {
	return &WakaTimeClient{
		apiKey:     apiKey,
		httpClient: &http.Client{Timeout: 30 * time.Second},
		baseURL:    "https://wakatime.com/api/v1",
	}
}

// GetCodingTime fetches coding time from WakaTime API
func (w *WakaTimeClient) GetCodingTime(ctx context.Context, user, repo string, since time.Time) (*metrics.CodingTime, error) {
	// WakaTime API for summaries
	start := since.Format("2006-01-02")
	end := time.Now().Format("2006-01-02")

	url := fmt.Sprintf("%s/users/%s/summaries?start=%s&end=%s&project=%s",
		w.baseURL, user, start, end, repo)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+w.apiKey)

	resp, err := w.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("WakaTime API error: %d", resp.StatusCode)
	}

	var response WakaTimeSummariesResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, err
	}

	totalSeconds := 0.0
	codingSeconds := 0.0

	var languages []metrics.LanguageTime
	var projects []metrics.ProjectTime

	for _, day := range response.Data {
		totalSeconds += day.GrandTotal.TotalSeconds

		for _, lang := range day.Languages {
			codingSeconds += lang.TotalSeconds

			// Aggregate languages
			found := false
			for i, existing := range languages {
				if existing.Name == lang.Name {
					languages[i].Hours += lang.TotalSeconds / 3600.0
					found = true
					break
				}
			}
			if !found {
				languages = append(languages, metrics.LanguageTime{
					Name:  lang.Name,
					Hours: lang.TotalSeconds / 3600.0,
				})
			}
		}

		for _, proj := range day.Projects {
			// Aggregate projects
			found := false
			for i, existing := range projects {
				if existing.Name == proj.Name {
					projects[i].Hours += proj.TotalSeconds / 3600.0
					found = true
					break
				}
			}
			if !found {
				projects = append(projects, metrics.ProjectTime{
					Name:  proj.Name,
					Hours: proj.TotalSeconds / 3600.0,
				})
			}
		}
	}

	periodDays := int(time.Since(since).Hours() / 24)
	if periodDays == 0 {
		periodDays = 1
	}

	return &metrics.CodingTime{
		TotalHours:  totalSeconds / 3600.0,
		CodingHours: codingSeconds / 3600.0,
		Period:      periodDays,
		Languages:   languages,
		Projects:    projects,
	}, nil
}

// WakaTime API response types
type WakaTimeSummariesResponse struct {
	Data []WakaTimeDaySummary `json:"data"`
}

type WakaTimeDaySummary struct {
	GrandTotal WakaTimeGrandTotal `json:"grand_total"`
	Languages  []WakaTimeLanguage `json:"languages"`
	Projects   []WakaTimeProject  `json:"projects"`
}

type WakaTimeGrandTotal struct {
	TotalSeconds float64 `json:"total_seconds"`
}

type WakaTimeLanguage struct {
	Name         string  `json:"name"`
	TotalSeconds float64 `json:"total_seconds"`
}

type WakaTimeProject struct {
	Name         string  `json:"name"`
	TotalSeconds float64 `json:"total_seconds"`
}
