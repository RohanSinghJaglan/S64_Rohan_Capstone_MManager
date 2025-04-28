import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const OTPVerification = ({ phone, setPhone, onVerificationComplete }) => {
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const formatPhoneNumber = (phone) => {
        // Remove any non-digit characters and ensure it's exactly 10 digits
        return phone.replace(/\D/g, '').slice(-10);
    };

    const handleSendOTP = async () => {
        try {
            const formattedPhone = formatPhoneNumber(phone);
            if (!formattedPhone || formattedPhone.length !== 10) {
                toast.error('Please enter a valid 10-digit phone number');
                return;
            }

            setLoading(true);
            console.log('Sending OTP to:', formattedPhone);
            
            const response = await axios.post( `${import.meta.env.VITE_BACKEND_URL}/api/user/send-otp`, {
                phone: formattedPhone
            });
            
            console.log('Send OTP response:', response.data);
            
            if (response.data.success) {
                toast.success('OTP sent successfully!');
                setIsOtpSent(true);
            } else {
                toast.error(response.data.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('OTP Send Error:', error.response?.data || error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        try {
            if (!otp || otp.length !== 6) {
                toast.error('Please enter a valid 6-digit OTP');
                return;
            }

            setLoading(true);
            const formattedPhone = formatPhoneNumber(phone);
            
            // Verify the OTP
            const verifyResponse = await axios.post( `${import.meta.env.VITE_BACKEND_URL}/api/user/verify-otp`, {
                phone: formattedPhone,
                otp: otp
            });
            
            console.log('Verify OTP response:', verifyResponse.data);

            if (verifyResponse.data.success) {
                const { token, user } = verifyResponse.data;
                localStorage.setItem('token', token);
                toast.success('Login successful!');
                onVerificationComplete(token, user);
            } else {
                toast.error(verifyResponse.data.message || 'Invalid OTP');
            }
        } catch (error) {
            console.error('OTP Verification Error:', error.response?.data || error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to verify OTP';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            setLoading(true);
            const formattedPhone = formatPhoneNumber(phone);
            
            const response = await axios.post( `${import.meta.env.VITE_BACKEND_URL}/api/user/resend-otp`, {
                phone: formattedPhone
            });
            
            if (response.data.success) {
                toast.success('OTP resent successfully!');
            } else {
                toast.error(response.data.message || 'Failed to resend OTP');
            }
        } catch (error) {
            console.error('OTP Resend Error:', error.response?.data || error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to resend OTP';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                </label>
                <div className="mt-1">
                    <input
                        type="tel"
                        name="phone"
                        id="phone"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter 10-digit number"
                        value={phone}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setPhone(value);
                        }}
                        disabled={isOtpSent}
                        maxLength="10"
                    />
                </div>
            </div>

            {isOtpSent ? (
                <>
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                            Enter OTP
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                name="otp"
                                id="otp"
                                maxLength="6"
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleVerifyOTP}
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button
                        onClick={handleResendOTP}
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Resend OTP'}
                    </button>
                </>
            ) : (
                <button
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? 'Sending...' : 'Send OTP'}
                </button>
            )}
        </div>
    );
};

export default OTPVerification; 