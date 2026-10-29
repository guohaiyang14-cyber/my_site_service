export interface Project {
  id: number;
  slug: string;
  title: string;
  summary: string;
  techStack: string[];
  repoUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
  createdAt: string;
}

export interface ProjectInput {
  slug: string;
  title: string;
  summary?: string;
  techStack?: string[];
  repoUrl?: string | null;
  demoUrl?: string | null;
  featured?: boolean;
}
