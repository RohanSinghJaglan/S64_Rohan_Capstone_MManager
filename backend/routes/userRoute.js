import express from 'express';
import { loginUser, registerUser } from '../controllers/userController.js';
import upload from '../middleware/multer.js';
import authUser from '../middleware/authUser.js';
import  {googleAuthCallback} 
const userRouter = express.Router();

userRouter.post("/register", registerUser)
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile)
userRouter.post("/login", loginUser)
// Google OAuth routes
userRouter.get('/auth/google', passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
}));

userRouter.get('/auth/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: '/login?error=Google authentication failed',
        session: false
    }),
    googleAuthCallback
);

export default userRouter;