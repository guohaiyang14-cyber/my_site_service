import { Router } from 'express';
import * as controller from '../controllers/projectsController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router: ReturnType<typeof Router> = Router();

router.get('/', controller.list);
router.get('/:slug', controller.getOne);
router.post('/', requireAuth, controller.create);
router.put('/:slug', requireAuth, controller.update);
router.delete('/:slug', requireAuth, controller.remove);

export default router;
