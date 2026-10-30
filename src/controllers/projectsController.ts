import { Request, Response, NextFunction } from 'express';
import * as projectsService from '../services/projectsService.js';

export interface AuthRequest extends Request {
  user?: { userId: number; email: string };
}

const getSlugParam = (req: Request): string => {
  const slug = req.params.slug;
  return Array.isArray(slug) ? slug[0] : slug;
};

/**
 * GET /api/projects
 * 获取项目列表（支持 featured 过滤）
 */
export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 解析 query 参数
    const featured =
      req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;

    const projects = await projectsService.listProjects(featured);
    res.status(200).json({ data: projects });
  } catch (err) {
    next(err); // 未知异常（如 DB 断开），交给全局 errorHandler
  }
};

/**
 * GET /api/projects/:slug
 * 获取单个项目详情
 */
export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = getSlugParam(req);
    const project = await projectsService.getProjectBySlug(slug);

    if (!project) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: '项目不存在' },
      });
    }

    res.status(200).json({ data: project });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/projects
 * 创建新项目
 */
export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '未登录' } });
    }
    const result = await projectsService.createProject(req.body, req.user!.userId);

    // 1. Service 返回了业务校验错误
    if ('details' in result) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '请求体无效',
          details: result.details,
        },
      });
    }

    // 2. 创建成功
    res.status(201).location(`/api/projects/${result.project.slug}`).json({ data: result.project });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/projects/:slug
 * 更新项目信息
 */
export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const slug = getSlugParam(req);
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '未登录' } });
    }
    const result = await projectsService.updateProject(slug, req.body, req.user!.userId);

    // 1. 找不到对应项目
    if ('notFound' in result) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: '项目不存在' },
      });
    }

    // 2. 业务校验错误
    if ('details' in result) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '请求体无效',
          details: result.details,
        },
      });
    }

    if ('forbidden' in result) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: '无权操作他人的项目' } });
    }

    // 3. 更新成功
    res.status(200).json({ data: result.project });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/projects/:slug
 * 删除项目
 */
export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const slug = getSlugParam(req);
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '未登录' } });
    }
    const result = await projectsService.deleteProject(slug, req.user!.userId);

    // 找不到对应项目
    if ('notFound' in result) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: '项目不存在' },
      });
    }

    if ('forbidden' in result) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: '无权操作他人的项目' } });
    }

    // 删除成功（返回被删除的数据，方便前端做缓存剔除）
    res.status(200).json({ data: result.project });
  } catch (err) {
    next(err);
  }
};
