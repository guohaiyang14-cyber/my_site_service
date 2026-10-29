import type { Project, ProjectInput } from '../types/project.js';

const projects: Project[] = [
  {
    id: 1,
    slug: 'portfolio-v2',
    title: '个人作品集 v2',
    summary: '基于 Next.js + Tailwind 的响应式作品集，支持暗色模式。',
    techStack: ['Next.js', 'Tailwind', 'TypeScript'],
    repoUrl: 'https://github.com/you/portfolio-v2',
    demoUrl: 'https://your.site',
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    slug: 'api-playground',
    title: 'API Playground',
    summary: '一个用来练手 Express 的轻量 API，带内存 CRUD。',
    techStack: ['Node.js', 'Express'],
    repoUrl: null,
    demoUrl: null,
    featured: false,
    createdAt: new Date().toISOString(),
  },
];

let nextId = projects.length + 1;

export const findAll = ({ featured }: { featured?: boolean } = {}): Project[] => {
  if (featured === undefined) {
    return projects;
  }

  return projects.filter((project) => project.featured === featured);
};

export const findBySlug = (slug: string): Project | undefined =>
  projects.find((project) => project.slug === slug);

export const insert = (data: ProjectInput): Project => {
  const project: Project = {
    id: nextId++,
    slug: data.slug,
    title: data.title,
    summary: data.summary ?? '',
    techStack: data.techStack ?? [],
    repoUrl: data.repoUrl ?? null,
    demoUrl: data.demoUrl ?? null,
    featured: data.featured ?? false,
    createdAt: new Date().toISOString(),
  };

  projects.push(project);
  return project;
};

export const updateBySlug = (slug: string, updates: Partial<ProjectInput>): Project | undefined => {
  const index = projects.findIndex((project) => project.slug === slug);

  if (index === -1) {
    return undefined;
  }

  const existing = projects[index];
  const nextProject: Project = {
    ...existing,
    ...updates,
    slug: updates.slug ?? existing.slug,
    title: updates.title ?? existing.title,
    summary: updates.summary ?? existing.summary,
    techStack: updates.techStack ?? existing.techStack,
    repoUrl: updates.repoUrl ?? existing.repoUrl,
    demoUrl: updates.demoUrl ?? existing.demoUrl,
    featured: updates.featured ?? existing.featured,
  };

  projects[index] = nextProject;
  return nextProject;
};

export const removeBySlug = (slug: string): Project | undefined => {
  const index = projects.findIndex((project) => project.slug === slug);

  if (index === -1) {
    return undefined;
  }

  const [removed] = projects.splice(index, 1);
  return removed;
};
