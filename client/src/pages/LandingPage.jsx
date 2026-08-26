import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiShield, FiUserCheck, FiArrowRight, FiEdit2, FiSave, FiX, FiClock, FiCreditCard, FiStar, FiCamera } from 'react-icons/fi';
import api from '../services/api';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import ThemeToggle from '../components/ThemeToggle';
import TopBar from '../components/layout/TopBar';
import { FaHeartbeat, FaBrain, FaBone, FaAllergies, FaBaby, FaStethoscope } from 'react-icons/fa';

// Hero Slideshow Component
const HeroSlideshow = () => {
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

    // High-quality medical and healthcare images from Unsplash
    const backgroundImages = [
        'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2091&auto=format&fit=crop', // Medical stethoscope
        'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=2187&auto=format&fit=crop', // Hospital equipment
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop', // Doctor professional
        'https://images.unsplash.com/photo-1551190822-a9333d879b1f?q=80&w=2070&auto=format&fit=crop', // Medical team
        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop', // Healthcare facility
        'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2128&auto=format&fit=crop', // Modern hospital corridor
        'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop', // Hospital room with equipment
        'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop', // Medical professionals in hospital
        'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?q=80&w=2070&auto=format&fit=crop', // Hospital building exterior
        'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=2087&auto=format&fit=crop', // Medical consultation
        'https://images.unsplash.com/photo-1563213126-a4273aed2016?q=80&w=2070&auto=format&fit=crop', // Hospital waiting area
        'https://images.unsplash.com/photo-1519494140681-8b17d830a3e9?q=80&w=2074&auto=format&fit=crop', // Medical technology
    ];

    // Auto-rotate images every 5 seconds
    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                (prevIndex + 1) % backgroundImages.length
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [backgroundImages.length]);

    return (
        <div className="aspect-[4/5] relative overflow-hidden">
            {/* Background Images with Fade Transition */}
            {backgroundImages.map((image, index) => (
                <div
                    key={index}
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                    style={{
                        opacity: currentImageIndex === index ? 1 : 0,
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: currentImageIndex === index ? 'scale(1.05)' : 'scale(1)',
                        transition: 'opacity 1s ease-in-out, transform 10s ease-in-out',
                    }}
                />
            ))}

            {/* Dark Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-indigo-900/70 to-slate-900/80" />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white text-center relative z-10">
                {/* Running Scanning Line */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-scan pointer-events-none"></div>

                <FiActivity className="text-9xl mb-8 animate-pulse-flow opacity-20" />
                <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter italic z-10">
                    Better Care <br /> Better Health
                </h2>
                <div className="w-24 h-2 bg-white/20 rounded-full z-10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/40 animate-scan"></div>
                </div>
            </div>
        </div>
    );
};


