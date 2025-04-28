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



  
};



  export default resolvers; 