import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Table, Tag, message, Tooltip } from 'antd';
import moment from 'moment';
import { FiCheckCircle, FiClock, FiXCircle, FiDownload, FiCalendar, FiUser, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';
import AppointmentReceipt from '../components/AppointmentReceipt';

const Payments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [confirmedAppointment, setConfirmedAppointment] = useState(null);
    const [selectedReceiptAppointment, setSelectedReceiptAppointment] = useState(null);

    const printReceipt = (record) => {
        setSelectedReceiptAppointment(record);
    };

    const getPayments = useCallback(async (existingConfirmed = null) => {
        try {
            setLoading(true);
            const res = await api.get('/user/user-appointments');
            setLoading(false);
            if (res.data.success) {
                const list = res.data.data || [];
                setAppointments(list);
                if (!existingConfirmed) {
                    const urlParams = new URLSearchParams(window.location.search);
                    const apptId = urlParams.get('appointmentId');
                    if (apptId) {
                        const matched = list.find(a => a._id === apptId);
                        if (matched) {
                            setConfirmedAppointment(matched);
                            setPaymentSuccess(true);
                        }
                    }
                }
            }
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    }, []);

    const verifyStripePayment = useCallback(async (sessionId, appointmentId) => {
        try {
            setLoading(true);
            message.loading({ content: 'Verifying your payment with Stripe...', key: 'verify', duration: 0 });
            const res = await api.post('/user/verify-stripe-payment', { sessionId, appointmentId });
            setLoading(false);
            message.destroy('verify');
            if (res.data.success) {
                setPaymentSuccess(true);
                if (res.data.data) {
                    setConfirmedAppointment(res.data.data);
                }
                message.success('🎉 Payment Successful! Your appointment is confirmed.');
                window.history.replaceState({}, document.title, window.location.pathname);
                getPayments(res.data.data);
            } else {
                message.error('Payment verification failed. Please contact support.');
                getPayments();
            }
        } catch (error) {
            setLoading(false);
            message.destroy('verify');
            console.log(error);
            message.error('Error verifying Stripe payment');
            getPayments();
        }
    }, [getPayments]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const appointmentId = urlParams.get('appointmentId');

        if (sessionId && appointmentId) {
            verifyStripePayment(sessionId, appointmentId);
        } else {
            getPayments();
        }
    }, [verifyStripePayment, getPayments]);

    const columns = [
        {
            title: 'Appointment ID',
            dataIndex: 'appointmentCode',
            key: 'appointmentCode',
            render: (text) => <span className="font-black italic uppercase text-slate-800">{text}</span>
        },
        {
            title: 'Doctor',
            dataIndex: 'doctorInfo',
            key: 'doctor',
            render: (doctorInfo) => (
                <div>
                    <p className="font-bold text-slate-800 uppercase tracking-tight italic">{doctorInfo.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{doctorInfo.specialization}</p>
                </div>
            )
        },
        {
            title: 'Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount) => <span className="font-black text-primary italic">₹{amount}</span>
        },
        {
            title: 'Payment Status',
            key: 'paymentStatus',
            render: (record) => {
                const { paymentStatus, paymentMethod } = record;
                const isPaid = paymentStatus === 'paid';
                const methodStr = paymentMethod === 'cash' ? '💵 Cash' : '💳 Online';
                
                let icon = <FiClock className="mr-1" />;
                if (isPaid) {
                    icon = <FiCheckCircle className="mr-1" />;
                } else if (paymentStatus === 'failed') {
                    icon = <FiXCircle className="mr-1" />;
                }

                return (
                    <div className="flex items-center gap-2">
                        <Tag 
                            icon={icon} 
                            color={isPaid ? 'success' : paymentStatus === 'failed' ? 'error' : paymentMethod === 'cash' ? 'error' : 'processing'} 
                            className={`rounded-full px-4 py-1 font-bold uppercase tracking-widest text-[10px] m-0 ${!isPaid && paymentMethod === 'cash' ? 'animate-pulse' : ''}`}
                        >
                            {isPaid ? 'PAID' : paymentMethod === 'cash' ? 'CASH PENDING' : paymentStatus || 'PENDING'}
                        </Tag>
                        <Tag color="default" className="m-0 font-bold text-[9px] border-slate-200 text-slate-500 rounded-full">{methodStr}</Tag>
                    </div>
                );
            }
        },
        {
            title: 'Transaction ID',
            key: 'transactionId',
            render: (record) => {
                const txId = record.transactionId || null;
                return txId ? (
                    <Tooltip title={txId}>
                        <span className="text-slate-400 font-mono text-xs cursor-help">
                            {txId}
                        </span>
                    </Tooltip>
                ) : <span className="text-slate-300 text-xs">---</span>;
            }
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'date',
            render: (date) => <span className="text-slate-500 font-medium text-xs">{moment(date).format('DD MMM YYYY, hh:mm A')}</span>
        },
        {
            title: 'Receipt',
            key: 'receipt',
            render: (record) => (
                record.paymentStatus === 'paid' ? (
                    <button
                        onClick={() => printReceipt(record)}
                        className="flex items-center gap-2 bg-primary text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full hover:bg-emerald-600 transition-all hover:scale-105 shadow-md shadow-primary/20 cursor-pointer"
                    >
                        <FiDownload />
                        Receipt
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            if (record.paymentStatus === 'pending_cash') {
                                message.warning('Receipt will be available once cash payment is confirmed at the clinic counter.');
                            } else {
                                message.warning('Receipt will be available once payment is completed.');
                            }
                        }}
                        className="flex items-center gap-2 bg-slate-200 text-slate-400 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full cursor-not-allowed opacity-70"
                    >
                        <FiDownload />
                        Locked
                    </button>
                )
            )
        }
    ];

    return (
        <Layout>
            <div className="p-8 max-w-6xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase leading-none mb-2">Payment History.</h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Track your consultation bills and transactions</p>
                </motion.div>

                {/* Payment Success & Appointment Confirmed Card */}
                {paymentSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="mb-10 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl border border-emerald-500/30 relative overflow-hidden"
                    >
                        {/* Ambient Glow */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                                <div className="flex items-start md:items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-3xl text-emerald-400 shadow-lg shadow-emerald-500/20 flex-shrink-0">
                                        <FiCheckCircle />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                                                Payment Verified ✓
                                            </span>
                                            <span className="px-3 py-0.5 rounded-full bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest">
                                                Online Card / Stripe
                                            </span>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white">
                                            Payment Successful & Appointment Booked!
                                        </h2>
                                        <p className="text-slate-300 text-xs mt-1">
                                            Your payment has been received and consultation slot is confirmed. Please keep your verification code handy.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 flex-wrap">
                                    {confirmedAppointment && (
                                        <button
                                            onClick={() => setSelectedReceiptAppointment(confirmedAppointment)}
                                            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                                        >
                                            <FiDownload className="text-sm" />
                                            Download Receipt
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate('/appointments')}
                                        className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                                    >
                                        My Appointments
                                    </button>
                                    <button
                                        onClick={() => setPaymentSuccess(false)}
                                        className="text-white/40 hover:text-white font-bold text-lg p-2"
                                        title="Dismiss"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Summary Details */}
                            {confirmedAppointment && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-2">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Unique Code</p>
                                        <p className="text-lg font-black font-mono tracking-wider text-white mt-1">{confirmedAppointment.appointmentCode || 'Confirmed'}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Doctor / Specialist</p>
                                        <p className="text-sm font-bold text-white mt-1 truncate">{confirmedAppointment.doctorInfo?.name || 'Assigned Specialist'}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Date & Slot</p>
                                        <p className="text-sm font-bold text-white mt-1">{confirmedAppointment.date || 'Scheduled'} {confirmedAppointment.time ? `• ${confirmedAppointment.time}` : ''}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Amount Paid</p>
                                        <p className="text-lg font-black text-emerald-400 mt-1">₹{confirmedAppointment.totalAmount || confirmedAppointment.doctorInfo?.feesPerConsultation || 500}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
                >
                    <Table 
                        columns={columns} 
                        dataSource={appointments.filter(app => (app.totalAmount > 0 || app.paymentStatus === 'paid'))} 
                        loading={loading}
                        rowKey="_id"
                        pagination={{ pageSize: 8 }}
                        className="custom-table"
                    />
                </motion.div>

                {/* Receipt Modal */}
                {selectedReceiptAppointment && (
                    <AppointmentReceipt
                        appointment={selectedReceiptAppointment}
                        onClose={() => setSelectedReceiptAppointment(null)}
                    />
                )}
            </div>
        </Layout>
    );
};

export default Payments;
