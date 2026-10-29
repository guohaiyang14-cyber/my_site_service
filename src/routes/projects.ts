import { Router } from 'express';
import * as controller from '../controllers/projectsController.js';

const router = Router();

router.get('/', controller.list);
router.get('/:slug', controller.getOne);
router.post('/', controller.create);
router.put('/:slug', controller.update);
router.delete('/:slug', controller.remove);

export default router;
