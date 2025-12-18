// ============================================
// GITHUB TYPES
// ============================================

export interface GitHubConnectionStatus {
  connected: boolean;
  installationId?: string;
  organizationName?: string;
  installationUrl?: string;
}

export interface GitHubRepo {
  id: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  cloneUrl: string;
  defaultBranch: string;
  private: boolean;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  htmlUrl: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
}

export interface GitHubBranch {
  name: string;
  sha: string;
  protected: boolean;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  htmlUrl: string;
  state: "open" | "closed" | "merged";
  headBranch: string;
  baseBranch: string;
  mergedAt?: string;
}

export interface FileDiff {
  filename: string;
  status: "added" | "removed" | "modified" | "renamed";
  additions: number;
  deletions: number;
  patch?: string;
}
