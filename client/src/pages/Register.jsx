import React from 'react';
import { Form, Input, message } from 'antd';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../redux/features/alertSlice';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiUser, FiPlusSquare, FiMail, FiLock, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [selectedRole, setSelectedRole] = React.useState('patient');

    const onFinishHandler = async (values) => {
        try {
            dispatch(showLoading());
            const finalValues = { ...values, role: selectedRole };
            const res = await api.post('/user/register', finalValues);
            dispatch(hideLoading());
            if (res.data.success) {
                message.success('Account Created Successfully! Please log in.');
                navigate('/login');
            } else {
                // Show the exact server message (e.g., "email already exists", "password too short")
                message.error(res.data.message || 'Registration failed. Please check your details.');
            }
        } catch (error) {
            dispatch(hideLoading());
            console.error('Registration error:', error);
            const serverMsg = error.response?.data?.message;
            if (serverMsg) {
                message.error(serverMsg);
            } else if (error.code === 'ERR_NETWORK' || !error.response) {
                message.error('Cannot connect to server. Make sure the backend is running on port 8082.');
            } else {
                message.error(`Server error (${error.response?.status}): Please try again.`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/5 blur-[100px] rounded-full"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row overflow-hidden relative z-10 border border-slate-100"
            >
                {/* Left Side - Info */}
                <div className="bg-primary p-12 text-white flex flex-col justify-between md:w-1/3">
                    <div>
                        <FiActivity className="text-5xl mb-8" />
                        <h2 className="text-3xl font-black italic tracking-tighter leading-none mb-6">BECOME A MEMBER.</h2>
                        <p className="text-emerald-50 font-medium leading-relaxed">Join our ecosystem of modern healthcare and take control of your wellness.</p>
                    </div>
                    <div className="text-sm font-bold opacity-50 uppercase tracking-widest">SmartHealth v2.0</div>
                </div>

                {/* Right Side - Form */}
                <div className="p-12 md:w-2/3">
                    <div className="mb-8 text-center md:text-left">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                            Patient Registration
                        </span>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-3 mb-1">Create Patient Account</h1>
                        <p className="text-slate-400 font-medium text-xs">Enter your details to schedule and manage medical consultations.</p>
                    </div>

                    <Form layout="vertical" form={form} onFinish={onFinishHandler} className="flex flex-col gap-2">
                        <Form.Item label={<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</span>} name="name" rules={[{ required: true, message: 'Please enter your full name' }]}>
                            <Input prefix={<FiUser className="text-slate-300 mr-2" />} placeholder="e.g. John Doe" className="h-14 rounded-2xl border-slate-100 hover:border-primary focus:border-primary transition-all font-medium text-slate-700 bg-slate-50/50" />
                        </Form.Item>

                        <Form.Item label={<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</span>} name="email" rules={[{ required: true }]}>
                            <Input prefix={<FiMail className="text-slate-300 mr-2" />} placeholder="name@company.com" className="h-14 rounded-2xl border-slate-100 hover:border-primary focus:border-primary transition-all font-medium text-slate-700 bg-slate-50/50" />
                        </Form.Item>

                        <Form.Item label={<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Choose Password</span>} name="password" rules={[{ required: true }]}>
                            <Input.Password prefix={<FiLock className="text-slate-300 mr-2" />} placeholder="••••••••" className="h-14 rounded-2xl border-slate-100 hover:border-primary focus:border-primary transition-all font-medium text-slate-700 bg-slate-50/50 px-4" />
                        </Form.Item>

                        <button className="h-14 mt-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest italic shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all text-sm mb-6" type="submit">
                            Create Free Account
                        </button>

                        <div className="text-center font-bold text-slate-400 text-xs">
                            Already a member? <Link to="/login" className="text-primary hover:underline ml-1">Log In Here</Link>
                        </div>
                    </Form>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
