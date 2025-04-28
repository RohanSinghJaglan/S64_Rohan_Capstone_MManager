import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import { razorpay } from '../config/services.js';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

// Generate JWT token
const generateToken = (userId) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return { token, refreshToken };
};

// Check authentication context
const checkAuth = (context) => {
  const { user } = context;
  if (!user) {
    throw new Error('Authentication required. Please log in.');
  }
  return user;
};

const resolvers = {
  Query: {
    // User queries
    getProfile: async (_, __, context) => {
      const user = checkAuth(context);
      return await userModel.findById(user.userId);
    },
    
    getAppointments: async (_, __, context) => {
      const user = checkAuth(context);
      return await appointmentModel.find({ userId: user.userId })
        .populate('userId')
        .populate('doctorId')
        .sort({ createdAt: -1 });
    },
    
    // Doctor queries
    getDoctors: async () => {
      return await doctorModel.find({ isAvailable: true });
    },
    
    getDoctor: async (_, { id }) => {
      return await doctorModel.findById(id);
    },
    
    // Admin queries
    getAllAppointments: async (_, __, context) => {
      const user = checkAuth(context);
      
      // Check if user is admin
      const userDoc = await userModel.findById(user.userId);
      if (userDoc.role !== 'admin') {
        throw new Error('Not authorized');
      }
      
      return await appointmentModel.find()
        .populate('userId')
        .populate('doctorId')
        .sort({ createdAt: -1 });
    },
    
    getDashboardStats: async (_, __, context) => {
      const user = checkAuth(context);
      
      // Check if user is admin
      const userDoc = await userModel.findById(user.userId);
      if (userDoc.role !== 'admin') {
        throw new Error('Not authorized');
      }
      
      const totalDoctors = await doctorModel.countDocuments();
      const totalAppointments = await appointmentModel.countDocuments({ cancelled: false });
      
      // Get total revenue from completed appointments
      const appointments = await appointmentModel.find({ 
        payment: true, 
        cancelled: false 
      });
      
      const totalRevenue = appointments.reduce((sum, appointment) => sum + appointment.amount, 0);
      
      // Get recent appointments
      const recentAppointments = await appointmentModel.find()
        .populate('userId')
        .populate('doctorId')
        .sort({ createdAt: -1 })
        .limit(5);
      
      return {
        totalDoctors,
        totalAppointments,
        totalRevenue,
        recentAppointments
      };
    }
  },


  Mutation: {
    // Auth mutations
    registerUser: async (_, { input }) => {
      const { name, email, password, phone, address } = input;
      
      // Check if user already exists
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user
      const newUser = new userModel({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: 'user'
      });
      
      const user = await newUser.save();
      
      // Generate tokens
      const { token, refreshToken } = generateToken(user._id);
      
      return {
        user,
        token,
        refreshToken
      };
    },
    
    loginUser: async (_, { input }) => {
      const { email, password } = input;
      
      // Find user
      const user = await userModel.findOne({ email });
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new Error('Invalid email or password');
      }
      
      // Generate tokens
      const { token, refreshToken } = generateToken(user._id);
      
      return {
        user,
        token,
        refreshToken
      };
    },
    
    refreshToken: async (_, { token }) => {
      try {
        // Verify the refresh token
        const decoded = jwt.verify(
          token,
          process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );
        
        // Generate a new access token
        return jwt.sign(
          { userId: decoded.userId },
          process.env.JWT_SECRET,
          { expiresIn: '1d' }
        );
      } catch (error) {
        throw new Error('Invalid or expired refresh token');
      }
    },
    
    // Appointment mutations
    bookAppointment: async (_, { input }, context) => {
      const user = checkAuth(context);
      const { doctorId, slotDate, slotTime, problem } = input;
      
      // Check if doctor exists
      const doctor = await doctorModel.findById(doctorId);
      if (!doctor) {
        throw new Error('Doctor not found');
      }
      
      // Check if slot is available
      const existingAppointment = await appointmentModel.findOne({
        doctorId,
        slotDate,
        slotTime,
        cancelled: false
      });
      
      if (existingAppointment) {
        throw new Error('This slot is already booked');
      }
      
      // Create new appointment
      const newAppointment = new appointmentModel({
        userId: user.userId,
        doctorId,
        slotDate,
        slotTime,
        problem,
        payment: false,
        amount: doctor.fees,
        cancelled: false,
        status: 'pending'
      });
      
      const appointment = await newAppointment.save();



}
}};



  export default resolvers; 