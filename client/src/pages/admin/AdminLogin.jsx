import { useState } from 'react';
import { Form, Input, message } from 'antd';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../../redux/features/alertSlice';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FiMail, FiLock, FiShield, FiArrowRight, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AdminLogin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onFinishHandler = async (values) => {
        try {
            dispatch(showLoading());
            const res = await api.post('/user/login', values);
            dispatch(hideLoading());

            if (res.data.success) {
                // Verify admin privileges
                if (res.data.user?.isAdmin || res.data.user?.role === 'admin') {
                    localStorage.setItem('token', res.data.token);
                    message.success('Welcome Administrator!');
                    window.location.href = '/dashboard';
                } else {
                    message.error('Access Denied: This portal is strictly for Hospital Administrators.');
                }
            } else {
                message.error(res.data.message || 'Authentication failed.');
            }
        } catch (error) {
            dispatch(hideLoading());
            console.error('Admin Login error:', error);
            message.error(error.response?.data?.message || 'Login failed. Please check your admin credentials.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden text-slate-100">
            {/* Background Glow */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/15 blur-[150px] rounded-full pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/90 backdrop-blur-2xl w-full max-w-md rounded-[3rem] shadow-2xl shadow-black/80 p-10 md:p-14 border border-slate-800 relative z-10"
            >
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="bg-gradient-to-br from-primary to-emerald-600 p-4 rounded-3xl shadow-xl shadow-primary/30 mb-6 border border-emerald-400/30">
                        <FiShield className="text-white text-3xl" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-3.5 py-1 rounded-full border border-primary/20 mb-3">
                        Staff Security Gateway
                    </span>
                    <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">Admin Control</h1>
                    <p className="text-slate-400 font-medium mt-1 text-xs">Enter your administrator credentials</p>
                </div>

                <Form layout="vertical" onFinish={onFinishHandler} className="flex flex-col gap-3">
                    <Form.Item
                        label={<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Email / Username</span>}
                        name="email"
                        rules={[{ required: true, message: 'Please enter your admin email' }]}
                    >
                        <Input
                            prefix={<FiMail className="text-slate-500 mr-2" />}
                            placeholder="admin@mediconnect.com"
                            className="h-14 rounded-2xl border-slate-800 bg-slate-950/70 text-slate-200 placeholder:text-slate-600 font-medium px-4 hover:border-primary focus:border-primary"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Password</span>}
                        name="password"
                        rules={[{ required: true, message: 'Please enter your security password' }]}
                    >
                        <Input.Password
                            prefix={<FiLock className="text-slate-500 mr-2" />}
                            placeholder="••••••••"
                            className="h-14 rounded-2xl border-slate-800 bg-slate-950/70 text-slate-200 placeholder:text-slate-600 font-medium px-4 hover:border-primary focus:border-primary"
                        />
                    </Form.Item>

                    <button
                        className="h-14 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest italic shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all text-sm mt-4 mb-6 flex items-center justify-center gap-2 group"
                        type="submit"
                    >
                        Authenticate <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="text-center font-bold text-slate-500 text-xs flex justify-between items-center pt-4 border-t border-slate-800/80">
                        <Link to="/login" className="text-slate-400 hover:text-white transition-colors">← Patient Portal</Link>
                        <Link to="/doctor" className="text-primary hover:underline">Doctor Portal →</Link>
                    </div>
                </Form>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
