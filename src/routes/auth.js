import express from "express";
import { signUp, signIn, forgotPassword, confirmResetLink, updatePassword, getAllUsers, adminSignIn, requireSignIn, tokenValid, isAdmin, sendVerificationMail, confirmVerification} from "../controllers/auth";
import validate from '../validation';
const router = express.Router();

router.post('/register', validate, signUp );
router.post('/login', signIn);
router.post('/admin/login', adminSignIn);
router.post('/sendVerify', requireSignIn, tokenValid, sendVerificationMail);
router.put('/verify', confirmVerification);
router.post('/forgotPassword', forgotPassword);
router.get('/reset', confirmResetLink);
router.put('/updatePassword', updatePassword);
router.get('/users', requireSignIn, tokenValid, isAdmin, getAllUsers);



export default router;