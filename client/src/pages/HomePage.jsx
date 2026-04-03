import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/layout/Layout';
import { Row, Col, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiActivity, FiCalendar, FiClock, FiPlusCircle, FiSearch, FiStar, FiArrowRight, FiUserCheck, FiHash, FiDroplet, FiEdit2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

const HomePage = () => {
    const { user } = useSelector(state => state.user);
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [selectedSpec, setSelectedSpec] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all', 'available', 'unavailable'
    const [showDoctorModal, setShowDoctorModal] = useState(false);
    // For Quick Edit
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [tempData, setTempData] = useState({ timings: { start: '', end: '' }, feesPerConsultation: 0 });

    const [statsData, setStatsData] = useState({
        upcomingAppointmentsCount: 0,
        pastVisitsCount: 0,
        aiDiagnosisCount: 0
    });

    const handleQuickEditSave = async () => {
        try {
            const res = await api.post('/user/updateDoctorPublic', {
                _id: editingDoctor._id,
                timings: tempData.timings,
                feesPerConsultation: tempData.feesPerConsultation
            }, {
                headers: { Authorization: "Bearer " + localStorage.getItem('token') }
            });
            if (res.data.success) {
                message.success("Doctor info updated!");
                setShowEditModal(false);
                getUserData(); // Refresh list
            }
        } catch (error) {
            message.error("Failed to update doctor info");
        }
    };

    const getDashboardStats = async () => {
        try {
            const res = await api.get('/user/get-dashboard-stats', {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token'),
                },
            });
            if (res.data.success) {
                setStatsData(res.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getUserData = async () => {
        try {
            const res = await api.get('/user/getAllDoctors', {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token'),
                },
            });
            if (res.data.success) {
                setDoctors(res.data.data);
                setFilteredDoctors(res.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const navigate = useNavigate();

    useEffect(() => {
        getUserData();
        getDashboardStats();
    }, []);

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
        if (doc.gender && doc.gender.toLowerCase() === 'female') return "/doctors/female-doctor.png";
        if (doc.gender && doc.gender.toLowerCase() === 'male') return "/doctors/male-doctor.png";
        return "/doctors/female-doctor.png";
    };

    // Extract unique specializations
    const specializations = ['All', ...new Set(doctors.map(doc => doc.specialization))];

    useEffect(() => {
        let temp = doctors;
        if (selectedSpec !== 'All') {
            temp = temp.filter(doc => doc.specialization === selectedSpec);
        }
        if (searchTerm) {
            temp = temp.filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (availabilityFilter === 'available') {
            temp = temp.filter(doc => doc.isAvailable === true);
        } else if (availabilityFilter === 'unavailable') {
            temp = temp.filter(doc => doc.isAvailable === false);
        }
        setFilteredDoctors(temp);
    }, [selectedSpec, searchTerm, availabilityFilter, doctors]);

    const stats = [
        {
            label: "Upcoming Appointments",
            value: statsData.upcomingAppointmentsCount,
            icon: <FiCalendar />,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            path: user?.isDoctor ? '/doctor-appointments' : '/appointments'
        },
        {
            label: "Past Visits",
            value: statsData.pastVisitsCount,
            icon: <FiClock />,
            color: "text-teal-600",
            bg: "bg-teal-50",
            path: '/appointments'
        },
        {
            label: "AI Diagnosis",
            value: statsData.aiDiagnosisCount,
            icon: <FiActivity />,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            path: '/ai-diagnosis'
        },
    ];

    return (
        <Layout>
            <div className="p-4 md:p-8">
                {/* Welcome & Stats */}
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-8 italic uppercase">Your Health Hub.</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group cursor-pointer"
                                onClick={() => navigate(stat.path)}
                            >
                                <div className={`${stat.bg} ${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                                    {stat.icon}
                                </div>
                                <h3 className="text-4xl font-black text-slate-800 mb-1">{stat.value}</h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-12">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Quick Actions</h2>
                    <div className="flex flex-wrap gap-4">
                        {!user?.isDoctor && (
                            <button
                                onClick={() => setShowDoctorModal(true)}
                                className="px-10 py-5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-2xl font-black italic tracking-tight hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 transition-all flex items-center gap-3 shadow-xl shadow-primary/20"
                            >
                                <FiPlusCircle className="text-2xl" /> BOOK VISIT
                            </button>
                        )}
                        {(user?.isDoctor || user?.isAdmin) && (
                            <button onClick={() => navigate('/verify-appointment')} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black italic tracking-tight hover:bg-emerald-700 transition-all flex items-center gap-3 shadow-xl shadow-emerald-600/20">
                                <FiUserCheck className="text-xl text-white" /> VERIFY APPOINTMENT CODE
                            </button>
                        )}
                        {!user?.isDoctor && (
                            <button onClick={() => navigate('/ai-diagnosis')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black italic tracking-tight hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-xl shadow-indigo-600/20">
                                <FiActivity className="text-xl" /> AI DIAGNOSIS
                            </button>
                        )}
                        <button onClick={() => navigate('/blood-bank')} className="px-8 py-4 bg-red-500 text-white rounded-2xl font-black italic tracking-tight hover:bg-red-600 transition-all flex items-center gap-3 shadow-xl shadow-red-500/20">
                            <FiDroplet className="text-xl" /> BLOOD BANK
                        </button>
                        <button onClick={() => navigate(user?.isDoctor ? '/doctor-appointments' : '/appointments')} className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black italic tracking-tight hover:bg-slate-50 transition-all flex items-center gap-3">
                            <FiCalendar className="text-xl" /> {user?.isDoctor ? 'MY APPOINTMENTS' : 'VIEW APPOINTMENTS'}
                        </button>
                    </div>
                </div>

                {/* Main Content: Doctor Listings */}
                <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none italic uppercase">Available Doctors</h2>
                            <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">Book with top rated specialists</p>
                        </div>

                        {/* Filter Bar */}
                        <div className="flex flex-wrap gap-3">

                            {/* Specialization Filter */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                {specializations.map(spec => (
                                    <button
                                        key={spec}
                                        onClick={() => setSelectedSpec(spec)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedSpec === spec ? 'bg-slate-800 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        {spec}
                                    </button>
                                ))}
                            </div>

                            {/* Search Box */}
                            <div className="bg-white border border-slate-100 p-2 rounded-xl flex items-center gap-2 px-4 text-slate-400 min-w-[200px]">
                                <FiSearch />
                                <input
                                    type="text"
                                    placeholder="Search doctor..."
                                    className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-600 placeholder:text-slate-300 w-full outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <Row gutter={[24, 24]}>
                        {filteredDoctors && filteredDoctors.length > 0 ? (
                            filteredDoctors.map((doctor, i) => (
                                <Col xs={24} md={12} lg={8} key={doctor._id}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all cursor-pointer group"
                                        onClick={() => navigate(`/doctor/book-appointment/${doctor._id}`)}
                                    >
                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="h-24 w-24 rounded-2xl overflow-hidden shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform bg-slate-100 flex items-center justify-center relative group/avatar">
                                                {doctor.image || doctor.gender ? (
                                                    <img src={getDoctorImg(doctor)} alt={doctor.name || 'Doctor'} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black">
                                                        {doctor.name?.charAt(0).toUpperCase() || 'D'}
                                                    </div>
                                                )}

                                                {/* Unified Edit Button - Always Visible for Authorized */}
                                                {((user?.role === 'admin' || user?.isAdmin) || String(user?._id) === String(doctor?._id) || String(user?._id) === String(doctor?.userId)) && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingDoctor(doctor);
                                                            setTempData({ timings: doctor.timings, feesPerConsultation: doctor.feesPerConsultation });
                                                            setShowEditModal(true);
                                                        }}
                                                        className="absolute top-2 right-2 w-8 h-8 bg-primary text-white shadow-lg rounded-lg flex items-center justify-center hover:bg-slate-800 transition-all hover:scale-110 z-10 border-2 border-white"
                                                        title="Edit Profile"
                                                    >
                                                        <FiEdit2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="flex items-center gap-1 text-yellow-400 text-[10px] font-bold">
                                                        <FiStar /> 4.9
                                                    </div>
                                                </div>
                                                <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-[0.85] italic uppercase mb-2">
                                                    {doctor.name?.toLowerCase().startsWith('dr') ? doctor.name : `Dr. ${doctor.name || 'Unknown'}`}
                                                </h2>
                                                <p className="text-primary font-black uppercase tracking-widest text-[10px] mt-2">{doctor.specialization}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.5rem] relative group/edit">
                                                <FiClock className="text-primary text-xl" />
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Hours</p>
                                                    <p className="text-lg font-black text-slate-800 italic leading-none">{doctor.timings?.start || '-'} - {doctor.timings?.end || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex items-center justify-end px-2">
                                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center group-hover:bg-primary transition-colors" title="Book Now">
                                                <FiArrowRight />
                                            </div>
                                        </div>
                                    </motion.div>
                                </Col>
                            ))
                        ) : (
                            <Col span={24}>
                                <div className="py-20 bg-white border border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 text-4xl mb-6">
                                        <FiActivity />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter italic uppercase mb-2 leading-none">No Specialists Found.</h3>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-10">Try changing your filters or search term.</p>
                                    <button
                                        onClick={() => { setSelectedSpec('All'); setSearchTerm(''); }}
                                        className="px-10 py-5 bg-primary text-white rounded-[1.5rem] font-black italic uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-4"
                                    >
                                        Clear Filters <FiArrowRight />
                                    </button>
                                </div>
                            </Col>
                        )}
                    </Row>
                </div>

                {/* Doctor Selection Modal */}
                {showDoctorModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowDoctorModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative max-h-[85vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 p-8 border-b border-slate-100">
                                <button onClick={() => setShowDoctorModal(false)} className="absolute top-6 right-6 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all font-bold shadow-sm">
                                    ×
                                </button>
                                <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase mb-2">Select Doctor</h2>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Choose a specialist for your consultation</p>
                            </div>

                            <div className="p-8">
                                {/* Search and Filter */}
                                <div className="flex flex-wrap gap-3 mb-8">
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {specializations.map(spec => (
                                            <button
                                                key={spec}
                                                onClick={() => setSelectedSpec(spec)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedSpec === spec ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100'}`}
                                            >
                                                {spec}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Doctor Grid */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {filteredDoctors && filteredDoctors.length > 0 ? (
                                        filteredDoctors.map((doctor) => (
                                            <motion.div
                                                key={doctor._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group"
                                                onClick={() => {
                                                    setShowDoctorModal(false);
                                                    navigate(`/doctor/book-appointment/${doctor._id}`);
                                                }}
                                            >
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform bg-slate-100 flex items-center justify-center">
                                                        {doctor.image || doctor.gender ? (
                                                            <img src={getDoctorImg(doctor)} alt={doctor.name || 'Doctor'} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black">
                                                                {doctor.name?.charAt(0).toUpperCase() || 'D'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="flex items-center gap-1 text-yellow-400 text-[10px] font-bold">
                                                                <FiStar /> 4.9
                                                            </div>
                                                        </div>
                                                        <h3 className="text-xl font-black text-slate-800 tracking-tighter leading-[0.85] italic uppercase mb-2">
                                                            {doctor.name?.toLowerCase().startsWith('dr') ? doctor.name : `Dr. ${doctor.name || 'Unknown'}`}
                                                        </h3>
                                                        <p className="text-primary font-black uppercase tracking-widest text-[10px] mt-1">{doctor.specialization}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 mb-6">
                                                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl">
                                                        <FiClock className="text-primary text-lg" />
                                                        <div className="text-left">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Available Hours</p>
                                                            <span className="text-sm font-black text-slate-700 italic">{doctor.timings?.start || '-'} - {doctor.timings?.end || '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex items-center justify-end">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center group-hover:bg-primary transition-colors">
                                                        <FiArrowRight />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 py-12 text-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 text-3xl mb-4 mx-auto">
                                                <FiActivity />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-800 tracking-tighter italic uppercase mb-2">No Doctors Found</h3>
                                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Try changing your filter</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
                {/* Quick Edit Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowEditModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-black text-slate-800 italic uppercase mb-6">Quick Edit Info.</h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Start Time</label>
                                        <input
                                            type="text"
                                            placeholder="eg. 09:00 AM"
                                            className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-bold outline-none border-none focus:ring-0"
                                            value={tempData.timings?.start}
                                            onChange={e => setTempData({ ...tempData, timings: { ...tempData.timings, start: e.target.value } })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">End Time</label>
                                        <input
                                            type="text"
                                            placeholder="eg. 05:00 PM"
                                            className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-bold outline-none border-none focus:ring-0"
                                            value={tempData.timings?.end}
                                            onChange={e => setTempData({ ...tempData, timings: { ...tempData.timings, end: e.target.value } })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Fees (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-bold outline-none border-none focus:ring-0"
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

export default HomePage;
