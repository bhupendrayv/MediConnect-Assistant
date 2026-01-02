import React from 'react';
import { Form, Input, message } from 'antd';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../redux/features/alertSlice';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
            const res = await axios.post('/api/v1/user/register', finalValues);
            dispatch(hideLoading());
            if (res.data.success) {
                message.success('Account Created Successfully!');
                navigate('/login');
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            dispatch(hideLoading());
            message.error('Registration failed. Please try again.');
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
                    <div className="mb-10 text-center md:text-left">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Create Account</h1>
                        <p className="text-slate-400 font-medium">Please enter your details to start.</p>
                    </div>

                    <Form layout="vertical" form={form} onFinish={onFinishHandler} className="flex flex-col gap-2">
                        {/* Role Selection */}
                        <div className="mb-8">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">Select Your Role</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setSelectedRole('patient')}
                                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedRole === 'patient' ? 'border-primary bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}
                                >
                                    <FiUser className={`text-2xl ${selectedRole === 'patient' ? 'text-primary' : 'text-slate-400'}`} />
                                    <span className={`text-xs font-bold ${selectedRole === 'patient' ? 'text-primary' : 'text-slate-400'}`}>Patient</span>
                                </div>
                                <div
                                    onClick={() => setSelectedRole('doctor')}
                                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedRole === 'doctor' ? 'border-primary bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}
                                >
                                    <FiPlusSquare className={`text-2xl ${selectedRole === 'doctor' ? 'text-primary' : 'text-slate-400'}`} />
                                    <span className={`text-xs font-bold ${selectedRole === 'doctor' ? 'text-primary' : 'text-slate-400'}`}>Doctor</span>
                                </div>
                            </div>
                        </div>

                        <Form.Item label={<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</span>} name="name" rules={[{ required: true }]}>
                            <Input prefix={<FiUser className="text-slate-300 mr-2" />} className="h-14 rounded-2xl border-slate-100 hover:border-primary focus:border-primary transition-all font-medium text-slate-700 bg-slate-50/50" />
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
