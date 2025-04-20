import express from 'express';
import { loginUser, registerUser } from '../controllers/userController.js';
import upload from '../middleware/multer.js';
import authUser from '../middleware/authUser.js';
const userRouter = express.Router();

userRouter.post("/register", registerUser)
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile)
userRouter.post("/login", loginUser)


export default userRouter;