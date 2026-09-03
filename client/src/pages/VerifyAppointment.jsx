import { useState } from 'react';
import Layout from '../components/layout/Layout';
import { Form, Input, message, Tag } from 'antd';
import axios from 'axios';
import { FiActivity, FiSearch, FiUser, FiCalendar, FiClock, FiFileText, FiHash } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import moment from 'moment';

const VerifyAppointment = () => {
    const { user } = useSelector(state => state.user);
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleStatus = async (status) => {
        try {
            const res = await axios.post('/doctor/update-status',
                { appointmentsId: appointment._id, status },
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem('token'),
                    },
                }
            );
            if (res.data.success) {
                message.success(res.data.message);
                setAppointment({ ...appointment, status });
            }
        } catch (error) {
            console.log(error);
            message.error('Something went wrong');
        }
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const res = await axios.post('/user/check-appointment', values, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setLoading(false);
            if (res.data.success) {
                setAppointment(res.data.data);
                message.success(res.data.message);
            } else {
                setAppointment(null);
                message.error(res.data.message);
            }
        } catch (error) {
            setLoading(false);
            console.log(error);
            message.error('Something went wrong');
        }
    };

    return (
        <Layout>
            <div className="p-4 md:p-8 max-w-4xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase leading-none mb-2 flex items-center gap-4">
                        <FiHash className="text-primary" /> Verification.
                    </h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Verify patient consultation codes instantly</p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 mb-8">
                    <Form layout="vertical" onFinish={onFinish}>
                        <div className="flex gap-4">
                            <Form.Item
                                name="appointmentCode"
                                className="flex-1 mb-0"
                                rules={[{ required: true, message: 'Please enter code' }]}
                            >
                                <Input
                                    placeholder="ENTER APPOINTMENT CODE (e.g. HH-ABCD)"
                                    className="h-16 rounded-2xl border-slate-100 bg-slate-50 px-8 font-black italic uppercase tracking-widest text-lg"
                                />
                            </Form.Item>
                            <button
                                className="h-16 px-10 bg-primary text-white rounded-2xl font-black uppercase tracking-widest italic flex items-center gap-3 hover:bg-emerald-600 shadow-lg shadow-primary/20 transition-all text-xs"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'Search'} <FiSearch />
                            </button>
                        </div>
                    </Form>
                </div>

                <AnimatePresence mode='wait'>
                    {appointment && (
                        <motion.div
                            key={appointment._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">System Verification Path</span>
                                        <h2 className="text-3xl font-black italic uppercase tracking-tighter">{appointment.appointmentCode}</h2>
                                    </div>
                                    <Tag color={appointment.status === 'approved' ? 'success' : 'warning'} className="font-black border-none px-4 py-1 rounded-full uppercase italic text-[10px]">
                                        {appointment.status}
                                    </Tag>
                                </div>

                                <div className="grid md:grid-cols-2 gap-10">
                                    {/* Patient Info */}
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-white/30 font-black uppercase tracking-widest text-[9px] mb-4 flex items-center gap-2">
                                                <FiUser /> Patient Identity
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-white font-black italic uppercase text-lg leading-none">{appointment.userInfo.name}</p>
                                                    <p className="text-white/40 text-[10px] font-bold mt-1 uppercase leading-none">{appointment.userInfo.email}</p>
                                                </div>
                                                <div className="flex gap-8">
                                                    <div>
                                                        <p className="text-white/30 text-[8px] font-black uppercase tracking-widest mb-1">Age</p>
                                                        <p className="text-white font-black italic uppercase">{appointment.userInfo.age || 'N/A'} Years</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-white/30 text-[8px] font-black uppercase tracking-widest mb-1">Gender</p>
                                                        <p className="text-white font-black italic uppercase">{appointment.userInfo.gender || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-white/30 text-[8px] font-black uppercase tracking-widest mb-1">Address</p>
                                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider leading-relaxed">{appointment.userInfo.address || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-white/30 font-black uppercase tracking-widest text-[9px] mb-4 flex items-center gap-2">
                                                <FiCalendar /> Schedule Data
                                            </h3>
                                            <div className="flex gap-10">
                                                <div>
                                                    <p className="text-white font-black italic uppercase text-sm">{appointment.date}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-primary">
                                                    <FiClock />
                                                    <p className="text-white font-black italic uppercase text-sm">{appointment.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medical Concern */}
                                    <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5">
                                        <h3 className="text-white/30 font-black uppercase tracking-widest text-[9px] mb-6 flex items-center gap-2">
                                            <FiFileText /> Medical Problem Case
                                        </h3>
                                        <p className="text-white/80 font-bold italic text-sm leading-relaxed mb-8 uppercase tracking-wide">
                                            &quot;{appointment.userInfo.problem || 'No description provided.'}&quot;
                                        </p>

                                        <div className="pt-6 border-t border-white/5">
                                            <h3 className="text-white/30 font-black uppercase tracking-widest text-[9px] mb-4">Assigned Specialist</h3>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black italic text-sm">
                                                    {appointment.doctorInfo.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-black italic uppercase text-xs">Dr. {appointment.doctorInfo.name}</p>
                                                    <p className="text-white/30 text-[8px] font-black uppercase tracking-widest mt-0.5">{appointment.doctorInfo.specialization}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {user?.isDoctor && (
                                    <div className="mt-8 flex gap-4">
                                        <button
                                            onClick={() => handleStatus('approved')}
                                            className="px-8 py-3 bg-green-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                                        >
                                            Approve Appointment
                                        </button>
                                        <button
                                            onClick={() => handleStatus('rejected')}
                                            className="px-8 py-3 bg-red-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                        >
                                            Reject Case
                                        </button>
                                        <button
                                            onClick={() => handleStatus('cancelled')}
                                            className="px-8 py-3 bg-slate-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-600 transition-all shadow-lg shadow-slate-500/20"
                                        >
                                            Cancel Appointment
                                        </button>
                                    </div>
                                )}

                                <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-3 opacity-30">
                                    <FiActivity className="text-primary" />
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em]">Verified Secure System Entry • {moment().format('YYYY')}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default VerifyAppointment;
