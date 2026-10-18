import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
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
    // State for Payment Method ('cash' or 'stripe')
    const [paymentMethod, setPaymentMethod] = useState('cash');
    // State for Available Services - initialize with default services so Step 1 is never blank
    const [availableServices, setAvailableServices] = useState(services);
    // State for all available doctors in the hospital
    const [allDoctors, setAllDoctors] = useState([]);
    // State for Department/Specialization
    const [selectedDepartment, setSelectedDepartment] = useState('');

    const defaultDepartments = ['Cardiology', 'Dermatology', 'General Medicine', 'Neurology', 'Pediatrics', 'Orthopedic Surgery'];
    const availableDepartments = Array.from(
        new Set([
            ...defaultDepartments,
            ...allDoctors.map(d => d.specialization).filter(Boolean)
        ])
    ).sort();

    const getAllDoctorsList = async () => {
        try {
            const res = await api.get('/user/getAllDoctors', {
                headers: { Authorization: "Bearer " + localStorage.getItem('token') }
            });
            if (res.data.success) {
                const doctorList = res.data.data.filter(d => d.isAvailable !== false);
                setAllDoctors(doctorList);
                // Set default department if none selected
                if (!params.doctorId && doctorList.length > 0) {
                    const firstDept = doctorList[0]?.specialization || 'General Medicine';
                    setSelectedDepartment(prev => prev || firstDept);
                }
            }
        } catch (err) {
            console.error('Error fetching all doctors:', err);
        }
    };

    const getDoctorData = async (targetDocId) => {
        const idToFetch = targetDocId || params.doctorId;
        if (!idToFetch) return;
        try {
            const res = await api.post('/doctor/getDoctorById', { doctorId: idToFetch }, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token'),
                },
            });
            if (res.data.success) {
                // Merge with allDoctors entry to ensure name/specialization are populated
                const apiDoc = res.data.data;
                const localDoc = allDoctors.find(d => String(d._id) === String(idToFetch));
                const merged = {
                    ...apiDoc,
                    name: apiDoc.name || localDoc?.name || 'Doctor',
                    specialization: apiDoc.specialization || localDoc?.specialization || 'Specialist',
                    feesPerConsultation: apiDoc.feesPerConsultation ?? localDoc?.feesPerConsultation ?? 0,
                    timings: apiDoc.timings || localDoc?.timings || {},
                };
                setDoctor(merged);
                if (merged.specialization) {
                    setSelectedDepartment(merged.specialization);
                }
                const outputServices = merged.services?.length > 0 ? merged.services : services;
                setAvailableServices(outputServices);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAllDoctorsList();
        if (params.doctorId) {
            getDoctorData(params.doctorId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.doctorId]);

    // No separate auto-select effect needed - getAllDoctorsList handles it

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

            // Block Doctor and Admin from booking appointments
            if (user.isAdmin || user.role === 'admin' || user.isDoctor || user.role === 'doctor') {
                return message.error("Doctors and Admins are not allowed to book appointments. Please log in with a Patient account.");
            }

            if (!selectedDepartment) {
                return message.error("Please select a department before booking.");
            }

            // Auto-assign random available doctor from the selected department if no specific doctor chosen
            let activeDoctor = doctor;
            if (!activeDoctor || !activeDoctor._id) {
                const deptDocs = allDoctors.filter(d =>
                    d.specialization?.toLowerCase() === selectedDepartment.toLowerCase() && d.isAvailable !== false
                );
                const pool = deptDocs.length > 0 ? deptDocs : allDoctors;
                if (pool.length === 0) {
                    return message.error("No available doctors found in the system.");
                }
                activeDoctor = pool[Math.floor(Math.random() * pool.length)];
                setDoctor(activeDoctor);
            }

            if (!patientName.trim()) return message.error("Patient name is required.");
            if (!mobileNumber.trim()) return message.error("Mobile number is required.");
            if (!age) return message.error("Age is required.");
            if (!gender) return message.error("Gender is required.");
            if (!date) return message.error("Please select a date.");
            if (!time) return message.error("Please select a time slot.");
            if (!address.trim()) return message.error("Address is required.");
            if (!problem.trim()) return message.error("Please describe your medical problem.");
            if (selectedServices.length === 0) {
                return message.error("Please select at least one service.");
            }

            dispatch(showLoading());

            // 1. Create Appointment (pending status)
            const res = await api.post('/user/book-appointment',
                {
                    doctorId: activeDoctor._id,
                    userId: user._id,
                    doctorInfo: {
                        name: activeDoctor.name,
                        specialization: activeDoctor.specialization || selectedDepartment,
                        feesPerConsultation: activeDoctor.feesPerConsultation || 500
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
                    })),
                    paymentMethod,
                    paymentStatus: paymentMethod === 'cash' ? 'pending_cash' : 'pending'
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

            const appointmentData = res.data.data;
            setAppointmentCode(appointmentData.appointmentCode);
            setBookedAppointment(appointmentData);

            if (paymentMethod === 'stripe') {
                // Online Payment: redirect to Stripe Checkout to enter Debit/Credit Card details
                const totalAmount = appointmentData.totalAmount || (Number(activeDoctor.feesPerConsultation) || 500);
                const sessionRes = await api.post('/user/create-stripe-session', {
                    amount: totalAmount,
                    appointmentId: appointmentData._id,
                    doctorName: activeDoctor.name
                }, {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem('token'),
                    }
                });

                dispatch(hideLoading());
                if (sessionRes.data.success && sessionRes.data.url) {
                    message.loading('Redirecting to secure card payment checkout...', 1.5);
                    window.location.href = sessionRes.data.url;
                } else {
                    message.error(sessionRes.data.message || 'Failed to create payment session. Please try again.');
                }
            } else {
                // Cash Payment Confirmation - Proceed directly to confirmation screen
                dispatch(hideLoading());
                setStep(6);
                message.success('Booking confirmed! Please pay cash at the clinic counter.');
            }

        } catch (error) {
            dispatch(hideLoading());
            console.error('Booking error:', error);
            const errorMessage = error.response?.data?.message || 'Booking failed. Please try again.';
            message.error(errorMessage);
        }
    };

    // NOTE: Initial load is handled by the first useEffect above (params.doctorId).
    // Removed duplicate call that caused stale closure loop.

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
            const res = await api.post('/user/updateDoctorPublic', {
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
            <div className="p-3 md:p-4 max-w-6xl mx-auto relative">
                <div className="mb-3">
                    <button onClick={() => navigate(-1)} className="mb-2 text-slate-400 text-xs flex items-center gap-2 hover:text-primary transition-colors">
                        ← Back to Specialists
                    </button>
                    <h1 className="text-2xl text-slate-800 leading-none mb-1">Reserve Your Slot</h1>
                    <p className="text-slate-400 text-xs mb-3">Select a specialist and follow the steps to confirm your consultation</p>

                    {/* Department & Doctor Selection Section */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-4 space-y-3">
                        {/* 1. Department Selection (Required) */}
                        <div>
                            <div className="flex items-center justify-between mb-2 px-1">
                                <span className="text-xs text-slate-800 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                                    1. Select Department <span className="text-red-500">*</span>
                                </span>
                                <span className="text-[10px] text-slate-400">
                                    {availableDepartments.length} Departments
                                </span>
                            </div>
                            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                                {availableDepartments.map((dept) => {
                                    const isSelected = selectedDepartment?.toLowerCase() === dept.toLowerCase();
                                    const deptDocCount = allDoctors.filter(d => d.specialization?.toLowerCase() === dept.toLowerCase()).length;
                                    return (
                                        <button
                                            key={dept}
                                            type="button"
                                            onClick={() => {
                                                setSelectedDepartment(dept);
                                                // Reset specific doctor selection when changing department unless doctor matches
                                                if (doctor && doctor.specialization?.toLowerCase() !== dept.toLowerCase()) {
                                                    setDoctor(null);
                                                }
                                            }}
                                            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs transition-all border flex items-center gap-2 ${
                                                isSelected
                                                    ? 'border-primary bg-primary text-white shadow-sm'
                                                    : 'border-slate-100 bg-slate-50/70 text-slate-600 hover:border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            <span>{dept}</span>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                                {deptDocCount}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Doctor Selection (Optional) */}
                        <div>
                            <div className="flex items-center justify-between mb-2 px-1">
                                <span className="text-xs text-slate-800 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                                    2. Select Doctor <span className="text-[10px] text-slate-400">(optional)</span>
                                </span>
                                {doctor && (
                                    <button
                                        type="button"
                                        onClick={() => setDoctor(null)}
                                        className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:underline"
                                    >
                                        Auto-Assign Random Doctor
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                {/* Auto-Assign Option Card */}
                                <div
                                    onClick={() => setDoctor(null)}
                                    className={`cursor-pointer flex-shrink-0 flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all min-w-[200px] ${
                                        !doctor
                                            ? 'border-emerald-500 bg-emerald-50/80 shadow-md shadow-emerald-500/10'
                                            : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'
                                    }`}
                                >
                                    <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 font-black text-xl flex items-center justify-center flex-shrink-0">
                                        🎲
                                    </div>
                                    <div className="text-left overflow-hidden">
                                        <p className={`text-xs font-black truncate leading-tight ${!doctor ? 'text-emerald-700' : 'text-slate-800'}`}>
                                            Any Available Doctor
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-bold truncate">
                                            Auto-Assign in {selectedDepartment}
                                        </p>
                                    </div>
                                </div>

                                {/* Doctors in Selected Department */}
                                {allDoctors
                                    .filter(doc => doc.specialization?.toLowerCase() === selectedDepartment?.toLowerCase())
                                    .map((doc) => {
                                        const isSelected = doctor?._id === doc._id;
                                        return (
                                            <div
                                                key={doc._id}
                                                onClick={() => {
                                                    setDoctor(doc);
                                                    const outputServices = doc.services?.length > 0 ? doc.services : services;
                                                    setAvailableServices(outputServices);
                                                }}
                                                className={`cursor-pointer flex-shrink-0 flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all min-w-[210px] ${
                                                    isSelected
                                                        ? 'border-primary bg-emerald-50/70 shadow-md shadow-primary/10'
                                                        : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'
                                                }`}
                                            >
                                                <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                                                    <img
                                                        src={getDoctorImg(doc)}
                                                        alt={doc.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="text-left overflow-hidden">
                                                    <p className={`text-xs font-black truncate leading-tight ${isSelected ? 'text-primary' : 'text-slate-800'}`}>
                                                        {doc.name?.toLowerCase().startsWith('dr') ? doc.name : `Dr. ${doc.name}`}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 font-bold truncate">
                                                        {doc.specialization || 'Specialist'}
                                                    </p>
                                                    <p className="text-[10px] font-black text-slate-700 mt-0.5">
                                                        ₹{doc.feesPerConsultation || 500}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto">
                    {/* Booking Steps - Full Width Centered */}
                    <div>
                        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/80 shadow-lg flex flex-col relative overflow-hidden">
                            {/* Inner ambient glow */}
                            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-100/40 via-teal-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

                            {/* Progress bar with radiant lighting */}
                            {/* Compact Progress Bar */}
                            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="contents">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs flex-shrink-0 transition-all ${
                                            step === i 
                                                ? 'bg-emerald-500 text-white shadow-sm' 
                                                : step > i 
                                                    ? 'bg-emerald-600 text-white' 
                                                    : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            {step > i ? <FiCheckCircle className="text-sm" /> : `0${i}`}
                                        </div>
                                        {i < 6 && (
                                            <div className={`flex-1 h-1 rounded-full min-w-[12px] transition-all ${
                                                step > i ? 'bg-emerald-500' : 'bg-slate-100'
                                            }`} />
                                        )}
                                    </div>
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
                                            className="space-y-4"
                                        >
                                            <div>
                                                <h3 className="text-xl text-slate-800 mb-1">Step 01: Services</h3>
                                                <p className="text-slate-400 text-xs">Select services for your consultation.</p>
                                            </div>

                                            <ServiceSelector
                                                services={availableServices}
                                                selectedServices={selectedServices}
                                                onToggleService={handleToggleService}
                                                onUpdateService={(user?.role === 'admin' || user?.isAdmin) ? handleUpdateServicePrice : undefined}
                                            />

                                            <button
                                                disabled={!selectedDepartment || selectedServices.length === 0}
                                                onClick={() => setStep(2)}
                                                className="w-full h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-3 hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md text-sm"
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
                                            className="space-y-4"
                                        >
                                            <div>
                                                <h3 className="text-xl text-slate-800 mb-1">Step 02: Date</h3>
                                                <p className="text-slate-400 text-xs">When would you like to visit?</p>
                                            </div>
                                            <DatePicker
                                                format="DD-MM-YYYY"
                                                className="w-full h-14 rounded-xl border-slate-100 text-sm px-6 hover:border-primary focus:border-primary transition-all bg-slate-50/50"
                                                placeholder="Select preferred date"
                                                onChange={(val) => setDate(val ? dayjs(val).format('DD-MM-YYYY') : null)}
                                            />
                                            <div className="flex gap-3">
                                                <button onClick={() => setStep(1)} className="h-12 px-6 border border-slate-100 rounded-xl text-xs text-slate-400 hover:border-slate-200 transition-all">Back</button>
                                                <button
                                                    disabled={!date}
                                                    onClick={() => setStep(3)}
                                                    className="flex-1 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-3 hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md text-sm"
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
                                            className="space-y-4"
                                        >
                                            <div>
                                                <h3 className="text-xl text-slate-800 mb-1">Step 03: Time</h3>
                                                <p className="text-slate-400 text-xs">Choose an available slot for {date}</p>
                                            </div>

                                            <div className="grid grid-cols-3 md:grid-cols-3 gap-2">
                                                {timeSlots.map(t => (
                                                    <div
                                                        key={t}
                                                        onClick={() => setTime(t)}
                                                        className={`py-3 px-2 rounded-xl border cursor-pointer text-center transition-all ${time === t
                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm'
                                                            : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:border-slate-200 hover:bg-white'
                                                            }`}
                                                    >
                                                        <FiClock className={`mx-auto mb-1 text-sm ${time === t ? 'text-emerald-500' : 'text-slate-300'}`} />
                                                        <span className="text-sm">{t}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Manual Time Picker Section */}
                                            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                                                <p className="text-[10px] text-slate-400 mb-3">Or choose custom time</p>
                                                <div className="flex flex-col items-center gap-2">
                                                    <TimePicker
                                                        format="hh:mm A"
                                                        use12Hours
                                                        className="w-full max-w-[250px] h-10 rounded-xl border-slate-200 text-sm px-4"
                                                        placeholder="Pick another time"
                                                        onChange={(val) => setTime(val ? dayjs(val).format('hh:mm A') : null)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <button onClick={() => setStep(2)} className="h-12 px-6 border border-slate-100 rounded-xl text-xs text-slate-400 hover:border-slate-200 transition-all">Back</button>
                                                <button
                                                    disabled={!time}
                                                    onClick={() => setStep(4)}
                                                    className="flex-1 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-3 hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md text-sm"
                                                >
                                                    Next: Details <FiArrowRight />
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
                                            className="space-y-3"
                                        >
                                            <div>
                                                <h3 className="text-xl text-slate-800 mb-1">Step 04: Details</h3>
                                                {/* Show selected department & doctor info inline */}
                                                <div className="flex items-center gap-3 mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-200 flex-shrink-0 flex items-center justify-center text-lg">
                                                        {doctor ? <img src={getDoctorImg(doctor)} alt={doctor.name} className="w-full h-full object-cover" /> : '🏥'}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">
                                                            {selectedDepartment} Department
                                                        </p>
                                                        <p className="text-[10px] text-emerald-600 font-bold">
                                                            {doctor
                                                                ? `${doctor.name?.toLowerCase().startsWith('dr') ? doctor.name : `Dr. ${doctor.name}`} • ₹${doctor.feesPerConsultation || 500} consultation`
                                                                : 'Doctor: Auto-Assigned Specialist upon confirmation'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-slate-400 text-xs mt-1"><span className="text-red-400">*</span> Required fields</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400 ml-1">Patient Name <span className="text-red-400">*</span></label>
                                                <input required type="text" placeholder="Full Name" className="w-full h-10 bg-slate-50 rounded-xl px-4 text-sm border border-transparent focus:border-primary outline-none transition-all" value={patientName} onChange={e => setPatientName(e.target.value)} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400 ml-1">Mobile Number <span className="text-red-400">*</span></label>
                                                <input required type="tel" placeholder="+91 XXXXX XXXXX" className="w-full h-10 bg-slate-50 rounded-xl px-4 text-sm border border-transparent focus:border-primary outline-none transition-all" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-slate-400 ml-1">Age <span className="text-red-400">*</span></label>
                                                    <input required type="number" placeholder="Years" className="w-full h-10 bg-slate-50 rounded-xl px-4 text-sm border border-transparent focus:border-primary outline-none transition-all" value={age} onChange={e => setAge(e.target.value)} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-slate-400 ml-1">Gender <span className="text-red-400">*</span></label>
                                                    <select required className="w-full h-10 bg-slate-50 rounded-xl px-4 text-sm border border-transparent focus:border-primary outline-none transition-all" value={gender} onChange={e => setGender(e.target.value)}>
                                                        <option value="">Select Gender</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400 ml-1">Permanent Address</label>
                                                <input type="text" placeholder="Full Address" className="w-full h-10 bg-slate-50 rounded-xl px-4 text-sm border border-transparent focus:border-primary outline-none transition-all" value={address} onChange={e => setAddress(e.target.value)} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400 ml-1">Describe Your Problem</label>
                                                <textarea rows={2} placeholder="Tell us about your symptoms or medical concern..." className="w-full bg-slate-50 rounded-xl p-4 text-sm border border-transparent focus:border-primary outline-none" value={problem} onChange={e => setProblem(e.target.value)} />
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button onClick={() => setStep(3)} className="h-12 px-6 border border-slate-100 rounded-xl text-xs text-slate-400 hover:border-slate-200 transition-all">Back</button>
                                                <button onClick={() => setStep(5)} className="flex-1 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-3 hover:bg-emerald-600 shadow-md transition-all text-sm">
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
                                            className="space-y-4"
                                        >
                                            <div>
                                                <h3 className="text-xl text-slate-800 mb-1">Step 05: Payment</h3>
                                                <p className="text-slate-400 text-xs">Select your preferred payment method</p>
                                            </div>

                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-slate-400 text-xs">Consultation Fee</span>
                                                    <span className="text-slate-800 text-sm">₹{doctor?.feesPerConsultation || 0}</span>
                                                </div>
                                                <div className="space-y-2 mb-3">
                                                    {selectedServices.map((s, idx) => (
                                                        <div key={idx} className="flex justify-between items-center">
                                                            <span className="text-slate-600 text-sm">{s.name}</span>
                                                            <span className="text-slate-800 text-sm">₹{s.price}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="h-px bg-slate-200/80 mb-3"></div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-800 text-xs">Total Amount</span>
                                                    <span className="text-emerald-600 text-xl">₹{calculateTotal()}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Option 1: Pay by Cash */}
                                                <div
                                                    onClick={() => setPaymentMethod('cash')}
                                                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                                        paymentMethod === 'cash'
                                                            ? 'border-emerald-500 bg-emerald-50/80 shadow-sm'
                                                            : 'border-slate-100 bg-white hover:border-emerald-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                                                            paymentMethod === 'cash' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                            💵
                                                        </div>
                                                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                            paymentMethod === 'cash' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                                                        }`}>
                                                            {paymentMethod === 'cash' && <span className="w-2 h-2 rounded-full bg-white" />}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-900 text-sm">Pay at Clinic (Cash)</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">Pay during your appointment</p>
                                                </div>

                                                {/* Option 2: Online / Stripe */}
                                                <div
                                                    onClick={() => setPaymentMethod('stripe')}
                                                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                                        paymentMethod === 'stripe'
                                                            ? 'border-emerald-500 bg-emerald-50/80 shadow-sm'
                                                            : 'border-slate-100 bg-white hover:border-emerald-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                                                            paymentMethod === 'stripe' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                            <FiCreditCard />
                                                        </div>
                                                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                            paymentMethod === 'stripe' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                                                        }`}>
                                                            {paymentMethod === 'stripe' && <span className="w-2 h-2 rounded-full bg-white" />}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-900 text-sm">Online (Stripe / Card)</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">Instant digital payment</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                <button onClick={() => setStep(4)} className="h-12 px-6 border border-slate-100 rounded-xl text-xs text-slate-400 hover:border-slate-200 transition-all">Back</button>
                                                <button onClick={handleBooking} className="flex-1 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-3 hover:bg-emerald-600 shadow-md transition-all text-sm">
                                                    {paymentMethod === 'cash' ? 'Confirm Booking' : 'Pay Online & Confirm'} <FiCheckCircle />
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
                                            <h3 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase mb-2 leading-none">
                                                Booking Confirmed!
                                            </h3>
                                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2">
                                                {paymentMethod === 'cash' 
                                                    ? '💵 Payment Method: Pay at Clinic Counter (Pending Cash)' 
                                                    : '💳 Payment Method: Online Card (Verified)'}
                                            </p>
                                            {paymentMethod === 'cash' && (
                                                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl px-4 py-2 text-xs font-bold mb-4 max-w-md">
                                                    Notice: Please pay ₹{bookedAppointment?.totalAmount || activeDoctor?.feesPerConsultation || 500} at the clinic reception upon arrival. Your official tax receipt will be downloadable once payment is confirmed by staff.
                                                </div>
                                            )}
                                            <div className="bg-slate-900 rounded-3xl p-8 w-full my-4 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-3xl"></div>
                                                <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[8px] mb-2">Unique verification Code</p>
                                                <h4 className="text-white text-5xl font-black italic tracking-tighter uppercase mb-4">{appointmentCode}</h4>
                                                
                                                <div className="mt-6 pt-6 border-t border-slate-800 text-left flex justify-between items-center">
                                                    <div>
                                                        <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[8px] mb-1">Payment Status</p>
                                                        <p className={`font-bold font-mono tracking-widest text-sm ${bookedAppointment?.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                            {bookedAppointment?.paymentStatus === 'paid' ? 'PAID ✓' : 'PENDING CASH AT COUNTER'}
                                                        </p>
                                                    </div>
                                                    {bookedAppointment?.transactionId && (
                                                        <div className="text-right">
                                                            <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[8px] mb-1">Reference ID</p>
                                                            <p className="text-slate-300 font-mono text-xs">{bookedAppointment.transactionId}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed mt-6">Please present this code to the specialist for verification.</p>
                                            </div>
                                            <div className="flex flex-col w-full gap-4">
                                                <button onClick={() => setShowReceipt(true)} className="w-full h-16 bg-primary/10 text-primary rounded-2xl font-black uppercase tracking-widest italic">
                                                    {bookedAppointment?.paymentStatus === 'paid' ? 'View & Download Receipt' : 'View Appointment Details'}
                                                </button>
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
