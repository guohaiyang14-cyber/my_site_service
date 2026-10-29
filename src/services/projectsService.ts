import { prisma } from '../utils/prisma.js';
import { Prisma } from '../generated/prisma/index.js';
import type { Project, ProjectInput } from '../types/project.js';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_RE = /^https?:\/\/[^\s]+$/;

export interface ProjectValidationError {
  details: string[];
}

// 辅助函数：将数据库返回的对象转为业务期望的类型（主要处理 techStack 的反序列化）
function mapToProject(dbProject: any): Project {
  let parsedTechStack: string[] = [];
  try {
    parsedTechStack = JSON.parse(dbProject.techStack);
  } catch {
    parsedTechStack = []; // 兜底，防止脏数据导致整个 API 崩溃
  }
  return {
    ...dbProject,
    summary: dbProject.summary || '',
    techStack: parsedTechStack,
  };
}

export const listProjects = async (featured?: boolean): Promise<Project[]> => {
  const projects = await prisma.project.findMany({
    where: featured !== undefined ? { featured } : {},
    orderBy: { createdAt: 'desc' },
  });
  return projects.map(mapToProject);
};

export const getProjectBySlug = async (slug: string): Promise<Project | undefined> => {
  const project = await prisma.project.findUnique({ where: { slug } });
  return project ? mapToProject(project) : undefined;
};

export const createProject = async (
  payload: ProjectInput
): Promise<{ project: Project } | ProjectValidationError> => {
  const slug = typeof payload.slug === 'string' ? payload.slug.trim().toLowerCase() : '';
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const summary = typeof payload.summary === 'string' ? payload.summary.trim() : '';
  const techStack = Array.isArray(payload.techStack)
    ? payload.techStack.filter(
        (item): item is string => typeof item === 'string' && item.trim() !== ''
      )
    : [];
  const repoUrl = payload.repoUrl ?? null;
  const demoUrl = payload.demoUrl ?? null;
  const featured = payload.featured === true;

  const details: string[] = [];

  if (!SLUG_RE.test(slug)) details.push('slug must be kebab-case (e.g. "my-project")');
  if (!title) details.push('title is required');
  if (techStack.length === 0) details.push('techStack must be a non-empty array');
  if (repoUrl !== null && !URL_RE.test(repoUrl))
    details.push('repoUrl must be a valid http(s) URL');
  if (demoUrl !== null && !URL_RE.test(demoUrl))
    details.push('demoUrl must be a valid http(s) URL');

  // 查询数据库检查是否重复
  const existing = await prisma.project.findUnique({ where: { slug } });
  if (existing) details.push('slug already exists');

  if (details.length > 0) return { details };

  try {
    const newProject = await prisma.project.create({
      data: {
        slug,
        title,
        summary,
        techStack: JSON.stringify(techStack), // 序列化入库
        repoUrl,
        demoUrl,
        featured,
      },
    });
    return { project: mapToProject(newProject) };
  } catch (error) {
    // 应对并发冲突：如果刚好在这一瞬间被别人插入了，触发 P2002 唯一索引报错
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { details: ['slug already exists'] };
    }
    throw error;
  }
};

export const updateProject = async (
  slug: string,
  payload: Partial<ProjectInput>
): Promise<{ project: Project } | ProjectValidationError | { notFound: true }> => {
  const existing = await getProjectBySlug(slug);
  if (!existing) return { notFound: true };

  const nextSlug =
    typeof payload.slug === 'string' ? payload.slug.trim().toLowerCase() : existing.slug;
  const title = typeof payload.title === 'string' ? payload.title.trim() : existing.title;
  const summary = payload.summary === undefined ? existing.summary : payload.summary.trim();
  const techStack = Array.isArray(payload.techStack)
    ? payload.techStack.filter(
        (item): item is string => typeof item === 'string' && item.trim() !== ''
      )
    : existing.techStack;
  const repoUrl = payload.repoUrl ?? existing.repoUrl;
  const demoUrl = payload.demoUrl ?? existing.demoUrl;
  const featured = payload.featured ?? existing.featured;

  const details: string[] = [];

  if (nextSlug !== existing.slug && !SLUG_RE.test(nextSlug)) {
    details.push('slug must be kebab-case (e.g. "my-project")');
  }
  if (!title) details.push('title is required');
  if (techStack.length === 0) details.push('techStack must be a non-empty array');
  if (repoUrl !== null && !URL_RE.test(repoUrl))
    details.push('repoUrl must be a valid http(s) URL');
  if (demoUrl !== null && !URL_RE.test(demoUrl))
    details.push('demoUrl must be a valid http(s) URL');

  if (nextSlug !== existing.slug) {
    const conflict = await prisma.project.findUnique({ where: { slug: nextSlug } });
    if (conflict) details.push('slug already exists');
  }

  if (details.length > 0) return { details };

  try {
    const updatedProject = await prisma.project.update({
      where: { slug }, // 用旧 slug 查
      data: {
        slug: nextSlug, // 更新为新 slug
        title,
        summary,
        techStack: JSON.stringify(techStack),
        repoUrl,
        demoUrl,
        featured,
      },
    });
    return { project: mapToProject(updatedProject) };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return { notFound: true };
      if (error.code === 'P2002') return { details: ['slug already exists'] };
    }
    throw error;
  }
};

export const deleteProject = async (
  slug: string
): Promise<{ project: Project } | { notFound: true }> => {
  const existing = await getProjectBySlug(slug);
  if (!existing) return { notFound: true };

  try {
    const removed = await prisma.project.delete({
      where: { slug },
    });
    return { project: mapToProject(removed) };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return { notFound: true };
    }
    throw error;
  }
};
