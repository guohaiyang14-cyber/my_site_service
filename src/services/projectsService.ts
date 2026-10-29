import { findAll, findBySlug, insert, removeBySlug, updateBySlug } from '../data/projects.js';
import type { Project, ProjectInput } from '../types/project.js';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_RE = /^https?:\/\/[^\s]+$/;

export interface ProjectValidationError {
  details: string[];
}

export const listProjects = (featured?: boolean): Project[] => {
  return findAll({ featured });
};

export const getProjectBySlug = (slug: string): Project | undefined => {
  return findBySlug(slug);
};

export const createProject = (payload: ProjectInput): { project: Project } | ProjectValidationError => {
  const slug = typeof payload.slug === 'string' ? payload.slug.trim().toLowerCase() : '';
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const summary = typeof payload.summary === 'string' ? payload.summary.trim() : '';
  const techStack = Array.isArray(payload.techStack)
    ? payload.techStack.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
    : [];
  const repoUrl = payload.repoUrl ?? null;
  const demoUrl = payload.demoUrl ?? null;
  const featured = payload.featured === true;

  const details: string[] = [];

  if (!SLUG_RE.test(slug)) {
    details.push('slug must be kebab-case (e.g. "my-project")');
  }
  if (!title) {
    details.push('title is required');
  }
  if (techStack.length === 0) {
    details.push('techStack must be a non-empty array');
  }
  if (repoUrl !== null && !URL_RE.test(repoUrl)) {
    details.push('repoUrl must be a valid http(s) URL');
  }
  if (demoUrl !== null && !URL_RE.test(demoUrl)) {
    details.push('demoUrl must be a valid http(s) URL');
  }
  if (findBySlug(slug)) {
    details.push('slug already exists');
  }

  if (details.length > 0) {
    return { details };
  }

  return { project: insert({ slug, title, summary, techStack, repoUrl, demoUrl, featured }) };
};

export const updateProject = (
  slug: string,
  payload: Partial<ProjectInput>
): { project: Project } | ProjectValidationError | { notFound: true } => {
  const existing = findBySlug(slug);

  if (!existing) {
    return { notFound: true };
  }

  const nextSlug =
    typeof payload.slug === 'string' ? payload.slug.trim().toLowerCase() : existing.slug;
  const title = typeof payload.title === 'string' ? payload.title.trim() : existing.title;
  const summary =
    payload.summary === undefined ? existing.summary : payload.summary.trim();
  const techStack = Array.isArray(payload.techStack)
    ? payload.techStack.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
    : existing.techStack;
  const repoUrl = payload.repoUrl ?? existing.repoUrl;
  const demoUrl = payload.demoUrl ?? existing.demoUrl;
  const featured = payload.featured ?? existing.featured;

  const details: string[] = [];

  if (nextSlug !== existing.slug && !SLUG_RE.test(nextSlug)) {
    details.push('slug must be kebab-case (e.g. "my-project")');
  }
  if (!title) {
    details.push('title is required');
  }
  if (techStack.length === 0) {
    details.push('techStack must be a non-empty array');
  }
  if (repoUrl !== null && !URL_RE.test(repoUrl)) {
    details.push('repoUrl must be a valid http(s) URL');
  }
  if (demoUrl !== null && !URL_RE.test(demoUrl)) {
    details.push('demoUrl must be a valid http(s) URL');
  }
  if (nextSlug !== existing.slug && findBySlug(nextSlug)) {
    details.push('slug already exists');
  }

  if (details.length > 0) {
    return { details };
  }

  const updatedProject = updateBySlug(slug, {
    slug: nextSlug,
    title,
    summary,
    techStack,
    repoUrl,
    demoUrl,
    featured,
  });

  if (!updatedProject) {
    return { notFound: true };
  }

  return { project: updatedProject };
};

export const deleteProject = (slug: string): { project: Project } | { notFound: true } => {
  const project = findBySlug(slug);

  if (!project) {
    return { notFound: true };
  }

  const removed = removeBySlug(slug);

  if (!removed) {
    return { notFound: true };
  }

  return { project: removed };
};
