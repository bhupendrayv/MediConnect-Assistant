import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DatePicker, message, TimePicker } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { showLoading, hideLoading } from '../redux/features/alertSlice';
import { FiArrowRight, FiCheckCircle, FiClock, FiCreditCard, FiStar, FiCalendar, FiUser, FiMapPin, FiActivity, FiEdit2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import AppointmentReceipt from '../components/AppointmentReceipt';
import { services } from '../data/services';
import ServiceSelector from '../components/ServiceSelector';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const BookingPage = () => {
    const { user } = useSelector(state => state.user);
    const params = useParams();
    const [doctor, setDoctor] = useState(null);
    const [date, setDate] = useState(null);
    const [time, setTime] = useState(null);
    const [step, setStep] = useState(1);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Patient Details State
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [problem, setProblem] = useState('');
    const [appointmentCode, setAppointmentCode] = useState('');
    const [bookedAppointment, setBookedAppointment] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);
    // New State for Patient Name
    const [patientName, setPatientName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');

    // New State for Service Selection
    const [selectedServices, setSelectedServices] = useState([]);
    // State for Available Services (to allow price editing)
    const [availableServices, setAvailableServices] = useState([]);


    const getDoctorData = async () => {
        try {
            const res = await axios.post('/api/v1/doctor/getDoctorById', { doctorId: params.doctorId }, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token'),
                },
            });
            if (res.data.success) {
                setDoctor(res.data.data);
                // Initialize available services: use doctor's custom services or default list
                const outputServices = res.data.data.services?.length > 0 ? res.data.data.services : services;
                setAvailableServices(outputServices);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleUpdateServicePrice = (serviceId, newPrice) => {
        // Update in available list
        const updatedList = availableServices.map(s =>
            s.id === serviceId ? { ...s, price: Number(newPrice) } : s
        );
        setAvailableServices(updatedList);

        // Also update in selected list if present, to reflect in total immediately
        if (selectedServices.find(s => s.id === serviceId)) {
            setSelectedServices(selectedServices.map(s =>
                s.id === serviceId ? { ...s, price: Number(newPrice) } : s
            ));
        }
    };

    const handleToggleService = (service) => {
        // Toggle logic: if already selected, remove it; otherwise, add it.
        // Always verify we are adding the *current* version of the service (with potentially updated price)
        if (selectedServices.find(s => s.id === service.id)) {
            setSelectedServices(selectedServices.filter(s => s.id !== service.id));
        } else {
            // Find the latest version of this service from availableServices
            const currentService = availableServices.find(s => s.id === service.id) || service;
            setSelectedServices([...selectedServices, currentService]);
        }
    };

    const calculateTotal = () => {
        const servicesTotal = selectedServices.reduce((acc, curr) => acc + curr.price, 0);
        return (doctor?.feesPerConsultation || 0) + servicesTotal;
    };

    const handleBooking = async () => {
        try {
            // Validate user is loaded
            if (!user || !user._id) {
                return message.error("User session not found. Please refresh the page and try again.");
            }

            if (!date || !time || !age || !gender || !address || !problem || !patientName || !mobileNumber) {
                return message.error("Please provide all patient details including mobile number");
            }
            if (selectedServices.length === 0) {
                return message.error("Please select at least one service.");
            }

            dispatch(showLoading());

            // 1. Create Appointment (pending status)
            const res = await axios.post('/api/v1/user/book-appointment',
                {
                    doctorId: params.doctorId,
                    userId: user._id,
                    doctorInfo: {
                        name: doctor.name,
                        specialization: doctor.specialization || 'General',
                        feesPerConsultation: doctor.feesPerConsultation || 0
                    },
                    userInfo: {
                        name: patientName,
                        email: user.email,
                        mobileNumber,
                        age,
                        gender,
                        address,
                        problem
                    },
                    date,
                    time,
                    selectedServices: selectedServices.map(s => ({
                        name: s.name || 'Service',
                        price: s.price || 0
                    }))
                },
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem('token'),
                    },
                });

            if (!res.data.success) {
                dispatch(hideLoading());
                return message.error(res.data.message || 'Booking initiation failed.');
            }

            const appointmentId = res.data.data._id;
            const totalAmount = res.data.data.totalAmount;

            // 2. Create Stripe Checkout Session
            const sessionRes = await axios.post('/api/v1/user/create-stripe-session',
                {
                    amount: totalAmount,
                    appointmentId: appointmentId,
                    doctorName: doctor.name
                },
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem('token'),
                    },
                });

            dispatch(hideLoading());
            if (sessionRes.data.success) {
                // 3. Redirect to Stripe Checkout
                window.location.href = sessionRes.data.url;
            } else {
                message.error(sessionRes.data.message || 'Failed to create payment session. Please try again.');
            }

        } catch (error) {
            dispatch(hideLoading());
            console.error('Booking error:', error);
            const errorMessage = error.response?.data?.message || 'Booking failed. Please try again.';
            message.error(errorMessage);
        }
    };

    useEffect(() => {
        getDoctorData();
    }, []);

    // Helper to get image based on gender
    const getDoctorImg = (doc) => {
        if (!doc) return "/doctors/female-doctor.png";
        if (doc.image) {
            // If it's a base64 or full URL, return as is
            if (doc.image.startsWith('data:') || doc.image.startsWith('http')) return doc.image;

            // If it has 'females/' or 'males/' prefix, strip it (likely data correction needed)
            let imgPath = doc.image;
            if (String(imgPath).includes('/')) {
                imgPath = String(imgPath).split('/').pop();
            }

            // Return with correct path
            return `/doctors/${imgPath}`;
        }

        // Use gender-specific default images
        if (doc.gender && doc.gender.toLowerCase() === 'female') return "/doctors/female-doctor.png";
        if (doc.gender && doc.gender.toLowerCase() === 'male') return "/doctors/male-doctor.png";
        return "/doctors/female-doctor.png";
    };

    useEffect(() => {
        if (user?.name) {
            setPatientName(user.name);
        }
    }, [user]);

    const timeSlots = [
        "09:00 AM", "10:00 AM", "11:00 AM",
        "02:00 PM", "03:00 PM", "04:00 PM",
        "05:00 PM", "06:00 PM", "07:00 PM"
    ];

    // For Quick Edit
    const [showEditModal, setShowEditModal] = useState(false);
    const [tempData, setTempData] = useState({ timings: { start: '', end: '' }, feesPerConsultation: 0 });

    const handleQuickEditSave = async () => {
        try {
            dispatch(showLoading());
            const res = await axios.post('/api/v1/user/updateDoctorPublic', {
                _id: doctor._id,
                timings: tempData.timings,
                feesPerConsultation: tempData.feesPerConsultation
            }, {
                headers: { Authorization: "Bearer " + localStorage.getItem('token') }
            });
            dispatch(hideLoading());
            if (res.data.success) {
                message.success("Doctor information updated!");
                setDoctor(res.data.data);
                setShowEditModal(false);
            }
        } catch (error) {
            dispatch(hideLoading());
            message.error("Failed to update doctor info");
        }
    };

    // Show loading if user data is not yet loaded
    if (!user) {
        return (
            <Layout>
                <div className="p-4 md:p-8 flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <FiActivity className="text-primary text-2xl" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Loading...</h3>
                        <p className="text-slate-400 text-sm">Please wait while we load your information</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-4 md:p-8 max-w-6xl mx-auto">
                <div className="mb-12">
                    <button onClick={() => navigate(-1)} className="mb-6 text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:text-primary transition-colors">
                        ← Back to Specialists
                    </button>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase leading-none mb-2">Reserve Your Slot.</h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Follow the steps to confirm your consultation</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-12 items-start">
                    {/* Doctor Info Card */}
                    <div className="lg:col-span-1">
                        <AnimatePresence mode='wait'>
                            {doctor ? (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 text-center sticky top-24"
                                >
                                    <div className="w-32 h-32 bg-gradient-to-br from-primary to-emerald-600 rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-emerald-200 relative group/avatar overflow-hidden">
                                        <img src={getDoctorImg(doctor)} alt={doctor.name} className="w-full h-full object-cover" />

                                        {/* Unified Edit Button - Always Visible for Authorized */}
                                        {((user?.role === 'admin' || user?.isAdmin) || String(user?._id) === String(doctor?._id) || String(user?._id) === String(doctor?.userId)) && (
                                            <button
                                                onClick={() => {
                                                    setTempData({ timings: doctor.timings, feesPerConsultation: doctor.feesPerConsultation });
                                                    setShowEditModal(true);
                                                }}
                                                className="absolute top-3 right-3 w-10 h-10 bg-primary text-white shadow-xl rounded-xl flex items-center justify-center hover:bg-slate-800 transition-all hover:scale-110 z-10 border-2 border-white"
                                                title="Edit Profile"
                                            >
                                                <FiEdit2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-[0.85] italic uppercase mb-2">
                                        {doctor.name?.toLowerCase().startsWith('dr') ? doctor.name : `Dr. ${doctor.name || 'Unknown'}`}
                                    </h2>
                                    <p className="text-primary font-black uppercase tracking-widest text-xs mb-8">{doctor.specialization || 'Specialist'}</p>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.5rem] relative group/edit">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary text-2xl">
                                                <FiClock />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Hours</p>
                                                <p className="text-xl font-black text-slate-800 italic leading-none mt-1">{doctor.timings?.start || '-'} - {doctor.timings?.end || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Estimated Total */}
                                    {selectedServices.length > 0 && (
                                        <div className="bg-slate-900 rounded-2xl p-6 mb-8">
                                            <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-1">Estimated Total</p>
                                            <p className="text-3xl text-white font-black italic">₹{calculateTotal()}</p>
                                            <p className="text-white/30 text-[9px] mt-2">{selectedServices.length} services selected</p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-center gap-6 text-slate-300">
                                        <div className="flex flex-col items-center">
                                            <span className="text-slate-800 font-black text-lg leading-none italic">12Y+</span>
                                            <span className="text-[8px] font-bold uppercase tracking-widest">Exp.</span>
                                        </div>
                                        <div className="w-px h-8 bg-slate-100 italic"></div>
                                        <div className="flex flex-col items-center">
                                            <div className="flex text-yellow-400 gap-0.5 text-xs">
                                                <FiStar /><FiStar /><FiStar /><FiStar /><FiStar />
                                            </div>
                                            <span className="text-[8px] font-bold uppercase tracking-widest">Rating</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-96 bg-slate-50 rounded-[3rem] animate-pulse"></div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Booking Steps */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-xl shadow-slate-200/50 min-h-[600px] flex flex-col">
                            {/* Progress bar */}
                            <div className="flex items-center gap-4 mb-16 overflow-x-auto pb-4">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <React.Fragment key={i}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm italic flex-shrink-0 transition-all ${step >= i ? 'bg-primary text-white shadow-lg shadow-emerald-200 scale-110' : 'bg-slate-100 text-slate-300'}`}>
                                            {step > i ? <FiCheckCircle /> : `0${i}`}
                                        </div>
                                        {i < 6 && <div className={`flex-1 h-1 rounded-full min-w-[20px] ${step > i ? 'bg-primary' : 'bg-slate-100'}`}></div>}
                                    </React.Fragment>
                                ))}
                            </div>

                            <div className="flex-1">
                                <AnimatePresence mode='wait'>
                                    {/* Step 1: Service Selection */}
                                    {step === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-10"
                                        >
                                            <div>
                                                <h3 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase mb-2">Step 01: Services.</h3>
                                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Customize your appointment experience.</p>
                                            </div>

                                            <ServiceSelector
                                                services={availableServices}
                                                selectedServices={selectedServices}
                                                onToggleService={handleToggleService}
                                                onUpdateService={handleUpdateServicePrice}
                                            />

                                            <button
                                                disabled={selectedServices.length === 0}
                                                onClick={() => setStep(2)}
                                                className="w-full h-16 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest italic flex items-center justify-center gap-4 hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-emerald-600/20"
                                            >
                                                Next: Select Date <FiArrowRight />
                                            </button>
                                        </motion.div>
                                    )}

                                    {/* Step 2: Date Selection */}
                                    {step === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-10"
                                        >
                                            <div>
                                                <h3 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase mb-2">Step 02: Date.</h3>
                                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">When would you like to visit?</p>
                                            </div>
                                            <DatePicker
                                                format="DD-MM-YYYY"
                                                className="w-full h-20 rounded-[1.5rem] border-slate-100 text-xl font-black italic px-8 hover:border-primary focus:border-primary transition-all bg-slate-50/50"
                                                placeholder="SELECT PREFERRED DATE"
                                                onChange={(val) => setDate(val ? dayjs(val).format('DD-MM-YYYY') : null)}
                                            />
                                            <div className="flex gap-4">
                                                <button onClick={() => setStep(1)} className="h-16 px-8 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest italic text-slate-400 hover:border-slate-200 transition-all">Back</button>
                                                <button
                                                    disabled={!date}
                                                    onClick={() => setStep(3)}
                                                    className="flex-1 h-16 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest italic flex items-center justify-center gap-4 hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-emerald-600/20"
                                                >
                                                    Next: Select Time <FiArrowRight />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 3: Time Selection */}
                                    {step === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-10"
                                        >
                                            <div>
                                                <h3 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase mb-2">STEP 03: TIME.</h3>
                                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">CHOOSE AN AVAILABLE SLOT FOR {date}</p>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                {timeSlots.map(t => (
                                                    <div
                                                        key={t}
                                                        onClick={() => setTime(t)}
                                                        className={`p-8 rounded-[1.5rem] border-2 cursor-pointer text-center transition-all ${time === t
                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-xl shadow-emerald-100 scale-105'
                                                            : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200 hover:bg-white'
                                                            }`}
                                                    >
                                                        <FiClock className={`mx-auto mb-4 text-xl ${time === t ? 'text-emerald-500' : 'text-slate-300'}`} />
                                                        <span className="text-xl font-black italic uppercase">{t}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Manual Time Picker Section */}
                                            <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 italic">OR CHOOSE CUSTOM TIME</p>
                                                <div className="flex flex-col items-center gap-4">
                                                    <TimePicker
                                                        format="hh:mm A"
                                                        use12Hours
                                                        className="w-full max-w-[300px] h-16 rounded-2xl border-slate-200 text-xl font-black italic px-6 shadow-sm"
                                                        placeholder="PICK ANOTHER TIME"
                                                        onChange={(val) => setTime(val ? dayjs(val).format('hh:mm A') : null)}
                                                    />
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Supports AM and PM selection</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <button onClick={() => setStep(2)} className="h-20 px-10 border-2 border-slate-100 rounded-3xl font-black uppercase text-xs tracking-widest italic text-slate-400 hover:border-slate-200 transition-all">BACK</button>
                                                <button
                                                    disabled={!time}
                                                    onClick={() => setStep(4)}
                                                    className="flex-1 h-20 bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-tight italic flex items-center justify-center gap-4 hover:bg-emerald-600 shadow-2xl shadow-emerald-500/20 transition-all text-lg"
                                                >
                                                    NEXT: DETAILS <FiArrowRight />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 4: Patient Details */}
                                    {step === 4 && (
                                        <motion.div
                                            key="step4"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-6"
                                        >
                                            <div>
                                                <h3 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase mb-2">Step 04: Details.</h3>
                                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Provide patient information for {doctor?.name.toLowerCase().startsWith('dr') ? doctor?.name : `Dr. ${doctor?.name}`}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Patient Name</label>
                                                <input type="text" placeholder="Full Name" className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-bold" value={patientName} onChange={e => setPatientName(e.target.value)} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Mobile Number</label>
                                                <input type="tel" placeholder="+91 XXXXX XXXXX" className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-bold" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Age</label>
                                                    <input type="number" placeholder="Years" className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-bold" value={age} onChange={e => setAge(e.target.value)} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Gender</label>
                                                    <select className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-bold" value={gender} onChange={e => setGender(e.target.value)}>
                                                        <option value="">Select</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Permanent Address</label>
                                                <input type="text" placeholder="Full Address" className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-bold" value={address} onChange={e => setAddress(e.target.value)} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Describe Your Problem</label>
                                                <textarea rows={3} placeholder="Tell us about your symptoms or medical concern..." className="w-full bg-slate-50 rounded-2xl p-6 font-bold" value={problem} onChange={e => setProblem(e.target.value)} />
                                            </div>
                                            <div className="flex gap-4 pt-4">
                                                <button onClick={() => setStep(3)} className="h-16 px-8 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest italic text-slate-400 hover:border-slate-200 transition-all">Back</button>
                                                <button onClick={() => setStep(5)} className="flex-1 h-16 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest italic flex items-center justify-center gap-4 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all">
                                                    Next: Payment <FiArrowRight />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 5: Payment Options */}
                                    {step === 5 && (
                                        <motion.div
                                            key="step5"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-8"
                                        >
                                            <div>
                                                <h3 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase mb-2">Step 05: Payment.</h3>
                                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Select your preferred payment method</p>
                                            </div>

                                            <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                                                <div className="flex justify-between items-center mb-6">
                                                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Consultation Fee</span>
                                                    <span className="text-slate-800 font-black text-xl italic">₹{doctor?.feesPerConsultation || 0}</span>
                                                </div>
                                                <div className="space-y-4 mb-6">
                                                    {selectedServices.map((s, idx) => (
                                                        <div key={idx} className="flex justify-between items-center">
                                                            <span className="text-slate-500 font-medium text-sm">{s.name}</span>
                                                            <span className="text-slate-800 font-bold text-sm">₹{s.price}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="h-px bg-slate-200 mb-6"></div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-800 font-black uppercase tracking-widest text-xs">Total Amount</span>
                                                    <span className="text-primary font-black text-3xl italic">₹{calculateTotal()}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="p-6 bg-white border-2 border-primary rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-emerald-50 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-2xl">
                                                            <FiCreditCard />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800 uppercase tracking-tight italic">Stripe Secure Checkout</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cards, UPI, NetBanking, Wallets</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-6 h-6 rounded-full border-4 border-primary bg-primary shadow-lg shadow-primary/20"></div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <button onClick={() => setStep(4)} className="h-16 px-8 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest italic text-slate-400 hover:border-slate-200 transition-all">Back</button>
                                                <button onClick={handleBooking} className="flex-1 h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest italic flex items-center justify-center gap-4 hover:bg-emerald-600 shadow-xl shadow-primary/20 transition-all">
                                                    Pay & Confirm Booking <FiCheckCircle />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 6: Success */}
                                    {step === 6 && (
                                        <motion.div
                                            key="step5"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="h-full flex flex-col items-center justify-center text-center py-6"
                                        >
                                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-xl shadow-green-100 animate-bounce">
                                                <FiCheckCircle />
                                            </div>
                                            <h3 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase mb-2 leading-none">Booking Confirmed!</h3>
                                            <div className="bg-slate-900 rounded-3xl p-8 w-full my-8 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-3xl"></div>
                                                <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[8px] mb-2">Unique verification Code</p>
                                                <h4 className="text-white text-5xl font-black italic tracking-tighter uppercase mb-4">{appointmentCode}</h4>
                                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Please present this code to the specialist for verification.</p>
                                            </div>
                                            <div className="flex flex-col w-full gap-4">
                                                <button onClick={() => setShowReceipt(true)} className="w-full h-16 bg-primary/10 text-primary rounded-2xl font-black uppercase tracking-widest italic">View Details</button>
                                                <button onClick={() => navigate('/appointments')} className="w-full h-16 bg-emerald-600/10 text-emerald-600 rounded-2xl font-black uppercase tracking-widest italic">My Appointments</button>
                                                <button onClick={() => navigate('/dashboard')} className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] hover:text-slate-800 transition-colors py-2">Back to Dashboard</button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Receipt Modal */}
                {showReceipt && bookedAppointment && (
                    <AppointmentReceipt
                        appointment={bookedAppointment}
                        onClose={() => setShowReceipt(false)}
                    />
                )}

                {/* Quick Edit Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl"
                        >
                            <h3 className="text-2xl font-black text-slate-800 italic uppercase mb-6">Quick Edit Info.</h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Start Time</label>
                                        <input
                                            type="text"
                                            placeholder="eg. 09:00 AM"
                                            className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                            value={tempData.timings?.start}
                                            onChange={e => setTempData({ ...tempData, timings: { ...tempData.timings, start: e.target.value } })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">End Time</label>
                                        <input
                                            type="text"
                                            placeholder="eg. 05:00 PM"
                                            className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                            value={tempData.timings?.end}
                                            onChange={e => setTempData({ ...tempData, timings: { ...tempData.timings, end: e.target.value } })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Fees (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                        value={tempData.feesPerConsultation}
                                        onChange={e => setTempData({ ...tempData, feesPerConsultation: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setShowEditModal(false)} className="flex-1 h-14 border-2 border-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest italic text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                                    <button onClick={handleQuickEditSave} className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest italic shadow-xl shadow-primary/20 hover:scale-105 transition-all">Save Changes</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default BookingPage;
