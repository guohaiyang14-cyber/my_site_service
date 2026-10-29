import { prisma } from '../utils/prisma.js';
import { Prisma } from '../generated/prisma/index.js';
import { createProjectSchema, updateProjectSchema } from '../schemas/project.schema.js';
import type { Project } from '../types/project.js';

// 辅助函数：将数据库返回的对象转为业务期望的类型
function mapToProject(dbProject: any): Project {
  let parsedTechStack: string[] = [];
  try {
    parsedTechStack = JSON.parse(dbProject.techStack);
  } catch {
    parsedTechStack = [];
  }
  return {
    ...dbProject,
    summary: dbProject.summary || '', // 兜底空字符串
    techStack: parsedTechStack,
    createdAt: dbProject.createdAt.toISOString(),
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

export const createProject = async (payload: unknown) => {
  // 1. Zod 统一校验
  const result = createProjectSchema.safeParse(payload);
  if (!result.success) {
    const details = result.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
    return { details };
  }

  const data = result.data;

  // 2. 常规查重
  const existing = await prisma.project.findUnique({ where: { slug: data.slug } });
  if (existing) return { details: ['slug: already exists'] };

  // 3. 写入并捕获并发冲突
  try {
    const newProject = await prisma.project.create({
      data: {
        ...data,
        techStack: JSON.stringify(data.techStack),
      },
    });
    return { project: mapToProject(newProject) };
  } catch (error) {
    // P2002: 唯一索引冲突（处理并发情况）
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { details: ['slug: already exists'] };
    }
    throw error;
  }
};

export const updateProject = async (slug: string, payload: unknown) => {
  // 1. Zod 统一校验
  const result = updateProjectSchema.safeParse(payload);
  if (!result.success) {
    const details = result.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
    return { details };
  }

  const data = result.data;

  // 2. 检查原数据是否存在
  const existing = await getProjectBySlug(slug);
  if (!existing) return { notFound: true };

  // 3. 如果修改了 slug，检查新 slug 是否冲突
  if (data.slug && data.slug !== slug) {
    const conflict = await prisma.project.findUnique({ where: { slug: data.slug } });
    if (conflict) return { details: ['slug: already exists'] };
  }

  // 4. 执行更新并捕获并发冲突
  try {
    // 将 techStack 单独解构出来，避免直接用 ...data 导致类型冲突
    const { techStack, ...restData } = data;
    const updatedProject = await prisma.project.update({
      where: { slug },
      data: {
        ...restData,
        // 只有 techStack 存在时才进行序列化，否则不传这个字段
        ...(techStack ? { techStack: JSON.stringify(techStack) } : {}),
      },
    });
    return { project: mapToProject(updatedProject) };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return { notFound: true }; // 记录不存在
      if (error.code === 'P2002') return { details: ['slug: already exists'] }; // 并发唯一冲突
    }
    throw error;
  }
};

export const deleteProject = async (slug: string) => {
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
