import { Router, type Router as ExpressRouter } from 'express';

import { deleteProject, getProject, getProjects, postProject, putProject } from '../controllers/projectsController.js';

const router: ExpressRouter = Router();

router.get('/', getProjects);
router.get('/:slug', getProject);
router.post('/', postProject);
router.put('/:slug', putProject);
router.delete('/:slug', deleteProject);

export default router;
