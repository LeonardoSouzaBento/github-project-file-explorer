export interface GitHubItem {
  name: string;
  path: string;
  type: "file" | "dir";
  sha: string;
  size: number;
  download_url: string | null;
  children?: GitHubItem[];
  content?: string;
}

export function parseRepoUrl(
  url: string
): { owner: string; repo: string } | null {
  // Support formats: https://github.com/owner/repo, github.com/owner/repo, owner/repo
  const patterns = [
    /github\.com\/([^/]+)\/([^/\s#?]+)/,
    /^([^/\s]+)\/([^/\s]+)$/,
  ];

  for (const pattern of patterns) {
    const match = url
      .trim()
      .replace(/\.git$/, "")
      .match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
  }
  return null;
}

async function fetchContents(
  owner: string,
  repo: string,
  path: string = "",
  token: string
): Promise<GitHubItem[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  const resp = await fetch(url, { headers });
  if (!resp.ok) throw new Error(`Failed to fetch ${path}: ${resp.statusText}`);
  return resp.json();
}

export async function fetchDirectoryContents(
  owner: string,
  repo: string,
  path: string = "",
  token: string,
  onProgress?: (msg: string) => void
): Promise<GitHubItem[]> {
  onProgress?.(`Buscando ${path || "/"} ...`);
  const items = await fetchContents(owner, repo, path, token);

  const results: GitHubItem[] = [];

  for (const item of items) {
    if (item.type === "dir") {
      const children = await fetchDirectoryContents(
        owner,
        repo,
        item.path,
        token,
        onProgress
      );
      results.push({ ...item, children });
    } else {
      results.push(item);
    }
  }

  return results.sort((a, b) => {
    if (a.type === "dir" && b.type !== "dir") return -1;
    if (a.type !== "dir" && b.type === "dir") return 1;
    return a.name.localeCompare(b.name);
  });
}

export async function fetchInitialFiles(
  owner: string,
  repo: string,
  token: string,
  onProgress?: (msg: string) => void
): Promise<GitHubItem[]> {
  onProgress?.("Buscando estrutura inicial do repositório...");
  const rootItems = await fetchContents(owner, repo, "", token);

  const priorityDirs = [
    "src",
    "source",
    "app",
    "client",
    "front-end",
    "frontend",
  ];
  const results: GitHubItem[] = [];
  const promises: Promise<void>[] = [];

  for (const item of rootItems) {
    if (item.type === "dir" && priorityDirs.includes(item.name.toLowerCase())) {
      promises.push(
        (async () => {
          const children = await fetchDirectoryContents(
            owner,
            repo,
            item.path,
            token,
            onProgress
          );
          results.push({ ...item, children });
        })()
      );
    } else {
      results.push(item);
    }
  }

  await Promise.all(promises);

  return results.sort((a, b) => {
    if (a.type === "dir" && b.type !== "dir") return -1;
    if (a.type !== "dir" && b.type === "dir") return 1;
    return a.name.localeCompare(b.name);
  });
}

export async function fetchFileContent(
  url: string,
  token: string
): Promise<string> {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }
  const resp = await fetch(url, { headers });
  if (!resp.ok) throw new Error("Failed to fetch file content");
  return resp.text();
}

export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    sass: "sass",
    less: "less",
    json: "json",
    md: "markdown",
    py: "python",
    rb: "ruby",
    java: "java",
    go: "go",
    rs: "rust",
    c: "c",
    cpp: "cpp",
    h: "c",
    hpp: "cpp",
    sh: "bash",
    bash: "bash",
    yml: "yaml",
    yaml: "yaml",
    xml: "xml",
    svg: "xml",
    sql: "sql",
    graphql: "graphql",
    vue: "html",
    php: "php",
    swift: "swift",
    kt: "kotlin",
    dart: "dart",
    toml: "toml",
    ini: "ini",
    dockerfile: "dockerfile",
    makefile: "makefile",
  };
  return map[ext] || "text";
}

export function getFileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    js: "🟨",
    jsx: "⚛️",
    ts: "🔷",
    tsx: "⚛️",
    html: "🌐",
    css: "🎨",
    scss: "🎨",
    json: "📋",
    md: "📝",
    py: "🐍",
    svg: "🖼️",
    png: "🖼️",
    jpg: "🖼️",
    gif: "🖼️",
    ico: "🖼️",
    lock: "🔒",
    env: "🔐",
    gitignore: "🚫",
  };
  return map[ext] || "📄";
}
