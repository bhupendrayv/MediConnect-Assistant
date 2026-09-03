import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiSearch, FiArrowLeft, FiCalendar, FiUser, FiPhone, FiHash, FiCheckCircle, FiClock, FiFileText, FiShare2 } from 'react-icons/fi';
import api from '../services/api';
import TopBar from '../components/layout/TopBar';
import ThemeToggle from '../components/ThemeToggle';

const CheckStatus = () => {
    const [searchCode, setSearchCode] = useState('');
    const [searchMobile, setSearchMobile] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchCode && !searchMobile) {
            setError('Please enter an Appointment Code or Mobile Number.');
            return;
        }
        setError('');
        setLoading(true);
        setResults(null);

        try {
            const res = await api.post('/user/search-appointments-by-mobile', {
                query: searchCode || searchMobile,
                mobileNumber: searchMobile
            });

            if (res.data.success) {
                if (res.data.data.length === 0) {
                    setError('No appointments found. Please check your details and try again.');
                } else {
                    setResults(res.data.data);
                }
            } else {
                setError(res.data.message || 'No records found.');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'approved': return { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Approved', icon: <FiCheckCircle /> };
            case 'completed': return { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: '✅ Checkup Completed', icon: <FiCheckCircle /> };
            case 'reject': case 'rejected': return { color: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected', icon: <FiClock /> };
            case 'cancelled': return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Cancelled', icon: <FiClock /> };
            default: return { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Pending', icon: <FiClock /> };
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300 pt-10">
            <div className="fixed top-0 w-full z-[60]">
                <TopBar />
            </div>

            {/* Simple Header */}
            <header className="fixed top-10 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
                <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group cursor-pointer">
                        <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            <FiActivity className="text-white text-xl" />
                        </div>
                        <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Smart<span className="text-primary">Health</span></span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm transition-colors">
                            <FiArrowLeft /> Back to Home
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <div className="pt-44 pb-20 px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-6">
                            <FiSearch className="text-sm" /> No Login Required
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight mb-4">
                            Check Appointment <span className="text-primary">Status</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">
                            Enter your appointment code or mobile number to instantly view your appointment details, doctor notes, and prescription.
                        </p>
                    </motion.div>

                    {/* Search Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 p-8 md:p-10 mb-10"
                    >
                        <form onSubmit={handleSearch} className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-2 tracking-wider">
                                        <FiHash className="inline mr-1" /> Appointment Code
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. HH-ALPF"
                                        value={searchCode}
                                        onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500 tracking-widest"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-2 tracking-wider">
                                        <FiPhone className="inline mr-1" /> Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="e.g. 9876543210"
                                        value={searchMobile}
                                        onChange={(e) => setSearchMobile(e.target.value.replace(/\D/g, ''))}
                                        maxLength={10}
                                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary hover:bg-emerald-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <FiSearch className="text-xl" /> Check Status
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 font-bold text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Results */}
                    <AnimatePresence>
                        {results && results.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-5"
                            >
                                <div className="text-center mb-6">
                                    <span className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-full font-black text-sm">
                                        <FiCheckCircle /> Found {results.length} Appointment{results.length > 1 ? 's' : ''}
                                    </span>
                                </div>

                                {results.map((appt, idx) => {
                                    const statusCfg = getStatusConfig(appt.status);
                                    const isExpanded = expandedId === appt._id;
                                    return (
                                        <motion.div
                                            key={appt._id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.08 }}
                                            className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-lg shadow-slate-100/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 overflow-hidden"
                                        >
                                            {/* Card Header */}
                                            <div
                                                className="p-6 md:p-8 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors"
                                                onClick={() => setExpandedId(isExpanded ? null : appt._id)}
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="bg-primary/10 dark:bg-primary/20 w-14 h-14 rounded-2xl flex items-center justify-center text-primary text-xl flex-shrink-0">
                                                            <FiCalendar />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-black text-slate-800 dark:text-white text-lg">{appt.appointmentCode}</span>
                                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${statusCfg.color}`}>
                                                                    {statusCfg.label}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                                <span>📅 {appt.date}</span>
                                                                <span>⏰ {appt.time}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {appt.paymentStatus === 'paid' ? (
                                                            <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-black uppercase">✅ Paid</span>
                                                        ) : (
                                                            <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-black uppercase">⏳ Pending</span>
                                                        )}
                                                        <div className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                            ▼
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-6 md:px-8 pb-8 space-y-5 border-t border-slate-100 dark:border-slate-700 pt-6">
                                                            {/* Patient & Doctor Info */}
                                                            <div className="grid md:grid-cols-2 gap-4">
                                                                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl space-y-2">
                                                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1"><FiUser /> Patient Details</h4>
                                                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{appt.userInfo?.name || 'N/A'}</p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400">📱 Mobile: {appt.userInfo?.mobileNumber || 'N/A'}</p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400">🧑 {appt.userInfo?.age ? `${appt.userInfo.age} Yrs` : ''} {appt.userInfo?.gender ? `• ${appt.userInfo.gender}` : ''}</p>
                                                                    {appt.userInfo?.problem && <p className="text-xs text-slate-500 dark:text-slate-400">🩺 Problem: {appt.userInfo.problem}</p>}
                                                                </div>
                                                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl space-y-2">
                                                                    <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-1"><FiUser /> Doctor Details</h4>
                                                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{appt.doctorInfo?.name ? (appt.doctorInfo.name.toLowerCase().startsWith('dr') ? appt.doctorInfo.name : `Dr. ${appt.doctorInfo.name}`) : 'N/A'}</p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400">🏥 {appt.doctorInfo?.specialization || appt.department || 'Specialist'}</p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400">💰 Fee: ₹{appt.totalAmount || appt.doctorInfo?.feesPerConsultation || 'N/A'}</p>
                                                                </div>
                                                            </div>

                                                            {/* Payment Info */}
                                                            {appt.transactionId && (
                                                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                                                                    <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-1">Transaction Details</h4>
                                                                    <p className="text-sm font-mono font-bold text-emerald-800 dark:text-emerald-400">TXN ID: {appt.transactionId}</p>
                                                                </div>
                                                            )}

                                                            {/* Selected Services */}
                                                            {appt.selectedServices && appt.selectedServices.length > 0 && (
                                                                <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl">
                                                                    <h4 className="text-[10px] font-black uppercase text-cyan-500 tracking-widest mb-2">Selected Services</h4>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {appt.selectedServices.map((svc, i) => (
                                                                            <span key={i} className="px-3 py-1 bg-cyan-100 dark:bg-cyan-800/30 text-cyan-800 dark:text-cyan-400 rounded-lg text-xs font-bold">{svc.name} (₹{svc.price})</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Doctor Notes & Prescription */}
                                                            {(appt.doctorNotes || appt.prescription || appt.recommendations) && (
                                                                <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-2xl space-y-3">
                                                                    <h4 className="text-[10px] font-black uppercase text-violet-500 tracking-widest flex items-center gap-1"><FiFileText /> Doctor Notes & Prescription</h4>
                                                                    {appt.doctorNotes && (
                                                                        <div>
                                                                            <span className="text-[10px] font-bold uppercase text-slate-400">Clinical Notes:</span>
                                                                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mt-0.5">{appt.doctorNotes}</p>
                                                                        </div>
                                                                    )}
                                                                    {appt.prescription && (
                                                                        <div>
                                                                            <span className="text-[10px] font-bold uppercase text-slate-400">Prescription:</span>
                                                                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mt-0.5">{appt.prescription}</p>
                                                                        </div>
                                                                    )}
                                                                    {appt.recommendations && (
                                                                        <div>
                                                                            <span className="text-[10px] font-bold uppercase text-slate-400">Recommendations:</span>
                                                                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mt-0.5">{appt.recommendations}</p>
                                                                        </div>
                                                                    )}
                                                                    {appt.prescribedAt && (
                                                                        <p className="text-[10px] text-slate-400 font-bold mt-2">📅 Prescribed: {new Date(appt.prescribedAt).toLocaleString()}</p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Transfer History */}
                                                            {appt.transferHistory && appt.transferHistory.length > 0 && (
                                                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl space-y-3">
                                                                    <h4 className="text-[10px] font-black uppercase text-purple-500 tracking-widest flex items-center gap-1"><FiShare2 /> Transfer History ({appt.transferHistory.length})</h4>
                                                                    {appt.transferHistory.map((t, ti) => (
                                                                        <div key={ti} className="p-3 bg-purple-100/50 dark:bg-purple-800/20 rounded-xl text-xs space-y-0.5">
                                                                            <p className="font-bold text-purple-800 dark:text-purple-300">From: {t.fromDoctorName} → To: {t.toDoctorName}</p>
                                                                            {t.reason && <p className="text-purple-600 dark:text-purple-400">Reason: {t.reason}</p>}
                                                                            {t.transferredAt && <p className="text-purple-400 dark:text-purple-500 text-[10px]">{new Date(t.transferredAt).toLocaleString()}</p>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center pb-10 text-slate-400 dark:text-slate-500 text-xs font-medium">
                © {new Date().getFullYear()} SmartHealth. All rights reserved.
            </div>
        </div>
    );
};

export default CheckStatus;
