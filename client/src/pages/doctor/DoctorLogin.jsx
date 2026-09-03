import { useState } from 'react';
import { Form, Input, message, Modal } from 'antd';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../../redux/features/alertSlice';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FiMail, FiLock, FiPlusSquare, FiArrowRight, FiKey, FiHelpCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const DoctorLogin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [forgotForm] = Form.useForm();
    const [forgotLoading, setForgotLoading] = useState(false);

    const onFinishHandler = async (values) => {
        try {
            dispatch(showLoading());
            const res = await api.post('/user/login', values);
            dispatch(hideLoading());

            if (res.data.success) {
                if (res.data.user?.isDoctor || res.data.user?.role === 'doctor') {
                    localStorage.setItem('token', res.data.token);
                    message.success(`Welcome Dr. ${res.data.user?.name}!`);
                    window.location.href = '/dashboard';
                } else {
                    message.error('Access Denied: This portal is for verified Doctors only.');
                }
            } else {
                message.error(res.data.message || 'Login failed. Please verify your credentials.');
            }
        } catch (error) {
            dispatch(hideLoading());
            console.error('Doctor Login error:', error);
            message.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    const handleForgotPassword = async (values) => {
        try {
            setForgotLoading(true);
            const res = await api.post('/user/doctor-forgot-password', values);
            setForgotLoading(false);

            if (res.data.success) {
                message.success(res.data.message || 'Password updated successfully!');
                setIsForgotModalOpen(false);
                forgotForm.resetFields();
            } else {
                message.error(res.data.message || 'Password reset failed.');
            }
        } catch (error) {
            setForgotLoading(false);
            console.error('Doctor Forgot Password Error:', error);
            message.error(error.response?.data?.message || 'Failed to reset password.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden text-slate-100">
            {/* Ambient Lighting */}
            <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-blue-600/15 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-emerald-500/15 blur-[150px] rounded-full pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800/90 backdrop-blur-2xl w-full max-w-md rounded-[3rem] shadow-2xl shadow-black/60 p-10 md:p-14 border border-slate-700/60 relative z-10"
            >
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-3xl shadow-xl shadow-blue-500/25 mb-6 border border-blue-400/30">
                        <FiPlusSquare className="text-white text-3xl" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 bg-blue-500/10 px-3.5 py-1 rounded-full border border-blue-500/20 mb-3">
                        Medical Practitioner Portal
                    </span>
                    <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">Doctor Sign In</h1>
                    <p className="text-slate-400 font-medium mt-1 text-xs">Access your appointment queue & patient visits</p>
                </div>

                <Form layout="vertical" onFinish={onFinishHandler} className="flex flex-col gap-3">
                    <Form.Item
                        label={<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Doctor Email / Username</span>}
                        name="email"
                        rules={[{ required: true, message: 'Please enter your registered email' }]}
                    >
                        <Input
                            prefix={<FiMail className="text-slate-500 mr-2" />}
                            placeholder="doctor@hospital.com"
                            className="h-14 rounded-2xl border-slate-700 bg-slate-900/80 text-slate-200 placeholder:text-slate-600 font-medium px-4 hover:border-blue-500 focus:border-blue-500"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</span>}
                        name="password"
                        rules={[{ required: true, message: 'Please enter your password' }]}
                    >
                        <Input.Password
                            prefix={<FiLock className="text-slate-500 mr-2" />}
                            placeholder="••••••••"
                            className="h-14 rounded-2xl border-slate-700 bg-slate-900/80 text-slate-200 placeholder:text-slate-600 font-medium px-4 hover:border-blue-500 focus:border-blue-500"
                        />
                    </Form.Item>

                    <div className="flex justify-end -mt-1 mb-2">
                        <button
                            type="button"
                            onClick={() => setIsForgotModalOpen(true)}
                            className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                        >
                            <FiKey className="text-[10px]" /> Forgot Password?
                        </button>
                    </div>

                    <button
                        className="h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest italic shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all text-sm mt-2 mb-6 flex items-center justify-center gap-2 group"
                        type="submit"
                    >
                        Sign In to Practice <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="text-center font-bold text-slate-500 text-xs flex justify-between items-center pt-4 border-t border-slate-700/80">
                        <Link to="/login" className="text-slate-400 hover:text-white transition-colors">← Patient Portal</Link>
                        <span className="text-[11px] text-slate-500">Need Account? Contact Admin</span>
                    </div>
                </Form>
            </motion.div>

            {/* Password Recovery Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <FiKey />
                        </div>
                        <span className="font-black text-slate-800 text-lg">Doctor Password Recovery</span>
                    </div>
                }
                open={isForgotModalOpen}
                onCancel={() => setIsForgotModalOpen(false)}
                footer={null}
                centered
            >
                <p className="text-xs text-slate-500 mb-6 mt-3">
                    Enter your registered doctor email address and set your new password.
                </p>
                <Form layout="vertical" form={forgotForm} onFinish={handleForgotPassword}>
                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-600">Registered Doctor Email</span>}
                        name="email"
                        rules={[{ required: true, type: 'email', message: 'Valid doctor email is required' }]}
                    >
                        <Input placeholder="doctor@hospital.com" className="h-12 rounded-xl" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-600">Choose New Password (Min 6 chars)</span>}
                        name="newPassword"
                        rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}
                    >
                        <Input.Password placeholder="••••••••" className="h-12 rounded-xl" />
                    </Form.Item>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsForgotModalOpen(false)}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={forgotLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-blue-500/20"
                        >
                            {forgotLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default DoctorLogin;
