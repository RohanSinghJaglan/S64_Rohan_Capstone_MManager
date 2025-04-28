import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from 'cloudinary'
// API to login user
const loginUser = async (req, res) => {
  try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
};

// API to make payment of appointment using razorpay
export const paymentRazorpay = async (req, res) => {
    try {
        // Check if Razorpay is properly initialized
        if (!razorpay) {
            console.error('Razorpay service not initialized. Check environment variables.');
            console.error('RAZORPAY_KEY_ID exists:', !!process.env.RAZORPAY_KEY_ID);
            console.error('RAZORPAY_KEY_SECRET exists:', !!process.env.RAZORPAY_KEY_SECRET);
            
            return res.status(500).json({ 
                success: false, 
                message: 'Payment service not configured properly. Please contact support.' 
            });
        }

        const { appointmentId } = req.body;
        
        if (!appointmentId) {
            console.error('Missing appointmentId in payment request');
            return res.status(400).json({
                success: false,
                message: 'appointmentId is required'
            });
        }

        const appointmentData = await appointmentModel.findById(appointmentId);
        console.log('Appointment data for payment:', appointmentData ? {
            id: appointmentData._id,
            amount: appointmentData.amount,
            cancelled: appointmentData.cancelled
        } : 'Not found');

        if (!appointmentData) {
            return res.status(404).json({ 
                success: false, 
                message: 'Appointment not found' 
            });
        }
        
        if (appointmentData.cancelled) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot process payment for cancelled appointment' 
            });
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY || 'INR',
            receipt: appointmentId.toString(),
        };
        
        console.log('Creating Razorpay order with options:', options);

        // creation of an order
        const order = await razorpay.orders.create(options);
        console.log('Razorpay order created:', order);
        
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error('Razorpay payment error:', error);
        
        // Handle MongoDB cast errors (invalid IDs)
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: `Invalid ${error.path}: ${error.value}`
            });
        }
        
        // Log detailed error information
        if (error.response) {
            console.error('Razorpay API response error:', error.response.data);
        }
        
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Payment service error' 
        });
    }
};

// API to verify payment of razorpay
export const verifyRazorpay = async (req, res) => {
    try {
        // Check if Razorpay is properly initialized
        if (!razorpay) {
            console.error('Razorpay service not initialized during verification');
            return res.status(500).json({ 
                success: false, 
                message: 'Payment service not configured' 
            });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        // Log verification attempt
        console.log('Payment verification attempt:', { 
            razorpay_order_id, 
            razorpay_payment_id, 
            signature_provided: !!razorpay_signature 
        });
        
        if (!razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: 'razorpay_order_id is required'
            });
        }
        
        if (!razorpay_payment_id) {
            return res.status(400).json({
                success: false,
                message: 'razorpay_payment_id is required'
            });
        }
        
        if (!razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'razorpay_signature is required'
            });
        }
        
        try {
            // Fetch order details
            const orderInfo = await razorpay.orders.fetch(razorpay_order_id);
            console.log('Order info from Razorpay:', orderInfo);
            
            // Verify the payment signature
            const generated_signature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(razorpay_order_id + "|" + razorpay_payment_id)
                .digest('hex');
            
            const isSignatureValid = generated_signature === razorpay_signature;
            console.log('Signature validation:', {
                isValid: isSignatureValid,
                orderStatus: orderInfo.status
            });

            if (isSignatureValid && orderInfo.status === 'paid') {
                // Update appointment to mark payment as complete
                await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
                console.log('Payment marked as successful for appointment:', orderInfo.receipt);
                
                res.status(200).json({ success: true, message: "Payment Successful" });
            } else {
                console.log('Payment verification failed:', {
                    signatureValid: isSignatureValid,
                    orderStatus: orderInfo.status
                });
                
                res.status(400).json({ 
                    success: false, 
                    message: 'Payment verification failed',
                    details: {
                        signatureValid: isSignatureValid,
                        orderStatus: orderInfo.status
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching order info:', error);
            throw error;
        }
    } catch (error) {
        console.error('Razorpay verification error:', error);
        
        if (error.response) {
            console.error('Razorpay API error response:', error.response.data);
        }
        
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Payment verification error' 
        });
    }
};

        
export {
    loginUser,
    registerUser,  
}