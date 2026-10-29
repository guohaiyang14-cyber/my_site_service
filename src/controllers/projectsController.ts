import type { Request, Response } from 'express';

import {
  createProject,
  deleteProject as deleteProjectService,
  getProjectBySlug,
  listProjects,
  updateProject,
} from '../services/projectsService.js';

export const getProjects = (req: Request, res: Response): void => {
  const { featured } = req.query;
  const filter = featured === 'true' ? true : featured === 'false' ? false : undefined;

  res.status(200).json({ data: listProjects(filter) });
};

export const getProject = (req: Request, res: Response): void => {
  const slug = typeof req.params.slug === 'string' ? req.params.slug : '';
  const project = getProjectBySlug(slug);

  if (!project) {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: `Project ${slug} not found` },
    });
    return;
  }

  res.status(200).json({ data: project });
};

export const postProject = (req: Request, res: Response): void => {
  const result = createProject(req.body ?? {});

  if ('details' in result) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        details: result.details,
      },
    });
    return;
  }

  const { project } = result;

  res.status(201).location(`/api/projects/${project.slug}`).json({ data: project });
};

export const putProject = (req: Request, res: Response): void => {
  const slug = typeof req.params.slug === 'string' ? req.params.slug : '';
  const result = updateProject(slug, req.body ?? {});

  if ('notFound' in result) {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: `Project ${slug} not found` },
    });
    return;
  }

  if ('details' in result) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        details: result.details,
      },
    });
    return;
  }

  res.status(200).json({ data: result.project });
};

export const deleteProject = (req: Request, res: Response): void => {
  const slug = typeof req.params.slug === 'string' ? req.params.slug : '';
  const result = deleteProjectService(slug);

  if ('notFound' in result) {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: `Project ${slug} not found` },
    });
    return;
  }

  res.status(200).json({ data: result.project });
};
