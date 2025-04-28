import otpService from '../services/otpService.js';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (userId) => {
    const accessToken = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
    
    const refreshToken = jwt.sign(
        { id: userId },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: '60d' }
    );
    
    return { accessToken, refreshToken };
};

// Send OTP for phone verification
export const sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        // Check if user exists with this phone number
        const user = await userModel.findOne({ phone });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with this phone number'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        
        // Send OTP via MSG91
        const result = await otpService.sendOTP(phone, otp);

        if (result.success) {
            // Store OTP with timestamp and userId
            otpStore.set(phone, {
                otp,
                timestamp: Date.now(),
                attempts: 0,
                userId: user._id
            });

            res.status(200).json({
                success: true,
                message: 'OTP sent successfully'
            });
        } else {
            console.error('Failed to send OTP:', result.error);
            res.status(500).json({
                success: false,
                message: result.error || 'Failed to send OTP'
            });
        }
    } catch (error) {
        console.error('Error in sendOTP controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send OTP'
        });
    }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and OTP are required'
            });
        }

        const storedData = otpStore.get(phone);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: 'No OTP found for this number'
            });
        }

        // Check if OTP is expired (5 minutes)
        if (Date.now() - storedData.timestamp > 5 * 60 * 1000) {
            otpStore.delete(phone);
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        // Verify OTP
        if (storedData.otp !== otp) {
            storedData.attempts += 1;
            
            if (storedData.attempts >= 3) {
                otpStore.delete(phone);
                return res.status(400).json({
                    success: false,
                    message: 'Too many failed attempts. Please request a new OTP'
                });
            }

            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Find user by phone number
        const user = await userModel.findOne({ phone }).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateToken(user._id);

        // OTP verified successfully
        otpStore.delete(phone);

        // Set cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 24 * 60 * 60 * 1000 // 60 days
        });

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            accessToken,
            refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP'
        });
    }
};

// Resend OTP
export const resendOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        const storedData = otpStore.get(phone);

        // Check if previous OTP exists and is not expired
        if (storedData && Date.now() - storedData.timestamp < 60 * 1000) {
            return res.status(400).json({
                success: false,
                message: 'Please wait 1 minute before requesting a new OTP'
            });
        }

        // Generate and send new OTP
        const otp = generateOTP();
        
        otpStore.set(phone, {
            otp,
            timestamp: Date.now(),
            attempts: 0
        });

        const result = await otpService.sendOTP(phone, otp);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'New OTP sent successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to resend OTP'
            });
        }
    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend OTP'
        });
    }
};

// Login with OTP
export const loginWithOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        // Find user by phone number
        const user = await userModel.findOne({ phone });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        
        // Store OTP with timestamp
        otpStore.set(phone, {
            otp,
            timestamp: Date.now(),
            attempts: 0
        });

        // Send OTP
        const result = await otpService.sendOTP(phone, otp);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'OTP sent successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP'
            });
        }
    } catch (error) {
        console.error('Error in login with OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process login request'
        });
    }
};

export default {
    sendOTP,
    verifyOTP,
    resendOTP,
    loginWithOTP
}; 