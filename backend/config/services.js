import Razorpay from 'razorpay';
import { v2 as cloudinary } from 'cloudinary';
import stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate configurations first
const validateConfigurations = () => {
    const missingConfigs = [];

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        missingConfigs.push('Razorpay');
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        missingConfigs.push('Cloudinary');
    }
};
// Run validation
validateConfigurations();

// Configure services only if their required environment variables are present
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
}

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

// Configure Stripe
const stripeInstance = process.env.STRIPE_SECRET_KEY ? new stripe(process.env.STRIPE_SECRET_KEY) : null;
// Export initialized services
export {
    cloudinary,
    razorpay,
    stripeInstance,
};