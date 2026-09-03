import { Form, Input, message } from 'antd';import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../redux/features/alertSlice';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiMail, FiLock, FiActivity, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onFinishHandler = async (values) => {
        try {
            dispatch(showLoading());
            const res = await api.post('/user/login', values);
            dispatch(hideLoading());

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                message.success('Welcome back!');
                // Navigate directly to dashboard and reload state
                window.location.href = '/dashboard';
            } else {
                // Show the exact message from the server (e.g., "Incorrect password", "No account found")
                message.error(res.data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            dispatch(hideLoading());
            console.error('Login error:', error);
            const status = error.response?.status;
            const serverMsg = error.response?.data?.message;

            if (status === 503) {
                // DB not connected yet
                message.error('Server is starting up — database not connected yet. Please wait 10 seconds and try again.');
            } else if (serverMsg) {
                message.error(serverMsg);
            } else if (error.code === 'ERR_NETWORK' || !error.response) {
                message.error('Cannot connect to server. Make sure the backend is running on port 8082.');
            } else {
                message.error(`Server error (${status}): Please try again.`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl shadow-slate-200/50 p-12 md:p-16 border border-slate-100 relative z-10"
            >
                <div className="flex flex-col items-center mb-12">
                    <div className="bg-primary p-4 rounded-2xl shadow-xl shadow-primary/20 mb-6">
                        <FiActivity className="text-white text-3xl" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tighter leading-none italic uppercase">Welcome Back.</h1>
                    <p className="text-slate-400 font-bold mt-2 text-sm uppercase tracking-widest">Sign in to your account</p>
                </div>

                <Form layout="vertical" onFinish={onFinishHandler} className="flex flex-col gap-2">
                    <Form.Item label={<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registered Email</span>} name="email" rules={[{ required: true }]}>
                        <Input prefix={<FiMail className="text-slate-300 mr-2" />} placeholder="your@email.com" className="h-16 rounded-2xl border-slate-100 hover:border-primary focus:border-primary transition-all font-medium text-slate-700 bg-slate-50/50 px-4" />
                    </Form.Item>

                    <Form.Item label={<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</span>} name="password" rules={[{ required: true }]}>
                        <Input.Password prefix={<FiLock className="text-slate-300 mr-2" />} placeholder="••••••••" className="h-16 rounded-2xl border-slate-100 hover:border-primary focus:border-primary transition-all font-medium text-slate-700 bg-slate-50/50 px-4" />
                    </Form.Item>

                    <div className="flex justify-end mb-6">
                        <a href="#" className="text-xs font-bold text-primary hover:underline italic">Forgot Password?</a>
                    </div>

                    <button className="h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest italic shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all text-sm mb-8 flex items-center justify-center gap-2 group" type="submit">
                        Secure Log In <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="text-center font-bold text-slate-400 text-xs">
                        Don&apos;t have an account? <Link to="/register" className="text-primary hover:underline ml-1">Create One Now</Link>
                    </div>
                </Form>
            </motion.div>
        </div>
    );
};

export default Login;
