import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Form, Input, message, Tabs } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../redux/features/alertSlice';
import axios from 'axios';
import { FiActivity, FiAlertCircle, FiCheckCircle, FiCpu, FiMessageSquare, FiShield, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const AIHelper = () => {
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [diagnosis, setDiagnosis] = useState(null);
    const [history, setHistory] = useState([]);

    const getHistory = async () => {
        try {
            const res = await axios.post('/api/v1/user/get-diagnosis-history', { userId: user?._id }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.data.success) {
                setHistory(res.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (user) {
            getHistory();
        }
    }, [user]);

    const onFinish = async (values) => {
        try {
            dispatch(showLoading());
            const res = await axios.post('/api/v1/user/predict-disease', { ...values, userId: user?._id }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            dispatch(hideLoading());
            if (res.data.success) {
                setDiagnosis(res.data.data);
                message.success('Analysis Complete');
                getHistory(); // Refresh history
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            dispatch(hideLoading());
            message.error('Analysis failed. Please check your input.');
        }
    };

    return (
        <Layout>
            <div className="p-4 md:p-8 max-w-6xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase leading-none mb-2 flex items-center gap-4">
                        <FiCpu className="text-primary" /> AI Health Hub.
                    </h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Advanced symptom analysis driven by rule-based intelligence</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left Column: Tool */}
                    <div className="lg:col-span-8">
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 min-h-[450px] flex flex-col justify-center"
                            >
                                <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-primary text-xl mb-6">
                                    <FiMessageSquare />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight italic uppercase mb-4 leading-none">Describe Symptoms</h3>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-8 leading-relaxed">
                                    Enter your symptoms separated by commas. Our AI will analyze patterns and suggest a potential condition.
                                </p>

                                <Form layout="vertical" onFinish={onFinish}>
                                    <Form.Item name="symptoms" rules={[{ required: true }]}>
                                        <Input.TextArea
                                            rows={6}
                                            placeholder="e.g. headache, fever, blurry vision..."
                                            className="rounded-[1.5rem] border-slate-100 bg-slate-50/50 p-6 text-slate-700 font-medium focus:border-primary transition-all text-sm"
                                        />
                                    </Form.Item>
                                    <button className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest italic flex items-center justify-center gap-4 hover:bg-blue-600 shadow-xl shadow-primary/20 transition-all text-xs" type="submit">
                                        RUN DIAGNOSTIC <FiActivity className="animate-pulse" />
                                    </button>
                                </Form>
                            </motion.div>

                            <AnimatePresence mode='wait'>
                                {diagnosis ? (
                                    <motion.div
                                        key="diagnosis-result"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[450px]"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px]"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-green-500/20 text-green-400 p-2 rounded-lg text-xs">
                                                        <FiCheckCircle />
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Analysis Success</span>
                                                </div>
                                                <button
                                                    onClick={() => setDiagnosis(null)}
                                                    className="text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                                                >
                                                    [ Clear ]
                                                </button>
                                            </div>

                                            <h2 className="text-white/30 font-black uppercase tracking-widest text-[8px] mb-1">Potential Condition</h2>
                                            <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                                                {diagnosis.disease}
                                            </h3>

                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-white/30 font-black uppercase tracking-widest text-[8px] mb-1">Risk Assessment</h4>
                                                    <div className={`text-[10px] font-black uppercase italic ${diagnosis.severity === 'High' ? 'text-red-400' : 'text-primary'}`}>
                                                        {diagnosis.severity} LEVEL
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-white/30 font-black uppercase tracking-widest text-[8px] mb-1">Consult Specialist</h4>
                                                    <div className="text-sm font-black italic text-white uppercase">{diagnosis.specialist}</div>
                                                </div>
                                                <div>
                                                    <h4 className="text-white/30 font-black uppercase tracking-widest text-[8px] mb-1">Suggested Solution / Advice</h4>
                                                    <p className="text-xs font-medium text-slate-300 leading-relaxed italic border-l-2 border-primary pl-3">
                                                        "{diagnosis.solution}"
                                                    </p>
                                                </div>

                                                {diagnosis.suggestedDoctors && diagnosis.suggestedDoctors.length > 0 && (
                                                    <div>
                                                        <h4 className="text-white/30 font-black uppercase tracking-widest text-[8px] mb-3">Recommended Specialists</h4>
                                                        <div className="space-y-3 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                                                            {diagnosis.suggestedDoctors.map(doc => (
                                                                <div key={doc._id} className="bg-white/5 p-3 rounded-xl flex items-center justify-between hover:bg-white/10 transition-all border border-white/5">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden">
                                                                            <img src={doc.image || '/doctors/male-doctor.png'} alt={doc.name} className="w-full h-full object-cover" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-bold text-white leading-none mb-0.5">Dr. {doc.name}</p>
                                                                            <p className="text-[8px] text-white/50 uppercase tracking-wider">{doc.specialization}</p>
                                                                        </div>
                                                                    </div>
                                                                    <a href={`/doctor/book-appointment/${doc._id}`} className="px-3 py-1.5 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-colors">
                                                                        Book
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-white/10 flex items-start gap-3">
                                            <FiAlertCircle className="text-primary text-lg shrink-0" />
                                            <p className="text-[8px] font-bold text-white/40 leading-tight uppercase">
                                                AI analysis is not a Substitute for professional advice.
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="diagnosis-placeholder"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center p-10 min-h-[450px]"
                                    >
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-slate-100 flex items-center justify-center text-slate-200 text-2xl mb-4">
                                            <FiActivity />
                                        </div>
                                        <p className="text-slate-300 font-black uppercase tracking-widest text-[10px]">Awaiting Symptom Data</p>
                                        <p className="text-slate-200 text-[8px] mt-2 max-w-[150px] uppercase font-bold tracking-wider">Results will be generated and stored automatically</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Column: History */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="bg-teal-50 w-10 h-10 rounded-xl flex items-center justify-center text-teal-600 text-lg">
                                    <FiClock />
                                </div>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight italic uppercase leading-none">Recordings</h3>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                                {history.length > 0 ? history.map((rec) => (
                                    <motion.div
                                        key={rec._id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all cursor-default group border border-transparent hover:border-slate-200"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black text-slate-400">{moment(rec.createdAt).format('MMM DD, YYYY • HH:mm')}</span>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${rec.severity === 'High' ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'}`}>{rec.severity}</span>
                                        </div>
                                        <h4 className="text-sm font-black text-slate-800 uppercase italic leading-none mb-2">{rec.disease}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 line-clamp-1 truncate uppercase tracking-wider">{rec.symptoms}</p>
                                    </motion.div>
                                )) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-30">
                                        <FiActivity className="text-4xl mb-4" />
                                        <p className="font-black uppercase tracking-widest text-[10px]">No records found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AIHelper;
