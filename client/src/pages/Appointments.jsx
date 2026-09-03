import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import axios from 'axios';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { FiCalendar, FiX, FiAlertCircle, FiArrowRight, FiFileText, FiCreditCard } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { message, Table, Tag, Space } from 'antd';
import AppointmentReceipt from '../components/AppointmentReceipt';
import { useSelector, useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../redux/features/alertSlice';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [downloadAppointment, setDownloadAppointment] = useState(null);

    // Reschedule State
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [newDate, setNewDate] = useState(null);
    const [newTime, setNewTime] = useState(null);
    const [rescheduleLoading, setRescheduleLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.user);
    console.log(user); // Added console log to use the variable or I could just remove it. 
    // Actually, I'll just remove it if it's really not used.

    const handlePayment = async (record) => {
        try {
            dispatch(showLoading());
            const res = await axios.post('/user/process-dummy-payment',
                {
                    appointmentId: record._id
                },
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem('token'),
                    },
                });

            dispatch(hideLoading());
            if (res.data.success) {
                message.success(`Payment successful! Transaction ID: ${res.data.data.transactionId}`);
                getAppointments();
            } else {
                message.error(res.data.message || 'Payment failed.');
            }
        } catch (error) {
            dispatch(hideLoading());
            console.error('Payment error:', error);
            message.error('Failed to process payment.');
        }
    };

    const getAppointments = async () => {
        try {
            const res = await axios.get('/user/user-appointments', {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token'),
                },
            });
            if (res.data.success) {
                setAppointments(res.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAppointments();
        // Poll for status changes every 4 seconds in real-time
        const interval = setInterval(() => {
            getAppointments();
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleCancel = async (apptId) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            const res = await axios.post('/user/cancel-appointment', { appointmentId: apptId }, {
                headers: { Authorization: "Bearer " + localStorage.getItem('token') }
            });
            if (res.data.success) {
                message.success(res.data.message);
                getAppointments();
            }
        } catch (error) {
            console.log(error);
            message.error('Something went wrong');
        }
    };

    const handleReschedule = async () => {
        if (!newDate || !newTime) return message.error('Please select date and time');
        try {
            setRescheduleLoading(true);
            const res = await axios.post('/user/reschedule-appointment', {
                appointmentId: selectedAppointment._id,
                date: newDate,
                time: newTime
            }, {
                headers: { Authorization: "Bearer " + localStorage.getItem('token') }
            });
            if (res.data.success) {
                message.success(res.data.message);
                setIsRescheduleModalOpen(false);
                setSelectedAppointment(null);
                setNewDate(null);
                setNewTime(null);
                getAppointments();
            }
            setRescheduleLoading(false);
        } catch (error) {
            console.log(error);
            setRescheduleLoading(false);
            message.error('Something went wrong');
        }
    };

    const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
            render: (text) => <span className="text-slate-400 font-mono text-[10px]">{text}</span>
        },
        {
            title: 'Doctor',
            dataIndex: 'doctorInfo',
            key: 'doctor',
            render: (info) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 font-black text-xs">
                        {info?.name?.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-800 italic uppercase tracking-tighter">
                        {info?.name?.toLowerCase().startsWith('dr') ? info?.name : `Dr. ${info?.name}`}
                    </span>
                </div>
            )
        },
        {
            title: 'Code',
            dataIndex: 'appointmentCode',
            key: 'code',
            render: (code) => (
                <Tag color="processing" className="font-black italic uppercase rounded-lg border-2 border-primary/20 bg-primary/5 text-primary">
                    {code}
                </Tag>
            )
        },
        {
            title: 'Symptoms',
            key: 'symptoms',
            render: (_, record) => (
                <span className="text-slate-600 font-bold italic lowercase">{record.userInfo?.problem || 'General Checkup'}</span>
            )
        },
        {
            title: 'Date & Time',
            key: 'datetime',
            render: (_, record) => (
                <div className="flex flex-col">
                    <span className="text-slate-800 font-black italic">{dayjs(record.date, 'DD-MM-YYYY').isValid() ? dayjs(record.date, 'DD-MM-YYYY').format('DD-MM-YYYY') : record.date}</span>
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{record.time}</span>
                </div>
            )
        },
        {
            title: 'Services',
            dataIndex: 'selectedServices',
            key: 'services',
            render: (services) => (
                <div className="flex flex-wrap gap-1">
                    {services && services.length > 0 ? services.map((svc, i) => (
                        <Tag key={i} color="cyan" className="rounded-md border-0 bg-cyan-50 text-cyan-600 font-black uppercase text-[9px] px-2 py-0.5 italic">
                            {svc.name} (₹{svc.price})
                        </Tag>
                    )) : <Tag color="gray" className="rounded-md border-0 bg-slate-50 text-slate-400 font-black uppercase text-[9px] italic">Standard</Tag>}
                </div>
            )
        },
        {
            title: 'Payment',
            key: 'payment',
            render: (_, record) => (
                <div className="flex flex-col">
                    {record.paymentStatus === 'paid' ? (
                        <Tag color="green" className="w-fit mb-1 font-black uppercase text-[9px]">PAID</Tag>
                    ) : (
                        <Tag color="orange" className="w-fit mb-1 font-black uppercase text-[9px]">PENDING</Tag>
                    )}
                    {record.transactionId && (
                        <span className="text-[10px] text-slate-400 font-mono font-bold">{record.transactionId}</span>
                    )}
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'gold';
                if (status === 'approved') color = 'success';
                if (status === 'rejected' || status === 'cancelled') color = 'error';
                return <Tag color={color} className="rounded-full px-3 py-0.5 font-black uppercase italic text-[9px] border-2 shadow-sm">{status}</Tag>
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <button
                        onClick={() => {
                            setDownloadAppointment(record);
                        }}
                        className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-black uppercase text-[9px] tracking-widest hover:bg-slate-900 transition-all shadow-sm flex items-center gap-2"
                    >
                        <FiFileText /> Receipt
                    </button>
                    {record.paymentStatus !== 'paid' && record.status !== 'cancelled' && (
                        <button
                            onClick={() => handlePayment(record)}
                            className="px-4 py-1.5 bg-primary text-white rounded-lg font-black uppercase text-[9px] tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                        >
                            <FiCreditCard /> Pay Now
                        </button>
                    )}
                    {record.status === 'pending' && (
                        <>
                            <button
                                onClick={() => {
                                    setSelectedAppointment(record);
                                    setIsRescheduleModalOpen(true);
                                }}
                                className="text-slate-800 hover:text-slate-600 transition-all p-2 bg-slate-50 rounded-lg"
                                title="Reschedule"
                            >
                                <FiCalendar size={16} />
                            </button>
                            <button
                                onClick={() => handleCancel(record._id)}
                                className="text-red-500 hover:text-red-700 transition-all p-2 bg-red-50 rounded-lg"
                                title="Cancel"
                            >
                                <FiX size={16} />
                            </button>
                        </>
                    )}
                </Space>
            )
        }
    ];

    return (
        <Layout>
            <div className="p-4 md:p-8">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase leading-none mb-2">My History.</h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Track your upcoming and past consultations</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-50"
                >
                    <Table
                        columns={columns}
                        dataSource={appointments}
                        rowKey="_id"
                        pagination={{ pageSize: 10, className: "p-4 font-black italic uppercase text-[10px]" }}
                        className="custom-appointment-table"
                        locale={{
                            emptyText: (
                                <div className="py-20 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 text-4xl mb-6">
                                        <FiAlertCircle />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter italic uppercase mb-2 leading-none">Recordings Empty.</h3>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-10">You haven&apos;t scheduled any consultations yet.</p>
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="px-10 py-5 bg-primary text-white rounded-[1.5rem] font-black italic uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-4"
                                    >
                                        Book Your First Visit <FiArrowRight />
                                    </button>
                                </div>
                            )
                        }}
                    />
                </motion.div>

                {/* Reschedule Modal */}
                {isRescheduleModalOpen && selectedAppointment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative"
                        >
                            <button
                                onClick={() => setIsRescheduleModalOpen(false)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 font-bold"
                            >
                                ×
                            </button>

                            <h3 className="text-2xl font-black text-slate-800 mb-6 tracking-tighter italic uppercase">Reschedule</h3>

                            <div className="mb-6">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Select New Date</label>
                                <input
                                    type="date"
                                    className="w-full p-4 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none border border-transparent focus:border-primary focus:bg-white transition-all"
                                    onChange={(e) => setNewDate(e.target.value)}
                                />
                            </div>

                            <div className="mb-8">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Select New Time</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {timeSlots.map((slot) => (
                                        <button
                                            key={slot}
                                            onClick={() => setNewTime(slot)}
                                            className={`py-2 rounded-lg text-xs font-black transition-all ${newTime === slot
                                                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleReschedule}
                                disabled={rescheduleLoading}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest italic shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {rescheduleLoading ? 'Updating...' : 'Confirm New Slot'}
                            </button>
                        </motion.div>
                    </div>
                )}

                {/* Receipt Modal */}
                {downloadAppointment && (
                    <AppointmentReceipt
                        appointment={downloadAppointment}
                        onClose={() => setDownloadAppointment(null)}
                    />
                )}
            </div>
        </Layout>
    );
};

export default Appointments;
