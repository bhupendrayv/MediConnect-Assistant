import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Table, message, Tag, Modal, Input, Select } from 'antd';
import { FiShare2, FiCheckCircle, FiFileText } from 'react-icons/fi';

dayjs.extend(customParseFormat);

const DoctorAppointments = () => {
    const { user } = useSelector(state => state.user);
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);

    // Transfer State
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferAppointment, setTransferAppointment] = useState(null);
    const [targetDoctorId, setTargetDoctorId] = useState('');
    const [transferReason, setTransferReason] = useState('');
    const [transferLoading, setTransferLoading] = useState(false);

    // Completion / Prescription State
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [completeAppointment, setCompleteAppointment] = useState(null);
    const [doctorNotes, setDoctorNotes] = useState('');
    const [prescription, setPrescription] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [completeLoading, setCompleteLoading] = useState(false);

    useEffect(() => {
        if (user && !user.isDoctor) {
            navigate('/appointments');
        }
    }, [user, navigate]);

    const getAppointments = async () => {
        try {
            const res = await api.get('/doctor/doctor-appointments');
            if (res.data.success) {
                setAppointments(res.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getAllDoctors = async () => {
        try {
            const res = await api.get('/user/getAllDoctors');
            if (res.data.success) {
                setAllDoctors(res.data.data);
            }
        } catch (error) {
            console.error('Error loading doctors for transfer:', error);
        }
    };

    const handleStatus = async (record, status) => {
        try {
            const res = await api.post('/doctor/update-status', { appointmentsId: record._id, status });
            if (res.data.success) {
                message.success(res.data.message);
                getAppointments();
            }
        } catch (error) {
            console.log(error);
            const msg = error.response?.data?.message || 'Something went wrong';
            message.error(msg);
        }
    };

    const handleOpenCompleteModal = (record) => {
        setCompleteAppointment(record);
        setDoctorNotes(record.doctorNotes || '');
        setPrescription(record.prescription || '');
        setRecommendations(record.recommendations || '');
        setTargetDoctorId('');
        setTransferReason('');
        setIsCompleteModalOpen(true);
    };

    const handleSaveCompleteCheckup = async () => {
        if (!completeAppointment) return;
        try {
            setCompleteLoading(true);
            const res = await api.post('/doctor/update-status', {
                appointmentsId: completeAppointment._id,
                status: 'completed',
                doctorNotes,
                prescription,
                recommendations
            });

            // If targetDoctorId selected, also execute transfer
            if (targetDoctorId) {
                await api.post('/doctor/transfer-appointment', {
                    appointmentId: completeAppointment._id,
                    targetDoctorId,
                    reason: transferReason || 'Patient transferred after clinical review'
                });
            }

            setCompleteLoading(false);
            if (res.data.success) {
                message.success('Checkup updated' + (targetDoctorId ? ' & patient transferred successfully!' : '!'));
                setIsCompleteModalOpen(false);
                getAppointments();
            } else {
                message.error(res.data.message || 'Failed to complete checkup');
            }
        } catch (error) {
            setCompleteLoading(false);
            console.error('Complete checkup error:', error);
            const msg = error.response?.data?.message || 'Failed to complete checkup';
            message.error(msg);
        }
    };

    const handleOpenTransferModal = (record) => {
        setTransferAppointment(record);
        setTargetDoctorId('');
        setTransferReason('');
        setIsTransferModalOpen(true);
    };

    const handleExecuteTransfer = async () => {
        if (!transferAppointment || !targetDoctorId) {
            return message.error('Please select a target doctor to transfer the appointment.');
        }
        try {
            setTransferLoading(true);
            const res = await api.post('/doctor/transfer-appointment', {
                appointmentId: transferAppointment._id,
                targetDoctorId,
                reason: transferReason
            });
            setTransferLoading(false);
            if (res.data.success) {
                message.success(res.data.message);
                setIsTransferModalOpen(false);
                getAppointments();
            } else {
                message.error(res.data.message || 'Transfer failed');
            }
        } catch (error) {
            setTransferLoading(false);
            console.error('Transfer error:', error);
            const msg = error.response?.data?.message || 'Failed to transfer appointment';
            message.error(msg);
        }
    };

    useEffect(() => {
        getAppointments();
        getAllDoctors();
    }, []);

    const columns = [
        {
            title: 'Patient Profile',
            dataIndex: 'name',
            render: (_, record) => {
                const info = record.userInfo || {};
                return (
                    <div>
                        <div className="font-black text-slate-800 text-sm">{info.name || 'Patient'}</div>
                        <div className="text-[11px] font-bold text-emerald-600">📱 Mobile: {info.mobileNumber || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{info.age ? `${info.age} Yrs` : ''} • {info.gender || ''}</div>
                    </div>
                );
            }
        },
        {
            title: 'Code & Date',
            key: 'code_date',
            render: (_, record) => (
                <div>
                    <Tag color="processing" className="font-black italic uppercase text-[10px] rounded-lg">{record.appointmentCode}</Tag>
                    <div className="text-xs font-bold text-slate-700 mt-1">📅 {record.date}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">⏰ {record.time}</div>
                </div>
            )
        },
        {
            title: 'Medical Problem',
            dataIndex: 'userInfo',
            render: (info) => (
                <div className="max-w-[180px]">
                    <span className="text-slate-700 font-medium text-xs block leading-tight">{info?.problem || 'General Consultation'}</span>
                </div>
            )
        },
        {
            title: 'Selected Services',
            dataIndex: 'selectedServices',
            render: (services) => (
                <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {services && services.length > 0 ? (
                        services.map((svc, i) => (
                            <Tag color="cyan" key={i} className="font-bold text-[10px] rounded-lg">{svc.name} (₹{svc.price})</Tag>
                        ))
                    ) : (
                        <span className="text-gray-400 text-xs">General Checkup</span>
                    )}
                </div>
            )
        },
        {
            title: 'Payment Status',
            key: 'paymentStatus',
            render: (_, record) => (
                <div>
                    {record.paymentStatus === 'paid' ? (
                        <Tag color="green" className="font-black text-[10px] uppercase rounded-full px-3 py-0.5">
                            PAID
                        </Tag>
                    ) : (
                        <Tag color="orange" className="font-black text-[10px] uppercase rounded-full px-3 py-0.5">
                            PENDING
                        </Tag>
                    )}
                    {record.transactionId && (
                        <div className="text-[9px] font-mono text-slate-400 font-bold mt-1">
                            TXN: {record.transactionId}
                        </div>
                    )}
                    <div className="text-[10px] font-black text-emerald-700 mt-0.5">
                        Fee: ₹{record.totalAmount || record.doctorInfo?.feesPerConsultation || 500}
                    </div>
                </div>
            )
        },
        {
            title: 'Status & Transfer',
            dataIndex: 'status',
            render: (status, record) => {
                let color = 'gold';
                let label = status;
                if (status === 'approved') color = 'blue';
                if (status === 'completed') { color = 'green'; label = 'Checkup Completed'; }
                if (status === 'cancelled' || status === 'reject' || status === 'rejected') color = 'volcano';
                return (
                    <div>
                        <Tag color={color} className="font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">{label}</Tag>
                        {record.transferHistory && record.transferHistory.length > 0 && (
                            <div className="text-[9px] font-bold text-purple-600 mt-1 flex items-center gap-1">
                                <FiShare2 size={10} /> Transferred ({record.transferHistory.length}x)
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            render: (_, record) => (
                <div className="flex flex-wrap gap-2">
                    {record.status === 'pending' && (
                        <>
                            <button className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-emerald-700 shadow-sm transition-all" onClick={() => handleStatus(record, 'approved')}>Approve</button>
                            <button className="bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-red-100 border border-red-200 transition-all" onClick={() => handleStatus(record, 'reject')}>Reject</button>
                        </>
                    )}
                    {record.status === 'approved' && (
                        <button className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1" onClick={() => handleOpenCompleteModal(record)}><FiCheckCircle /> Complete Checkup</button>
                    )}
                    {record.status === 'completed' && (
                        <button className="bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-slate-200 transition-all flex items-center gap-1" onClick={() => handleOpenCompleteModal(record)}><FiFileText /> Edit Notes / Transfer</button>
                    )}
                    {record.status !== 'cancelled' && record.status !== 'rejected' && (
                        <button className="bg-purple-50 text-purple-600 font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-purple-100 border border-purple-200 transition-all flex items-center gap-1" onClick={() => handleOpenTransferModal(record)}><FiShare2 /> Transfer</button>
                    )}
                </div>
            )
        }
    ];

    return (
        <Layout>
            <div className="p-4 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Assigned Patient Visits</h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Review scheduled appointments and patient clinical details</p>
                    </div>
                    <div className="bg-blue-50 text-blue-700 font-bold text-xs px-4 py-2 rounded-2xl border border-blue-100">
                        {appointments.length} Consultations in Queue
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <Table columns={columns} dataSource={appointments} rowKey="_id" pagination={{ pageSize: 8 }} />
                </div>
            </div>

            <Modal title={<div className="flex items-center gap-2 text-slate-800 font-black text-lg"><FiCheckCircle className="text-emerald-600" /> Clinical Notes & Patient Transfer</div>} open={isCompleteModalOpen} onCancel={() => setIsCompleteModalOpen(false)} onOk={handleSaveCompleteCheckup} confirmLoading={completeLoading} okText="Save & Apply" okButtonProps={{ className: "bg-emerald-600 hover:bg-emerald-700" }} width={600}>
                {completeAppointment && (
                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                            <p className="font-bold text-slate-800">Patient: <span className="font-normal">{completeAppointment.userInfo?.name}</span></p>
                            <p className="font-bold text-slate-800">Mobile: <span className="font-normal">{completeAppointment.userInfo?.mobileNumber}</span></p>
                            <p className="font-bold text-slate-800">Problem: <span className="font-normal">{completeAppointment.userInfo?.problem || 'General Checkup'}</span></p>
                        </div>
                        <div><label className="block text-xs font-black uppercase text-slate-500 mb-1">Clinical / Doctor Notes</label><Input.TextArea rows={3} placeholder="Diagnosis notes..." value={doctorNotes} onChange={e => setDoctorNotes(e.target.value)} className="rounded-xl font-medium" /></div>
                        <div><label className="block text-xs font-black uppercase text-slate-500 mb-1">Prescription Details</label><Input.TextArea rows={3} placeholder="Medications..." value={prescription} onChange={e => setPrescription(e.target.value)} className="rounded-xl font-medium" /></div>
                        <div><label className="block text-xs font-black uppercase text-slate-500 mb-1">Recommendations</label><Input.TextArea rows={2} placeholder="Follow-up instructions..." value={recommendations} onChange={e => setRecommendations(e.target.value)} className="rounded-xl font-medium" /></div>

                        {/* Transfer Section inside Edit Notes Modal */}
                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-xs font-black uppercase text-purple-700 mb-2 flex items-center gap-1.5">
                                <FiShare2 /> Transfer Patient to Another Specialist (Optional)
                            </label>
                            <div className="space-y-3 p-4 bg-purple-50/60 rounded-2xl border border-purple-100">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-purple-900 mb-1">Select Target Specialist</label>
                                    <Select className="w-full h-11 rounded-xl" placeholder="Select Doctor to Transfer to (Optional)..." allowClear value={targetDoctorId || undefined} onChange={val => setTargetDoctorId(val)} options={allDoctors.map(doc => ({ value: doc._id, label: `${doc.name?.toLowerCase().startsWith('dr') ? doc.name : `Dr. ${doc.name}`} (${doc.specialization || 'Specialist'})` }))} />
                                </div>
                                {targetDoctorId && (
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-purple-900 mb-1">Reason for Transfer</label>
                                        <Input.TextArea rows={2} placeholder="State referral reason..." value={transferReason} onChange={e => setTransferReason(e.target.value)} className="rounded-xl font-medium" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal title={<div className="flex items-center gap-2 text-slate-800 font-black text-lg"><FiShare2 className="text-purple-600" /> Transfer Appointment</div>} open={isTransferModalOpen} onCancel={() => setIsTransferModalOpen(false)} onOk={handleExecuteTransfer} confirmLoading={transferLoading} okText="Transfer Appointment" okButtonProps={{ className: "bg-purple-600 hover:bg-purple-700 text-white" }} width={500}>
                {transferAppointment && (
                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-xs space-y-1">
                            <p className="font-bold text-purple-900">Patient: {transferAppointment.userInfo?.name}</p>
                            <p className="font-bold text-purple-900">Code: {transferAppointment.appointmentCode}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-slate-500 mb-1">Select Target Specialist <span className="text-red-500">*</span></label>
                            <Select className="w-full h-12 rounded-xl" placeholder="Select Doctor..." value={targetDoctorId || undefined} onChange={val => setTargetDoctorId(val)} options={allDoctors.map(doc => ({ value: doc._id, label: `${doc.name?.toLowerCase().startsWith('dr') ? doc.name : `Dr. ${doc.name}`} (${doc.specialization || 'Specialist'})` }))} />
                        </div>
                        <div><label className="block text-xs font-black uppercase text-slate-500 mb-1">Reason for Transfer</label><Input.TextArea rows={3} placeholder="Reason..." value={transferReason} onChange={e => setTransferReason(e.target.value)} className="rounded-xl font-medium" /></div>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default DoctorAppointments;
