import { Router } from 'express';
import quizControllers from '../controllers/quiz';
import { confirmUser, hasAuthorization, requireSignIn, isAdmin } from "../controllers/auth";
const router = Router();
const { createQuiz, submitQuiz, getAllQuiz, deleteQuiz, getSingleQuizIntro, getSingleQuizQuestions, getQuizLeaderBoard }  = quizControllers;

router.post('/newquiz', confirmUser,  requireSignIn, hasAuthorization, createQuiz);

router.post('/submit/:quizId', submitQuiz);

router.get('/quizzes', requireSignIn,  isAdmin, getAllQuiz);

router.delete('/admin/quiz/:quiz', requireSignIn, isAdmin, deleteQuiz);
router.get('/quiz/:quizId', getSingleQuizIntro);
router.get('/quiz/:quizId/take', getSingleQuizQuestions );

router.post('/quiz/:quizId/leaderboard', getQuizLeaderBoard);

export default router;