export interface GitHubFile {
  title: string;
  content: string;
  author?: string;
  description?: string;
}

export interface GitHubFolderResult {
  markdownFiles: GitHubFile[];
  totalFound: number;
  errors: string[];
}

export interface GitHubTutorialResult {
  title: string;
  description?: string;
  chapters: Array<{
    title: string;
    content: string;
    order: number;
    readTime: number;
  }>;
  author?: string;
  totalReadTime: number;
  errors: string[];
}

export function extractTitleFromMarkdown(content: string): string {
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('# ')) {
      return trimmedLine.substring(2).trim();
    }
  }
  
  return 'Untitled Tutorial';
}

export function extractDescription(content: string): string {
  const lines = content.split('\n');
  let foundTitle = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('# ')) {
      foundTitle = true;
      continue;
    }
    
    if (foundTitle && trimmedLine && !trimmedLine.startsWith('#')) {
      return trimmedLine.length > 200 ? trimmedLine.substring(0, 200) + '...' : trimmedLine;
    }
  }
  
  return '';
}

export function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function convertGitHubUrlToRaw(url: string): string {
  if (url.includes('github.com') && url.includes('/blob/')) {
    return url
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/');
  }
  
  if (url.includes('raw.githubusercontent.com')) {
    return url;
  }
  
  throw new Error('Invalid GitHub URL format');
}

export function convertGitHubUrlToApi(url: string): string {
  // Convert GitHub tree URL to API URL
  // From: https://github.com/user/repo/tree/branch/path
  // To: https://api.github.com/repos/user/repo/contents/path?ref=branch
  
  const githubPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/(.+)$/;
  const match = url.match(githubPattern);
  
  if (match) {
    const [, owner, repo, branch, path] = match;
    return `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  }
  
  throw new Error('Invalid GitHub tree URL format');
}

export function parseGitHubUrl(url: string): { owner: string; repo: string; branch: string; path: string } {
  const githubPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/(.+)$/;
  const match = url.match(githubPattern);
  
  if (match) {
    const [, owner, repo, branch, path] = match;
    return { owner, repo, branch, path };
  }
  
  throw new Error('Invalid GitHub tree URL format');
}

async function fetchDirectoryContents(apiUrl: string): Promise<any[]> {
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch directory: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

async function fetchMarkdownContent(downloadUrl: string, fileName: string): Promise<GitHubFile | null> {
  try {
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${fileName}: ${response.status}`);
    }
    
    const content = await response.text();
    
    if (!content.trim()) {
      return null;
    }
    
    const title = extractTitleFromMarkdown(content) || fileName.replace('.md', '');
    const description = extractDescription(content);
    
    return {
      title,
      content,
      description
    };
  } catch (error) {
    throw new Error(`Error fetching ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractFolderName(url: string): string {
  const match = url.match(/\/([^\/]+)(?:\/tree\/[^\/]+\/(.+))?$/);
  if (match) {
    return match[2] ? match[2].split('/').pop() || match[1] : match[1];
  }
  return 'Tutorial';
}

function organizeFilesIntoChapters(files: GitHubFile[]): Array<{title: string, content: string, order: number, readTime: number}> {
  // Sort files by path and name to ensure logical order
  const sortedFiles = files.sort((a, b) => {
    // Extract chapter numbers or use alphabetical order
    const getOrder = (title: string) => {
      const match = title.match(/(\d+)/);
      return match ? parseInt(match[1]) : 999;
    };
    
    return getOrder(a.title) - getOrder(b.title);
  });

  return sortedFiles.map((file, index) => ({
    title: file.title,
    content: file.content,
    order: index + 1,
    readTime: estimateReadTime(file.content)
  }));
}

export async function fetchGitHubTutorial(url: string): Promise<GitHubTutorialResult> {
  const result: GitHubTutorialResult = {
    title: '',
    chapters: [],
    totalReadTime: 0,
    errors: []
  };

  try {
    const { owner } = parseGitHubUrl(url);
    const folderResult = await fetchGitHubFolder(url);
    
    if (folderResult.markdownFiles.length === 0) {
      throw new Error('No markdown files found in the specified directory');
    }

    // Set tutorial title from folder name
    result.title = extractFolderName(url).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    result.author = owner;
    result.errors = folderResult.errors;

    // Organize files into chapters
    result.chapters = organizeFilesIntoChapters(folderResult.markdownFiles);
    
    // Calculate total read time
    result.totalReadTime = result.chapters.reduce((total, chapter) => total + chapter.readTime, 0);

    // Generate description from first chapter
    if (result.chapters.length > 0) {
      result.description = extractDescription(result.chapters[0].content);
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`GitHub tutorial processing error: ${error.message}`);
    }
    throw new Error('Unknown error occurred while processing GitHub tutorial');
  }
}

export async function fetchGitHubFolder(url: string): Promise<GitHubFolderResult> {
  const result: GitHubFolderResult = {
    markdownFiles: [],
    totalFound: 0,
    errors: []
  };

  try {
    const { owner, repo } = parseGitHubUrl(url);
    const apiUrl = convertGitHubUrlToApi(url);
    
    async function scanDirectory(currentApiUrl: string, currentPath: string = ''): Promise<void> {
      try {
        const contents = await fetchDirectoryContents(currentApiUrl);
        
        for (const item of contents) {
          if (item.type === 'file' && item.name.endsWith('.md')) {
            try {
              const markdownFile = await fetchMarkdownContent(item.download_url, item.name);
              if (markdownFile) {
                markdownFile.author = owner;
                result.markdownFiles.push(markdownFile);
                result.totalFound++;
              }
            } catch (error) {
              result.errors.push(`${currentPath}/${item.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          } else if (item.type === 'dir') {
            const subDirUrl = currentApiUrl.replace(/\?.*$/, '') + `/${item.name}` + (currentApiUrl.includes('?') ? `?${currentApiUrl.split('?')[1]}` : '');
            await scanDirectory(subDirUrl, `${currentPath}/${item.name}`);
          }
        }
      } catch (error) {
        result.errors.push(`Directory ${currentPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    await scanDirectory(apiUrl);
    
    if (result.markdownFiles.length === 0 && result.errors.length === 0) {
      throw new Error('No markdown files found in the specified directory');
    }
    
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`GitHub folder scan error: ${error.message}`);
    }
    throw new Error('Unknown error occurred while scanning GitHub folder');
  }
}

export async function fetchGitHubMarkdown(url: string): Promise<GitHubFile> {
  try {
    const rawUrl = convertGitHubUrlToRaw(url);
    
    const response = await fetch(rawUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch markdown: ${response.status} ${response.statusText}`);
    }
    
    const content = await response.text();
    
    if (!content.trim()) {
      throw new Error('The markdown file appears to be empty');
    }
    
    const title = extractTitleFromMarkdown(content);
    const description = extractDescription(content);
    
    const repoMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    const author = repoMatch ? repoMatch[1] : undefined;
    
    return {
      title,
      content,
      author,
      description
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`GitHub fetch error: ${error.message}`);
    }
    throw new Error('Unknown error occurred while fetching from GitHub');
  }
}