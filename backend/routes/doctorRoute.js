import express from 'express';
import { loginDoctor, appointmentsDoctor, appointmentCancel, doctorList, changeAvailablity, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile } from '../controllers/doctorController.js';
import authDoctor from '../middleware/authDoctor.js';
const doctorRouter = express.Router();
doctorRouter.post("/login", loginDoctor)
export default doctorRouter