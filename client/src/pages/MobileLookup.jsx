import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import api from '../services/api';
import dayjs from 'dayjs';
import { Table, Tag, Modal, Input, message } from 'antd';
import { FiSearch, FiPhone, FiCheckCircle, FiFileText, FiClock, FiShare2, FiActivity, FiUser, FiCreditCard } from 'react-icons/fi';
import AppointmentReceipt from '../components/AppointmentReceipt';
import { motion, AnimatePresence } from 'framer-motion';

const MobileLookup = () => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [receiptRecord, setReceiptRecord] = useState(null);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        const searchInput = mobileNumber.trim();
        if (!searchInput) {
            return message.error('Please enter a Mobile Number or Appointment Code');
        }

        try {
            setLoading(true);
            const res = await api.post('/user/search-appointments-by-mobile', { mobileNumber: searchInput });
            setLoading(false);
            setHasSearched(true);
            if (res.data.success) {
                setRecords(res.data.data);
                if (res.data.data.length === 0) {
                    message.info('No medical records found for this reference.');
                }
            } else {
                message.error(res.data.message || 'Error searching records');
            }
        } catch (error) {
            setLoading(false);
            console.error('Search error:', error);
            message.error('Failed to search records.');
        }
    };

    return (
        <Layout>
            <div className="p-4 md:p-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 text-primary text-3xl shadow-lg shadow-primary/10">
                        <FiSearch />
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase mb-2">Patient Records Lookup</h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Search medical history, prescriptions, and status using your Mobile Number</p>
                </div>

                {/* Search Bar Container */}
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 mb-10 max-w-2xl mx-auto">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FiPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                            <input
                                type="text"
                                placeholder="Enter Mobile Number (e.g. +91 9942199618)"
                                value={mobileNumber}
                                onChange={e => setMobileNumber(e.target.value)}
                                className="w-full h-16 bg-slate-50 rounded-2xl pl-14 pr-6 font-bold text-slate-800 border-2 border-transparent focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-16 px-8 bg-primary text-white font-black uppercase tracking-widest italic rounded-2xl hover:bg-emerald-600 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? 'Searching...' : 'Search Records'} <FiSearch />
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                {hasSearched && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-black text-slate-800 italic uppercase">
                                Search Results ({records.length})
                            </h2>
                        </div>

                        {records.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-sm">
                                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                    📋
                                </div>
                                <h3 className="text-lg font-black text-slate-700 uppercase">No Records Found</h3>
                                <p className="text-slate-400 text-xs font-bold mt-1">Please double check your mobile number and try again.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {records.map((rec) => {
                                    const isCompleted = rec.status === 'completed';
                                    return (
                                        <div key={rec._id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-md hover:shadow-xl transition-all space-y-6">
                                            {/* Top Banner */}
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-primary/10 text-primary font-black rounded-2xl flex items-center justify-center text-xl">
                                                        🩺
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Appointment Code</span>
                                                        <h3 className="text-xl font-black text-slate-800 italic">{rec.appointmentCode}</h3>
                                                        <p className="text-xs font-bold text-emerald-600">📱 Mobile: {rec.userInfo?.mobileNumber}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <Tag color={isCompleted ? 'success' : rec.status === 'approved' ? 'processing' : 'gold'} className="rounded-full px-4 py-1 font-black uppercase text-xs">
                                                        {isCompleted ? 'Checkup Completed' : rec.status}
                                                    </Tag>
                                                    <Tag color={rec.paymentStatus === 'paid' ? 'green' : 'orange'} className="rounded-full px-4 py-1 font-black uppercase text-xs">
                                                        {rec.paymentStatus === 'paid' ? `PAID (${rec.transactionId || 'DUMMY'})` : 'PAYMENT PENDING'}
                                                    </Tag>
                                                </div>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/70 p-6 rounded-2xl">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Patient Details</p>
                                                    <p className="text-sm font-black text-slate-800">{rec.userInfo?.name}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{rec.userInfo?.age} Yrs • {rec.userInfo?.gender}</p>
                                                    <p className="text-xs text-slate-600 mt-1">Problem: {rec.userInfo?.problem || 'General Checkup'}</p>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Assigned Specialist</p>
                                                    <p className="text-sm font-black text-slate-800">
                                                        {rec.doctorInfo?.name?.toLowerCase().startsWith('dr') ? rec.doctorInfo?.name : `Dr. ${rec.doctorInfo?.name}`}
                                                    </p>
                                                    <p className="text-xs text-slate-500 font-medium">{rec.doctorInfo?.specialization}</p>
                                                    <p className="text-xs text-slate-600 mt-1">Fee: ₹{rec.doctorInfo?.feesPerConsultation || 500}</p>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Date & Slot</p>
                                                    <p className="text-sm font-black text-slate-800">📅 {rec.date}</p>
                                                    <p className="text-xs text-slate-500 font-medium">⏰ {rec.time}</p>
                                                </div>
                                            </div>

                                            {/* Prescriptions & Notes Section */}
                                            {(rec.doctorNotes || rec.prescription || rec.recommendations) && (
                                                <div className="bg-emerald-50/60 p-6 rounded-2xl border border-emerald-100 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black uppercase tracking-widest text-emerald-800 flex items-center gap-2">
                                                            <FiFileText /> Doctor Clinical Notes & Prescription
                                                        </span>
                                                        {rec.prescribedAt && (
                                                            <span className="text-[10px] font-bold text-emerald-600">
                                                                🕒 {dayjs(rec.prescribedAt).format('DD MMM YYYY, hh:mm A')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {rec.doctorNotes && (
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase text-emerald-700">Diagnosis Notes:</p>
                                                            <p className="text-xs font-medium text-slate-800">{rec.doctorNotes}</p>
                                                        </div>
                                                    )}
                                                    {rec.prescription && (
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase text-emerald-700">Prescription:</p>
                                                            <p className="text-xs font-bold text-emerald-900 bg-white p-3 rounded-xl border border-emerald-200">{rec.prescription}</p>
                                                        </div>
                                                    )}
                                                    {rec.recommendations && (
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase text-emerald-700">Recommendations:</p>
                                                            <p className="text-xs font-medium text-slate-800">{rec.recommendations}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Transfer History Timeline */}
                                            {rec.transferHistory && rec.transferHistory.length > 0 && (
                                                <div className="bg-purple-50/60 p-6 rounded-2xl border border-purple-100 space-y-3">
                                                    <span className="text-xs font-black uppercase tracking-widest text-purple-900 flex items-center gap-2">
                                                        <FiShare2 /> Doctor Transfer Log ({rec.transferHistory.length})
                                                    </span>
                                                    <div className="space-y-2">
                                                        {rec.transferHistory.map((t, idx) => (
                                                            <div key={idx} className="bg-white p-3 rounded-xl border border-purple-100 text-xs flex justify-between items-center">
                                                                <div>
                                                                    <span className="font-bold text-purple-900">{t.fromDoctorName}</span> ➔ <span className="font-bold text-emerald-700">{t.toDoctorName}</span>
                                                                    <p className="text-[10px] text-slate-500">Reason: {t.reason}</p>
                                                                </div>
                                                                <span className="text-[9px] font-bold text-slate-400">
                                                                    {dayjs(t.transferredAt).format('DD MMM YYYY, hh:mm A')}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setReceiptRecord(rec)}
                                                    className="px-6 py-3 bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-all flex items-center gap-2"
                                                >
                                                    <FiFileText /> View / Download Printable Receipt
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Printable Receipt Modal */}
                {receiptRecord && (
                    <AppointmentReceipt
                        appointment={receiptRecord}
                        onClose={() => setReceiptRecord(null)}
                    />
                )}
            </div>
        </Layout>
    );
};

export default MobileLookup;
