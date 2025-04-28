import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ensureRazorpayLoaded, validateRazorpayConfig } from '../utils/razorpayHelper'

const Appointment = () => {

    const { docId } = useParams()
    const { doctors, currencySymbol, backendurl, token, getDoctosData, userData } = useContext(AppContext)
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    const [docInfo, setDocInfo] = useState(false)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')

    const navigate = useNavigate()

    const fetchDocInfo = async () => {
        const docInfo = doctors.find((doc) => doc._id === docId)
        setDocInfo(docInfo)
    }

    const getAvailableSolts = async () => {

        setDocSlots([])

        // getting current date
        let today = new Date()

        for (let i = 0; i < 7; i++) {

            // getting date with index 
            let currentDate = new Date(today)
            currentDate.setDate(today.getDate() + i)

            // setting end time of the date with index
            let endTime = new Date()
            endTime.setDate(today.getDate() + i)
            endTime.setHours(21, 0, 0, 0)

            // setting hours 
            if (today.getDate() === currentDate.getDate()) {
                currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
                currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
            } else {
                currentDate.setHours(10)
                currentDate.setMinutes(0)
            }

            let timeSlots = [];


            while (currentDate < endTime) {
                let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                let day = currentDate.getDate()
                let month = currentDate.getMonth() + 1
                let year = currentDate.getFullYear()

                const slotDate = day + "_" + month + "_" + year
                const slotTime = formattedTime

                const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true

                if (isSlotAvailable) {

                    // Add slot to array
                    timeSlots.push({
                        datetime: new Date(currentDate),
                        time: formattedTime
                    })
                }

                // Increment current time by 30 minutes
                currentDate.setMinutes(currentDate.getMinutes() + 30);
            }

            setDocSlots(prev => ([...prev, timeSlots]))

        }

    }

    const bookAppointment = async () => {
        if (!token) {
            toast.warning('Login to book appointment')
            return navigate('/login')
        }

        if (!userData || !userData._id) {
            toast.error('User data not available. Please log out and login again.')
            return
        }

        if (!slotTime) {
            toast.warning('Please select a time slot')
            return
        }

        // Validate Razorpay configuration before proceeding
        if (!validateRazorpayConfig()) {
            toast.error('Payment gateway configuration is missing. Please contact support.');
            return;
        }

        const date = docSlots[slotIndex][0].datetime

        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()

        const slotDate = day + "_" + month + "_" + year

        try {
            // First book the appointment
            const bookingResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/book-appointment`, 
                { 
                    docId, 
                    slotDate, 
                    slotTime, 
                    userId: userData?._id 
            }
            );

            if (bookingResponse.data.success) {
                // If appointment is booked, initiate payment
                try {
                    // Load Razorpay script before proceeding
                    await ensureRazorpayLoaded();
                    
                    const paymentResponse = await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL}/api/user/payment-razorpay`,
                        { appointmentId: bookingResponse.data.appointment._id }
                    );

                    if (paymentResponse.data.success) {
                        const order = paymentResponse.data.order;
                        
                        // Log Razorpay key and order details for debugging
                        console.log('Razorpay Key:', import.meta.env.VITE_RAZORPAY_KEY_ID);
                        console.log('Order details:', order);
                        
                        // Configure Razorpay options
                        const options = {
                            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                            amount: order.amount,
                            currency: order.currency,
                            name: "Prescripto",
                            description: "Doctor Appointment Payment",
                            order_id: order.id,
                            prefill: {
                                name: userData?.name || docInfo.name,
                                email: userData?.email || "",
                                contact: userData?.phone || ""
                            },
                            theme: {
                                color: "#6366f1"
                            },
                            modal: {
                                ondismiss: function() {
                                    toast.error('Payment cancelled. Your appointment is not confirmed.');
                                    console.log('Payment modal dismissed');
                                }
                            },
                            handler: function(response) {
                                // Log payment response
                                console.log('Payment successful:', response);
                                // Verify payment
                                verifyPayment(response);
                            }
                        };

                        // Check if Razorpay is loaded
                        if (typeof window.Razorpay === 'undefined') {
                            console.error('Razorpay not loaded!');
                            toast.error('Payment gateway not available. Please try again later.');
                            return;
                        }

                        try {
                            // Initialize Razorpay
                            const razorpayInstance = new window.Razorpay(options);
                            
                            razorpayInstance.on('payment.failed', function(response) {
                                console.error('Payment failed details:', response);
                                toast.error('Payment failed. Please try again.');
                            });

                            razorpayInstance.open();
                        } catch (error) {
                            console.error('Error initializing Razorpay:', error);
                            toast.error('Failed to initialize payment gateway');
                        }
                    } else {
                        toast.error(paymentResponse.data.message || 'Failed to initialize payment');
                    }
                } catch (error) {
                    console.error('Payment error:', error);
                    toast.error('Failed to process payment');
                }
            } else {
                toast.error(bookingResponse.data.message);
            }
        } catch (error) {
            console.error('Booking error:', error);
            console.error('Request data:', { docId, slotDate, slotTime, userId: userData?._id });
            console.error('Response:', error.response?.data);
            toast.error(error.response?.data?.message || error.message || 'Failed to book appointment');
        }
    };

    // Separate function to verify payment
    const verifyPayment = async (paymentResponse) => {
        try {
            const verifyResponse = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/user/verify-razorpay`,
                { 
                    razorpay_order_id: paymentResponse.razorpay_order_id,
                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                    razorpay_signature: paymentResponse.razorpay_signature 
                }
            );

            if (verifyResponse.data.success) {
                toast.success('Appointment booked successfully!');
                getDoctosData();
                navigate('/my-appointments');
            } else {
                toast.error('Payment verification failed');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            console.error('Payment response data:', paymentResponse);
            console.error('Error response:', error.response?.data);
            toast.error('Payment verification failed');
        }
    };

    useEffect(() => {
        if (doctors.length > 0) {
            fetchDocInfo()
        }
    }, [doctors, docId])

    useEffect(() => {
        if (docInfo) {
            getAvailableSolts()
        }
    }, [docInfo])

    return docInfo ? (
        <div>

            {/* ---------- Doctor Details ----------- */}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div>
                    <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
                </div>

                <div className='flex-1 border border-[#ADADAD] rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>

                    {/* ----- Doc Info : name, degree, experience ----- */}

                    <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" /></p>
                    <div className='flex items-center gap-2 mt-1 text-gray-600'>
                        <p>{docInfo.degree} - {docInfo.speciality}</p>
                        <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
                    </div>

                    {/* ----- Doc About ----- */}
                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>About <img className='w-3' src={assets.info_icon} alt="" /></p>
                        <p className='text-sm text-gray-600 max-w-[700px] mt-1'>{docInfo.about}</p>
                    </div>

                    <p className='text-gray-600 font-medium mt-4'>Appointment fee: <span className='text-gray-800'>{currencySymbol}{docInfo.fees}</span> </p>
                </div>
            </div>

            {/* Booking slots */}
            <div className='sm:ml-72 sm:pl-4 mt-8 font-medium text-[#565656]'>
                <p >Booking slots</p>
                <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
                    {docSlots.length && docSlots.map((item, index) => (
                        <div onClick={() => setSlotIndex(index)} key={index} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-[#DDDDDD]'}`}>
                            <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                            <p>{item[0] && item[0].datetime.getDate()}</p>
                        </div>
                    ))}
                </div>

                <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
                    {docSlots.length && docSlots[slotIndex].map((item, index) => (
                        <p onClick={() => setSlotTime(item.time)} key={index} className={`text-sm font-light  flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-[#949494] border border-[#B4B4B4]'}`}>{item.time.toLowerCase()}</p>
                    ))}
                </div>

                <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-20 py-3 rounded-full my-6'>Book an appointment</button>
            </div>

            {/* Listing Releated Doctors */}
            <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
        </div>
    ) : null
}

export default Appointment