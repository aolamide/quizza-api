import { Router } from 'express';
import { getStats } from '../controllers/admin';
import { requireSignIn, tokenValid, isAdmin, deleteUser} from '../controllers/auth';

const router = Router();

router.get('/stats', requireSignIn, isAdmin, getStats);
router.delete('/user/:user', requireSignIn, isAdmin, deleteUser);

export default router;