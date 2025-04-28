import axios from 'axios';

class OTPService {
    constructor() {
        if (!process.env.MSG91_AUTH_KEY || !process.env.MSG91_TEMPLATE_ID || !process.env.MSG91_SENDER_ID) {
            console.error('MSG91 configuration missing. Please check your .env file.');
        }
        this.authKey = process.env.MSG91_AUTH_KEY;
        this.templateId = process.env.MSG91_TEMPLATE_ID;
        this.senderId = process.env.MSG91_SENDER_ID;
        this.baseUrl = 'https://api.msg91.com/api/v5';
    }

    async sendOTP(phone, otp) {
        try {
            if (!phone) {
                throw new Error('Phone number is required');
            }

            // Format phone number (remove +91 if present and ensure it's a string)
            const formattedPhone = phone.toString().replace(/\D/g, '').slice(-10);

            const payload = {
                template_id: this.templateId,
                sender: this.senderId,
                mobile: `91${formattedPhone}`,
                otp: otp,
                authkey: this.authKey,
                DLT_TE_ID: this.templateId
            };

            console.log('Sending OTP to:', formattedPhone);

            const response = await axios.post(`${this.baseUrl}/flow/`, {
                flow_id: this.templateId,
                sender: this.senderId,
                mobiles: `91${formattedPhone}`,
                VAR1: otp,
                authkey: this.authKey
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'authkey': this.authKey
                }
            });

            console.log('MSG91 Response:', {
                status: response.status,
                data: response.data
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error in sending OTP:', {
                message: error.message,
                response: error.response?.data
            });
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to send OTP'
            };
        }
    }

    async verifyOTP(phone, otp) {
        try {
            if (!phone || !otp) {
                throw new Error('Phone number and OTP are required');
            }

            const formattedPhone = phone.toString().replace(/\D/g, '').slice(-10);

            const response = await axios.get(`${this.baseUrl}/otp/verify`, {
                params: {
                    mobile: `91${formattedPhone}`,
                    otp: otp,
                    authkey: this.authKey
                }
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error verifying OTP:', {
                message: error.message,
                response: error.response?.data
            });
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to verify OTP'
            };
        }
    }

    async resendOTP(phone, type = 'text') {
        try {
            if (!phone) {
                throw new Error('Phone number is required');
            }

            const formattedPhone = phone.toString().replace(/\D/g, '').slice(-10);

            const response = await axios.post(`${this.baseUrl}/otp/retry`, {
                mobile: `91${formattedPhone}`,
                retrytype: type,
                authkey: this.authKey
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error resending OTP:', {
                message: error.message,
                response: error.response?.data
            });
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to resend OTP'
            };
        }
    }
}

export default new OTPService(); 