const LandingPage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const { user } = useSelector(state => state.user);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedDoc, setSelectedDoc] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedFooterInfo, setSelectedFooterInfo] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);

    const footerDetails = {
        "Features": {
            title: "SmartHealth Features",
            desc: "Explore the cutting-edge tools we've built to simplify your healthcare journey.",
            points: ["Real-time Appointment Booking", "Al-Powered Symptom Checker", "Secure Digital Health Records", "Telemedicine Support"]
        },
        "Pricing": {
            title: "Transparent Pricing",
            desc: "Healthcare should be accessible. We offer clear, upfront pricing with no hidden costs.",
            points: ["Zero registration fees", "Affordable consults starting from ₹100", "Free AI diagnosis support", "Pay-as-you-go model"]
        },
        "AI Diagnosis": {
            title: "Al Healthcare Insight",
            desc: "Our advanced AI assistant helps you understand your symptoms instantly.",
            points: ["95% Initial Accuracy", "Driven by medical data", "24/7 symptom analysis", "Automatic specialist matching"]
        },
        "About Us": {
            title: "Our Mission",
            desc: "SmartHealth was born to bridge the gap between technology and human care.",
            points: ["Patient-first philosophy", "Dedicated medical team", "Technology-driven care", "Community trust"]
        },
        "Careers": {
            title: "Join Our Team",
            desc: "Work with the brightest minds in healthcare and technology.",
            points: ["Remote-first environment", "Health & Wellness benefits", "Career growth tracks", "Innovation culture"]
        },
        "News": {
            title: "SmartHealth Newsroom",
            desc: "Stay updated with the latest breakthroughs and company updates.",
            points: ["New specialist onboardings", "Feature release logs", "Community health blogs", "Industry recognitions"]
        }
    };


    const features = [
        {
            title: "Instant Appointments",
            desc: "Book your consultation with top specialists in just a few clicks. No more waiting lines.",
            longDesc: "Our streamlined booking system connects you with world-class specialists instantly. We've eliminated the traditional waiting process with a real-time availability engine that respects your schedule.",
            details: ["Real-time availability", "Instant confirmation", "Seamless rescheduling", "Doctor-patient matching"],
            solutionAction: "Book Consultation",
            solutionPath: "/register",
            icon: <FiUserCheck className="text-3xl" />,
            color: "bg-emerald-500"
        },
        {
            title: "Al Diagnosis",
            desc: "Advanced rule-based AI helper to analyze your symptoms and suggest the right care.",
            longDesc: "Leverage the power of integrated healthcare intelligence. Our AI companion analyzes your symptoms across thousands of medical data points to provide initial guidance and direct you to the right specialist.",
            details: ["Symptom analysis", "Triage guidance", "Multi-factor assessment", "24/7 Availability"],
            solutionAction: "Start AI Checkup",
            solutionPath: "/predict-disease",
            icon: <FiActivity className="text-3xl" />,
            color: "bg-teal-500"
        },
        {
            title: "Digital Reports",
            desc: "Access your medical history and reports securely from anywhere at any time.",
            longDesc: "Your health records, fully digitized and secured. Access detailed consultation summaries, laboratory results, and prescription history from one unified dashboard.",
            details: ["Secure storage", "Instant access", "HIPAA compliant", "Cloud synchronization"],
            solutionAction: "Access My Reports",
            solutionPath: "/appointments",
            icon: <FiShield className="text-3xl" />,
            color: "bg-indigo-500"
        },
        {
            title: "Cardiology",
            desc: "Expert heart care offering comprehensive diagnostics and preventive cardiology solutions.",
            longDesc: "Our Cardiology department focuses on the prevention, diagnosis, and treatment of heart-related conditions. We use high-precision tools to monitor cardiac health and provide life-long care plans.",
            details: ["Echocardiography", "Stress testing", "Arhythmia management", "Preventive heart care"],
            solutionAction: "Find Cardiologist",
            solutionPath: "/register",
            icon: <FaHeartbeat className="text-3xl" />,
            color: "bg-rose-500"
        },
        {
            title: "Neurology",
            desc: "Advanced diagnosis and personalized treatment plans for all neurological disorders.",
            longDesc: "Addressing complex brain and nervous system disorders with precision. Our specialists handle everything from chronic migraine management to post-stroke rehabilitation.",
            details: ["EEG/EMG analysis", "Stroke recovery", "Dementia care", "Nerve conduction studies"],
            solutionAction: "Find Neurologist",
            solutionPath: "/register",
            icon: <FaBrain className="text-3xl" />,
            color: "bg-violet-500"
        },
        {
            title: "Orthopedics",
            desc: "Specialized care for bones, joints, and ligaments to restore your movement.",
            longDesc: "Restoring mobility and quality of life through expert orthopedic intervention. We specialize in sports injuries, age-related joint care, and physical therapy integration.",
            details: ["Joint replacement", "Sports medicine", "Fracture care", "Back & Neck pain"],
            solutionAction: "Find Orthopedic",
            solutionPath: "/register",
            icon: <FaBone className="text-3xl" />,
            color: "bg-amber-500"
        },
        {
            title: "Dermatology",
            desc: "Comprehensive skin care treatments for healthy, glowing, and disease-free skin.",
            longDesc: "Transforming skin health through clinical excellence. Our dermatologists provide advanced solutions for chronic conditions, aesthetic concerns, and pediatric skin care.",
            details: ["Acne treatment", "Skin cancer screening", "Cosmetic procedures", "Eczema management"],
            solutionAction: "Find Dermatologist",
            solutionPath: "/register",
            icon: <FaAllergies className="text-3xl" />,
            color: "bg-pink-500"
        },
        {
            title: "Pediatrics",
            desc: "Compassionate and dedicated healthcare for infants, children, and adolescents.",
            longDesc: "Ensuring your child's growth and health with expert pediatric care. From routine immunizations to adolescent medicine, we provide a supportive environment for families.",
            details: ["Growth monitoring", "Immunization programs", "Childhood asthma", "Developmental screening"],
            solutionAction: "Find Pediatrician",
            solutionPath: "/register",
            icon: <FaBaby className="text-3xl" />,
            color: "bg-sky-500"
        },
        {
            title: "General Medicine",
            desc: "Primary care services focusing on overall health, prevention, and wellness.",
            longDesc: "The foundation of health management. Our primary care physicians focus on the WHOLE patient, providing preventive screenings and managing multi-system health conditions.",
            details: ["Health screenings", "Chronic disease management", "Viral care", "Annual check-ups"],
            solutionAction: "Find General Physician",
            solutionPath: "/register",
            icon: <FaStethoscope className="text-3xl" />,
            color: "bg-blue-500"
        }
    ];

    // Static fallback doctors shown when API returns empty
    const staticDoctors = [
        {
            _id: 'static-1',
            name: 'Dr. Sarah Mitchell',
            specialization: 'Cardiology',
            experience: '15+ Years in Cardiovascular Medicine',
            gender: 'female',
            feesPerConsultation: 150,
            address: 'Heart Care Center, New York, NY',
            bio: 'Board-certified cardiologist specializing in preventive cardiology and heart disease management. Committed to providing compassionate, evidence-based care.',
            timings: { start: '09:00', end: '17:00' },
            image: '/doctors/dr-sarah.png',
            isAvailable: true,
            isStatic: true,
        },
        {
            _id: 'static-2',
            name: 'Dr. James Anderson',
            specialization: 'Neurology',
            experience: '20+ Years in Neurological Care',
            gender: 'male',
            feesPerConsultation: 175,
            address: 'Brain & Spine Institute, Boston, MA',
            bio: 'Expert neurologist with extensive experience in treating complex neurological disorders including epilepsy, stroke, and neurodegenerative diseases.',
            timings: { start: '08:00', end: '16:00' },
            image: '/doctors/dr-james.png',
            isAvailable: true,
            isStatic: true,
        },
        {
            _id: 'static-3',
            name: 'Dr. Emily Chen',
            specialization: 'Pediatrics',
            experience: '12+ Years in Child Healthcare',
            gender: 'female',
            feesPerConsultation: 120,
            address: "Children's Wellness Center, San Francisco, CA",
            bio: 'Dedicated pediatrician passionate about children\'s health and development, from newborns to adolescents.',
            timings: { start: '09:00', end: '17:00' },
            image: '/doctors/dr-emily.png',
            isAvailable: true,
            isStatic: true,
        },
        {
            _id: 'static-4',
            name: 'Dr. Michael Roberts',
            specialization: 'Orthopedic Surgery',
            experience: '18+ Years in Orthopedics',
            gender: 'male',
            feesPerConsultation: 200,
            address: 'Sports Medicine & Orthopedic Center, Los Angeles, CA',
            bio: 'Renowned orthopedic surgeon specializing in sports injuries, joint replacement, and minimally invasive procedures.',
            timings: { start: '10:00', end: '18:00' },
            image: '/doctors/dr-michael.png',
            isAvailable: true,
            isStatic: true,
        },
        {
            _id: 'static-5',
            name: 'Dr. Priya Sharma',
            specialization: 'Dermatology',
            experience: '10+ Years in Skin Care',
            gender: 'female',
            feesPerConsultation: 130,
            address: 'Advanced Dermatology Clinic, Miami, FL',
            bio: 'Expert dermatologist offering comprehensive skin care solutions including medical, surgical, and cosmetic dermatology.',
            timings: { start: '09:00', end: '17:00' },
            image: '/doctors/dr-priya.png',
            isAvailable: true,
            isStatic: true,
        },
        {
            _id: 'static-6',
            name: 'Dr. David Thompson',
            specialization: 'General Medicine',
            experience: '25+ Years in Family Practice',
            gender: 'male',
            feesPerConsultation: 100,
            address: 'Community Health Center, Chicago, IL',
            bio: 'Experienced family physician providing comprehensive primary care for patients of all ages, focusing on preventive medicine.',
            timings: { start: '08:00', end: '16:00' },
            image: '/doctors/dr-david.png',
            isAvailable: true,
            isStatic: true,
        },
    ];

    // Fetch doctors from backend
    const getAllDoctors = async () => {
        try {
            const res = await api.get('/user/getAllDoctors');
            if (res.data.success && res.data.data && res.data.data.length > 0) {
                setDoctors(res.data.data);
            } else {
                // Fallback to static data if API returns empty
                setDoctors(staticDoctors);
            }
        } catch (error) {
            console.error('Error fetching doctors, using static data', error);
            // Fallback to static data on error
            setDoctors(staticDoctors);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllDoctors();
    }, []);

    const handleEditClick = () => {
        setEditForm({
            _id: selectedDoc._id,
            name: selectedDoc.name,
            specialization: selectedDoc.specialization || '',
            experience: selectedDoc.experience || '',
            address: selectedDoc.address || '',
            bio: selectedDoc.bio || '',
            feesPerConsultation: selectedDoc.feesPerConsultation || 0,
            timings: {
                start: selectedDoc.timings?.start || '',
                end: selectedDoc.timings?.end || ''
            }
        });
        setIsEditMode(true);
    };

    const handleSave = async (data = editForm) => {
        try {
            setSaving(true);
            const res = await api.post('/user/updateDoctorPublic', data, {
                headers: { Authorization: "Bearer " + token }
            });
            if (res.data.success) {
                message.success('Doctor details updated successfully!');
                setSelectedDoc(res.data.data); // Update modal with new data
                setIsEditMode(false);
                getAllDoctors(); // Refresh list
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            message.error('Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e, doctorId) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 1024 * 1024) { // 1MB limit for Base64 efficiency
            message.error('Image must be less than 1MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64Image = reader.result;
                const res = await api.post('/user/updateDoctorPublic', {
                    _id: doctorId,
                    image: base64Image
                }, {
                    headers: { Authorization: "Bearer " + token }
                });
                if (res.data.success) {
                    message.success('Profile picture updated!');
                    if (selectedDoc?._id === doctorId) {
                        setSelectedDoc(res.data.data);
                    }
                    getAllDoctors();
                }
            } catch (error) {
                console.error(error);
                message.error('Failed to upload image');
            }
        };
        reader.readAsDataURL(file);
    };

    // Helper to get image based on gender
    const getDoctorImg = (doc) => {
        if (doc.image) {
            // If it's a base64 or full URL, return as is
            if (doc.image.startsWith('data:') || doc.image.startsWith('http')) return doc.image;

            // If it has 'females/' or 'males/' prefix, strip it (likely data correction needed)
            let imgPath = doc.image;
            if (imgPath.includes('/')) {
                imgPath = imgPath.split('/').pop();
            }

            // Return with correct path
            return `/doctors/${imgPath}`;
        }

        // Use gender-specific default images
        if (doc.gender && doc.gender.toLowerCase() === 'female') {
            return "/doctors/female-doctor.png";
        } else if (doc.gender && doc.gender.toLowerCase() === 'male') {
            return "/doctors/male-doctor.png";
        }
        // Fallback to female doctor image if gender not purely specified or missing
        return "/doctors/female-doctor.png";
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 selection:bg-primary selection:text-white transition-colors duration-300 pt-10">
            <div className="fixed top-0 w-full z-[60]">
                <TopBar />
            </div>
            {/* Header / Navbar */}
            <header className="fixed top-10 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
                <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            <FiActivity className="text-white text-xl" />
                        </div>
                        <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Smart<span className="text-primary">Health</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-10 text-slate-600 font-semibold tracking-wide">
                        <a href="#services" className="text-primary hover:text-emerald-700 transition-colors">Services</a>
                        <a href="#doctors" className="text-primary hover:text-emerald-700 transition-colors">Top Doctors</a>
                        <a href="#about" className="text-primary hover:text-emerald-700 transition-colors">Why Us</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        {token ? (
                            <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20">
                                Go to Dashboard
                            </button>
                        ) : (
                            <>
                                <Link to="/login" className="text-slate-600 dark:text-slate-200 font-bold hover:text-primary transition-colors px-4">Login</Link>
                                <Link to="/register" className="px-7 py-3 bg-primary text-white rounded-full font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-primary/20">
                                    Join Now
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 overflow-hidden relative">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-16 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Trusted Healthcare Solutions
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black leading-[0.95] mb-8">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400">
                                Modern Care for
                            </span> <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-600 to-indigo-600">
                                Modern Life.
                            </span>
                        </h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-lg leading-relaxed font-medium">
                            The all-in-one assistant for your family&apos;s health. Connect with doctors, get AI-powered insights, and manage everything in one secure place.
                        </p>
                        <div className="flex flex-wrap gap-5">
                            <Link to="/register" className="px-10 py-5 bg-primary text-white text-lg font-bold rounded-2xl shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-3 group">
                                Book Appointment <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#services" className="px-10 py-5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-lg font-bold rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                                Our Services
                            </a>
                        </div>

                        <div className="mt-12 flex items-center gap-6">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                                    </div>
                                ))}
                                <div className="w-12 h-12 rounded-full border-4 border-white bg-primary flex items-center justify-center text-white text-xs font-bold font-mono">
                                    +5k
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm font-medium">Joined by <span className="text-slate-900 font-bold">5,000+</span> patients earlier this week</p>
                        </div>
                    </motion.div>

                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="relative z-10 rounded-3xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(37,99,235,0.25)] border-[12px] border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
                        >
                            <HeroSlideshow />
                        </motion.div>
                        {/* Decorative background elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-32 bg-white dark:bg-slate-900 relative transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-primary mb-6 uppercase italic">Services Designed <br /> <span className="text-slate-900 dark:text-white border-b-8 border-primary/20 pb-2">Around You.</span></h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-100 dark:hover:border-slate-600 hover:shadow-2xl hover:shadow-slate-100 dark:hover:shadow-slate-900 transition-all group cursor-pointer"
                                onClick={() => setSelectedService(f)}
                            >
                                <div className={`${f.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl shadow-emerald-200 group-hover:scale-110 transition-transform`}>
                                    {f.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">{f.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{f.desc}</p>
                                <div className="mt-6 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                    Read More <FiArrowRight />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Doctors Showcase */}
            <section id="doctors" className="py-32 bg-slate-50 dark:bg-slate-800 relative overflow-hidden transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                        <div id="about">
                            <h2 className="text-4xl font-black text-primary mb-4 tracking-tight uppercase italic leading-[0.9]">Meet Our <br /> <span className="text-slate-900 dark:text-white">Top Specialists</span></h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium italic uppercase tracking-widest text-xs">Why SmartHealth? because we host the World-class experts.</p>
                        </div>
                        <Link to="/register" className="px-8 py-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm">
                            View All Doctors
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-slate-400">Loading doctors...</div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {doctors.length > 0 ? doctors.map((doc, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    onClick={() => { setSelectedDoc(doc); setIsEditMode(false); }}
                                    className="group relative cursor-pointer"
                                >
                                    <div className={`relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-xl group-hover:shadow-2xl transition-all bg-slate-200`}>
                                        <img
                                            src={getDoctorImg(doc)}
                                            alt={doc.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={e => { e.target.onerror = null; e.target.src = doc.gender === 'male' ? '/doctors/male-doctor.png' : '/doctors/female-doctor.png'; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                                        <div className="absolute bottom-0 left-0 p-8 w-full translate-y-2 group-hover:translate-y-0 transition-transform">
                                            <p className="text-primary text-xs font-black uppercase tracking-[0.2em] mb-2">{doc.specialization || 'Specialist'}</p>
                                            <h4 className="text-2xl font-black text-white mb-1 tracking-tight">
                                                {doc.name.toLowerCase().startsWith('dr') ? doc.name : `Dr. ${doc.name}`}
                                            </h4>
                                            <p className="text-white/60 text-sm font-medium">{doc.experience || 'Experienced'}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="col-span-3 text-center py-10 text-slate-400">
                                    No doctors found. Please register as a doctor.
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {/* Decorative mesh gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#e2e8f0_0%,_transparent_50%)]"></div>
            </section>

            {/* CTA section */}
            <section className="py-32 px-6">
                <div className="max-w-6xl mx-auto rounded-[3rem] bg-blue-950 p-4 md:p-8 relative overflow-hidden flex flex-col items-center text-center">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]"></div>

                    <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter leading-[0.95] z-10">
                        Ready to Take <br /> <span className="text-primary italic">Better Care?</span>
                    </h2>
                    <p className="text-white/50 text-xl font-medium mb-6 max-w-xl z-10">
                        Join thousands of patients who have already transformed their healthcare experience with SmartHealth.
                    </p>
                    <Link to="/register" className="px-12 py-6 bg-primary text-white text-xl font-black rounded-3xl shadow-2xl shadow-primary/40 hover:-translate-y-2 transition-all z-10 uppercase tracking-tight italic">
                        Start Now - It&apos;s Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-20 text-center md:text-left">
                    <div className="col-span-1 md:col-span-1 flex flex-col items-center md:items-start">
                        <div className="flex items-center gap-2 mb-8">
                            <FiActivity className="text-primary text-2xl" />
                            <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Smart<span className="text-primary">Health</span></span>
                        </div>
                        <p className="text-slate-400 font-medium leading-relaxed">Modern healthcare solutions accessible to everyone, anywhere.</p>
                    </div>
                    <div>
                        <h5 className="text-slate-900 dark:text-white font-black mb-8 uppercase tracking-widest text-sm italic">Product</h5>
                        <ul className="text-slate-500 dark:text-slate-400 font-bold space-y-4">
                            <li><button onClick={() => setSelectedFooterInfo(footerDetails["Features"])} className="hover:text-primary transition-colors">Features</button></li>
                            <li><button onClick={() => setSelectedFooterInfo(footerDetails["Pricing"])} className="hover:text-primary transition-colors">Pricing</button></li>
                            <li><button onClick={() => setSelectedFooterInfo(footerDetails["AI Diagnosis"])} className="hover:text-primary transition-colors">AI Diagnosis</button></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-slate-900 dark:text-white font-black mb-8 uppercase tracking-widest text-sm italic">Company</h5>
                        <ul className="text-slate-500 dark:text-slate-400 font-bold space-y-4">
                            <li><button onClick={() => setSelectedFooterInfo(footerDetails["About Us"])} className="hover:text-primary transition-colors">About Us</button></li>
                            <li><button onClick={() => setSelectedFooterInfo(footerDetails["Careers"])} className="hover:text-primary transition-colors">Careers</button></li>
                            <li><button onClick={() => setSelectedFooterInfo(footerDetails["News"])} className="hover:text-primary transition-colors">News</button></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-slate-900 dark:text-white font-black mb-8 uppercase tracking-widest text-sm italic">Connect</h5>
                        <div className="flex justify-center md:justify-start gap-4">
                            {/* Social Icons Placeholder */}
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all cursor-pointer">
                                    <FiActivity />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-400 text-sm font-bold">© 2024 SmartHealth Assistant. All Rights Reserved.</p>
                    <div className="flex gap-8 text-slate-400 text-sm font-bold uppercase tracking-widest">
                        <a href="#" className="hover:text-slate-900">Privacy</a>
                        <a href="#" className="hover:text-slate-900">Terms</a>
                    </div>
                </div>
            </footer>
            {/* Doctor Detail Modal */}
            <AnimatePresence>
                {selectedDoc && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedDoc(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <button onClick={() => setSelectedDoc(null)} className="absolute top-8 right-8 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all z-20 font-bold shadow-sm">
                                <FiX />
                            </button>

                            <div className="flex flex-col md:flex-row h-full">
                                <div className="md:w-1/2 aspect-square md:aspect-auto relative group">
                                    <img
                                        src={getDoctorImg(selectedDoc)}
                                        alt={selectedDoc.name}
                                        className="w-full h-full object-cover"
                                        onError={e => { e.target.onerror = null; e.target.src = selectedDoc.gender === 'male' ? '/doctors/male-doctor.png' : '/doctors/female-doctor.png'; }}
                                    />

                                    {((user?.role === 'admin' || user?.isAdmin) || String(user?._id) === String(selectedDoc?._id) || String(user?._id) === String(selectedDoc?.userId)) && (
                                        <>
                                            <input
                                                type="file"
                                                id="doctor-image-upload"
                                                className="hidden"
                                                accept="image/*"
                                                capture="environment"
                                                onChange={(e) => handleImageUpload(e, selectedDoc._id)}
                                            />
                                            <label
                                                htmlFor="doctor-image-upload"
                                                className="absolute inset-0 bg-black/30 hover:bg-black/50 transition-all flex flex-col items-center justify-center text-white cursor-pointer backdrop-blur-[1px] group/upload pointer-events-auto"
                                            >
                                                <div className="transform group-hover/upload:scale-110 transition-transform pointer-events-none">
                                                    <FiCamera size={48} className="mb-3 drop-shadow-lg" />
                                                    <span className="font-black uppercase tracking-widest text-sm drop-shadow-lg">Click to Change Photo</span>
                                                </div>
                                            </label>

                                            {!isEditMode && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleEditClick();
                                                    }}
                                                    className="absolute bottom-4 right-4 bg-primary text-white p-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all z-30 border-2 border-white flex items-center gap-2 font-black uppercase tracking-widest text-[10px] pointer-events-auto"
                                                    title="Edit Profile"
                                                >
                                                    <FiEdit2 size={16} /> Edit Profile
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="md:w-1/2 p-10 md:p-12 flex flex-col justify-center bg-white">
                                    {isEditMode ? (
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-bold text-slate-800 mb-2">Edit Profile</h3>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Specialization</label>
                                                <input
                                                    type="text"
                                                    value={editForm.specialization}
                                                    onChange={e => setEditForm({ ...editForm, specialization: e.target.value })}
                                                    className="w-full p-3 bg-slate-50 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Experience</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.experience}
                                                        onChange={e => setEditForm({ ...editForm, experience: e.target.value })}
                                                        className="w-full p-3 bg-slate-50 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Fees (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={editForm.feesPerConsultation}
                                                        onChange={e => setEditForm({ ...editForm, feesPerConsultation: e.target.value })}
                                                        className="w-full p-3 bg-slate-50 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Start Time</label>
                                                    <input
                                                        type="text"
                                                        placeholder="HH:MM"
                                                        value={editForm.timings.start}
                                                        onChange={e => setEditForm({ ...editForm, timings: { ...editForm.timings, start: e.target.value } })}
                                                        className="w-full p-3 bg-slate-50 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">End Time</label>
                                                    <input
                                                        type="text"
                                                        placeholder="HH:MM"
                                                        value={editForm.timings.end}
                                                        onChange={e => setEditForm({ ...editForm, timings: { ...editForm.timings, end: e.target.value } })}
                                                        className="w-full p-3 bg-slate-50 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Address</label>
                                                <input
                                                    type="text"
                                                    value={editForm.address}
                                                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                                                    className="w-full p-3 bg-slate-50 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Bio</label>
                                                <textarea
                                                    value={editForm.bio}
                                                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                                    rows={3}
                                                    className="w-full p-3 bg-slate-50 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                ></textarea>
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button onClick={() => setIsEditMode(false)} className="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                                                <button onClick={() => handleSave()} disabled={saving} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                                                    {saving ? 'Saving...' : <><FiSave /> Save</>}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Specialist Profile</span>
                                            <h3 className="text-4xl font-black text-slate-900 mb-2 italic uppercase leading-none italic">
                                                {selectedDoc.name.toLowerCase().startsWith('dr') ? selectedDoc.name : `Dr. ${selectedDoc.name}`}
                                            </h3>
                                            <p className="text-emerald-600 font-black uppercase tracking-widest text-[10px] mb-8">{selectedDoc.specialization || 'General Practitioner'}</p>

                                            <div className="space-y-4 mb-10">
                                                <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-[1.5rem] relative group/edit">
                                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary text-2xl">
                                                        <FiClock />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Hours</p>
                                                        <p className="text-xl font-black text-slate-800 italic leading-none mt-1">{selectedDoc.timings?.start || '-'} - {selectedDoc.timings?.end || '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-[1.5rem] relative group/edit">
                                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary text-2xl">
                                                        <FiCreditCard />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consultation Fee</p>
                                                        <p className="text-2xl font-black text-slate-800 italic leading-none mt-1">₹{selectedDoc.feesPerConsultation || '0'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 pt-4 text-slate-300">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-slate-800 font-black text-lg leading-none italic">{selectedDoc.experience || '0'}Y+</span>
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
                                            </div>

                                            <div className="border-t border-slate-100 pt-8">
                                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-4">About Doctor</p>
                                                <p className="text-slate-600 text-sm leading-relaxed font-medium mb-8">
                                                    {selectedDoc.bio || 'No biography available.'}
                                                </p>
                                                <div className="flex gap-4">
                                                    <Link to="/register" onClick={() => setSelectedDoc(null)} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest italic flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-primary/20 text-xs">
                                                        Book Now <FiArrowRight />
                                                    </Link>
                                                    <button onClick={handleEditClick} className="w-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center text-xl hover:bg-slate-200 transition-all">
                                                        <FiEdit2 />
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Service Detail Modal */}
            <AnimatePresence>
                {selectedService && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedService(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-[3rem] p-12 shadow-2xl relative border border-white/20"
                            onClick={e => e.stopPropagation()}
                        >
                            <button onClick={() => setSelectedService(null)} className="absolute top-8 right-8 w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all z-20 font-bold shadow-sm">
                                <FiX />
                            </button>

                            <div className={`${selectedService.color} w-20 h-20 rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl shadow-emerald-200 group-hover:scale-110 transition-transform`}>
                                {selectedService.icon}
                            </div>

                            <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-6 uppercase italic tracking-tighter leading-none">
                                {selectedService.title}
                            </h3>

                            <div className="space-y-8">
                                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    {selectedService.longDesc}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedService.details?.map((detail, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all group/item hover:border-primary/30">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 italic">
                                                {detail}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-12 flex gap-4">
                                <button
                                    onClick={() => setSelectedService(null)}
                                    className="flex-1 py-5 border-2 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs italic hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        const path = token ? selectedService.solutionPath : '/register';
                                        setSelectedService(null);
                                        navigate(path);
                                    }}
                                    className="flex-[2] py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-tight italic flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-primary/20 text-sm"
                                >
                                    {selectedService.solutionAction} <FiArrowRight />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Footer Info Modal */}
            <AnimatePresence>
                {selectedFooterInfo && (
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedFooterInfo(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[2.5rem] p-12 shadow-2xl relative border border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <button onClick={() => setSelectedFooterInfo(null)} className="absolute top-8 right-8 w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all font-bold shadow-sm">
                                <FiX />
                            </button>

                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase italic tracking-tighter">
                                {selectedFooterInfo.title}
                            </h3>

                            <div className="space-y-6">
                                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    {selectedFooterInfo.desc}
                                </p>

                                <div className="space-y-3">
                                    {selectedFooterInfo.points.map((p, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 italic">{p}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedFooterInfo(null)}
                                className="w-full mt-10 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest italic hover:bg-emerald-600 transition-all shadow-xl shadow-primary/20 text-xs"
                            >
                                Got it
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPage;
