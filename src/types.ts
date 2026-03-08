import { type GitHubItem } from "@/lib/github";

export type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;

export interface SavedRepo {
  url: string;
  name: string;
  owner: string;
  repo: string;
}

export interface Tab {
  item: GitHubItem;
  content?: string;
  loading?: boolean;
  error?: string;
}

