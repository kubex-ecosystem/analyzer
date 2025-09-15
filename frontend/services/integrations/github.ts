// services/integrations/github.ts
import { GitHubRepoListItem } from "../../types";

interface GitHubRepo {
    name: string;
    description: string;
    html_url: string;
}

interface GitHubReadme {
    content: string; // base64 encoded
}

interface GitHubIssue {
    number: number;
    title: string;
    state: 'open' | 'closed';
    user: { login: string };
    labels: { name: string }[];
    body: string;
}

interface GitHubFileContent {
    name: string;
    path: string;
    type: 'file' | 'dir';
    content?: string; // base64 encoded
    download_url: string | null;
    url: string;
}

const GITHUB_API_BASE = 'https://api.github.com';

const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname !== 'github.com') return null;
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts.length < 2) return null;
        return { owner: pathParts[0], repo: pathParts[1] };
    } catch (error) {
        return null;
    }
};

const formatContext = (repo: GitHubRepo, readme: string, issues: GitHubIssue[]): string => {
    let context = `# Contexto do Repositório GitHub\n`;
    context += `## Projeto: ${repo.name}\n`;
    context += `URL: ${repo.html_url}\n`;
    context += `Descrição: ${repo.description}\n\n`;
    
    context += `---\n\n`;
    
    context += `## README.md\n\n`;
    context += `${readme}\n\n`;
    
    context += `---\n\n`;

    if (issues.length > 0) {
        context += `## Últimas 5 Issues Abertas\n\n`;
        for (const issue of issues) {
            context += `### Issue #${issue.number}: ${issue.title}\n`;
            context += `- **Status:** ${issue.state}\n`;
            context += `- **Autor:** ${issue.user.login}\n`;
            context += `- **Labels:** ${issue.labels.map(l => l.name).join(', ') || 'Nenhuma'}\n\n`;
            // Truncate long issue bodies
            const body = issue.body || '';
            context += `${body.substring(0, 1000)}${body.length > 1000 ? '...' : ''}\n\n`;
        }
    }

    return context;
};

export const fetchRepoContents = async (repoUrl: string, pat: string): Promise<string> => {
    const repoInfo = parseRepoUrl(repoUrl);
    if (!repoInfo) {
        throw new Error('URL do repositório GitHub inválida.');
    }

    const { owner, repo } = repoInfo;
    const headers = {
        'Authorization': `token ${pat}`,
        'Accept': 'application/vnd.github.v3+json',
    };

    try {
        // Fetch repo details, README, and issues in parallel
        const [repoRes, readmeRes, issuesRes] = await Promise.all([
            fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers }),
            fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`, { headers }),
            fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?state=open&sort=created&direction=desc&per_page=5`, { headers }),
        ]);

        if (!repoRes.ok) {
            if (repoRes.status === 404) throw new Error('Repositório não encontrado.');
            if (repoRes.status === 401) throw new Error('Token do GitHub inválido ou sem permissões.');
            throw new Error(`Erro ao buscar detalhes do repositório: ${repoRes.statusText}`);
        }
        
        const repoData: GitHubRepo = await repoRes.json();
        
        let readmeContent = 'README não encontrado.';
        if (readmeRes.ok) {
            const readmeData: GitHubReadme = await readmeRes.json();
            readmeContent = atob(readmeData.content);
        }

        let issuesData: GitHubIssue[] = [];
        if (issuesRes.ok) {
            issuesData = await issuesRes.json();
        }

        return formatContext(repoData, readmeContent, issuesData);

    } catch (error) {
        console.error("Erro na API do GitHub:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Falha ao conectar com a API do GitHub.');
    }
};


export const listUserRepos = async (username: string, pat: string): Promise<GitHubRepoListItem[]> => {
    if (!username.trim()) {
        throw new Error('GitHub username or organization cannot be empty.');
    }
    const headers = {
        'Authorization': `token ${pat}`,
        'Accept': 'application/vnd.github.v3+json',
    };

    // First, determine if it's a user or an org
    const userTypeRes = await fetch(`${GITHUB_API_BASE}/users/${username}`, { headers });
    if (!userTypeRes.ok) {
        if (userTypeRes.status === 404) throw new Error(`User or organization '${username}' not found.`);
        throw new Error(`Failed to fetch user type: ${userTypeRes.statusText}`);
    }
    const userData = await userTypeRes.json();
    const repoUrl = userData.type === 'Organization' 
        ? `${GITHUB_API_BASE}/orgs/${username}/repos?type=public&sort=updated&per_page=100` 
        : `${GITHUB_API_BASE}/users/${username}/repos?type=public&sort=updated&per_page=100`;

    const reposRes = await fetch(repoUrl, { headers });
    if (!reposRes.ok) {
        throw new Error(`Failed to fetch repositories for '${username}': ${reposRes.statusText}`);
    }

    const reposData: GitHubRepoListItem[] = await reposRes.json();
    return reposData;
};

export const fetchRepoForAnalysis = async (owner: string, repo: string, pat: string): Promise<string> => {
    const headers = {
        'Authorization': `token ${pat}`,
        'Accept': 'application/vnd.github.v3+json',
    };
    let combinedContent = '';

    // 1. Fetch README
    try {
        const readmeRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`, { headers });
        if (readmeRes.ok) {
            const readmeData = await readmeRes.json();
            if (readmeData.content) {
                combinedContent += `// / README.md / //\n${atob(readmeData.content)}\n\n---\n\n`;
            }
        }
    } catch (e) {
        console.warn("Could not fetch README.md", e);
    }
    

    // 2. Fetch docs folder contents
    try {
        const docsRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/docs`, { headers });
        if (docsRes.ok) {
            const docsContents: GitHubFileContent[] = await docsRes.json();
            
            const fileFetchPromises: Promise<{ path: string, content: string }>[] = [];

            const processContents = (contents: GitHubFileContent[]) => {
                for (const item of contents) {
                    if (item.type === 'file' && /\.(md|txt|json|yml|yaml)$/i.test(item.name)) {
                        fileFetchPromises.push(
                            fetch(item.url, { headers })
                                .then(res => res.ok ? res.json() : Promise.reject(`Failed to fetch ${item.path}`))
                                .then((data: GitHubFileContent) => ({
                                    path: data.path,
                                    content: data.content ? atob(data.content) : ''
                                }))
                                .catch(err => {
                                    console.warn(err);
                                    return { path: item.path, content: '' };
                                })
                        );
                    }
                }
            };
            
            if (Array.isArray(docsContents)) {
                processContents(docsContents);
            }
    
            const files = await Promise.all(fileFetchPromises);
            for (const file of files) {
                if (file.content) {
                    combinedContent += `// / ${file.path} / //\n${file.content}\n\n---\n\n`;
                }
            }
        }
    } catch (e) {
         console.warn("Could not fetch /docs folder", e);
    }
    
    if (!combinedContent) {
        throw new Error('Could not find a README.md or a /docs folder in this repository.');
    }

    return combinedContent.trim();
};