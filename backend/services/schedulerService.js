import { schedule } from 'node-cron';
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';
import otpService from './otpService.js';

class SchedulerService {
    constructor() {
        this.jobs = [];
    }

    // Initialize all cron jobs
    initializeJobs() {
        // Appointment reminders - Run every hour
        this.jobs.push(
            schedule('0 * * * *', async () => {
                await this.sendAppointmentReminders();
            })
        );

        // Cleanup cancelled unpaid appointments - Run daily at midnight
        this.jobs.push(
            schedule('0 0 * * *', async () => {
                await this.cleanupUnpaidAppointments();
            })
        );

        // Doctor availability update - Run daily at 1 AM
        this.jobs.push(
            schedule('0 1 * * *', async () => {
                await this.updateDoctorAvailability();
            })
        );

        console.log('Scheduler Service: All jobs initialized');
    }

    // Send reminders for upcoming appointments
    async sendAppointmentReminders() {
        try {
            const now = new Date();
            const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            // Find appointments in next 24 hours that haven't been reminded
            const upcomingAppointments = await appointmentModel.find({
                slotDate: {
                    $gte: now,
                    $lte: in24Hours
                },
                reminderSent: { $ne: true },
                cancelled: { $ne: true },
                payment: true
            }).populate('userId');

            for (const appointment of upcomingAppointments) {
                if (appointment.userId.phone) {
                    // Send SMS reminder
                    const message = `Reminder: Your appointment is scheduled for ${appointment.slotDate} at ${appointment.slotTime}`;
                    
                    // You can use the OTP service to send SMS or implement a separate SMS service
                    // await smsService.sendSMS(appointment.userId.phone, message);

                    // Mark reminder as sent
                    appointment.reminderSent = true;
                    await appointment.save();
                }
            }

            console.log(`Sent reminders for ${upcomingAppointments.length} appointments`);
        } catch (error) {
            console.error('Appointment reminder error:', error);
        }
    }

    // Cleanup unpaid appointments after 24 hours
    async cleanupUnpaidAppointments() {
        try {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

            const result = await appointmentModel.updateMany(
                {
                    createdAt: { $lt: yesterday },
                    payment: false,
                    cancelled: false
                },
                {
                    $set: { cancelled: true, cancellationReason: 'Payment timeout' }
                }
            );

            console.log(`Cleaned up ${result.modifiedCount} unpaid appointments`);
        } catch (error) {
            console.error('Cleanup unpaid appointments error:', error);
        }
    }

    // Update doctor availability based on schedule
    async updateDoctorAvailability() {
        try {
            const today = new Date();
            
            // Find and update appointments that are past
            const pastAppointments = await appointmentModel.find({
                slotDate: { $lt: today },
                status: { $ne: 'completed' }
            });

            for (const appointment of pastAppointments) {
                appointment.status = 'completed';
                await appointment.save();
            }

            console.log(`Updated status for ${pastAppointments.length} past appointments`);
        } catch (error) {
            console.error('Update doctor availability error:', error);
        }
    }

    // Stop all cron jobs
    stopAllJobs() {
        this.jobs.forEach(job => job.stop());
        console.log('Scheduler Service: All jobs stopped');
    }
}

export default new SchedulerService(); 