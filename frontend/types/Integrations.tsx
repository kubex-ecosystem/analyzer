
// Integration settings interface

export interface IntegrationSettings {
  github: GitHubIntegrationSettings;
  jira: JiraIntegrationSettings;
}

// GitHub Repository type

export interface GitHubIntegrationSettings {
  // github
  githubIntegrationEnabled: boolean;
  githubPat?: string;
  githubUsername?: string;
  githubEnterpriseUrl?: string;
  githubRepositories?: string[];
}

export interface GitHubRepoListItem {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  html_url: string;
  owner: {
    login: string;
  };
}

export interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string;
  encoding: string;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: string;
  size: number;
  sha: string;
  url: string;
}

// Jira Project type

export interface JiraIntegrationSettings {
  // jira
  jiraIntegrationEnabled: boolean;
  jiraPat?: string;
  jiraInstanceUrl?: string;
  jiraUserEmail?: string;
  jiraApiToken?: string;
  jiraProjects?: string[];
}

export interface JiraProjectListItem {
  id: string;
  key: string;
  name: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    issuetype: {
      name: string;
    };
    priority: {
      name: string;
    };
    description: string | null;
  };
}

export interface JiraIssuesResponse {
  issues: JiraIssue[];
  total: number;
  startAt: number;
  maxResults: number;
}

