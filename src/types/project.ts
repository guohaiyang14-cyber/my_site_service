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
  authorId: number | null;
}
