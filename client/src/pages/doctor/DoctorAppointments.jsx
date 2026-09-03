import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import axios from 'axios';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Table, message, Tag } from 'antd';

dayjs.extend(customParseFormat);

const DoctorAppointments = () => {
    const { user } = useSelector(state => state.user);
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        if (user && !user.isDoctor) {
            navigate('/appointments');
        }
    }, [user, navigate]);

    const getAppointments = async () => {
        try {
            const res = await axios.get('/doctor/doctor-appointments', {
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

    const handleStatus = async (record, status) => {
        try {
            const res = await axios.post('/doctor/update-status', { appointmentsId: record._id, status }, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token'),
                },
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

    useEffect(() => {
        getAppointments();
    }, []);

    const columns = [
        {
            title: 'Code & Schedule',
            dataIndex: 'appointmentCode',
            render: (code, record) => (
                <div>
                    <span className="font-mono font-black text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 inline-block">
                        {code || 'N/A'}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1 font-semibold">
                        {record.date} ({record.time})
                    </div>
                </div>
            )
        },
        {
            title: 'Patient Profile',
            dataIndex: 'userInfo',
            render: (info) => (
                <div>
                    <div className="font-black text-slate-800 text-sm">{info?.name || 'Patient'}</div>
                    <div className="text-xs text-slate-500 font-medium">
                        {info?.gender ? `${info.gender}, ` : ''}{info?.age ? `${info.age} yrs` : ''}
                    </div>
                    {info?.mobileNumber && (
                        <div className="text-[11px] text-blue-600 font-bold mt-0.5">
                            📞 {info.mobileNumber}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Clinical Symptoms & Address',
            dataIndex: 'userInfo',
            render: (info) => (
                <div className="max-w-xs">
                    <div className="text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        {info?.problem || 'Standard Consultation'}
                    </div>
                    {info?.address && (
                        <div className="text-[10px] text-slate-400 mt-1 truncate">
                            📍 {info.address}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Selected Services',
            dataIndex: 'selectedServices',
            render: (services) => (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {services && services.length > 0 ? (
                        services.map((svc, i) => (
                            <Tag color="cyan" key={i} className="font-bold text-[10px] rounded-lg">
                                {svc.name} (₹{svc.price})
                            </Tag>
                        ))
                    ) : (
                        <span className="text-gray-400 text-xs">General Checkup</span>
                    )}
                </div>
            )
        },
        {
            title: 'Status & Payment',
            dataIndex: 'status',
            render: (status, record) => {
                let color = 'gold';
                if (status === 'approved' || status === 'completed') color = 'green';
                if (status === 'cancelled' || status === 'reject' || status === 'rejected') color = 'volcano';
                return (
                    <div>
                        <Tag color={color} className="font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                            {status}
                        </Tag>
                        <div className="text-[10px] font-bold text-slate-400 mt-1">
                            Paid: <span className={record.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}>{record.paymentStatus || 'Pending'}</span>
                        </div>
                        {record.transactionId && (
                            <div className="text-[9px] font-mono text-slate-300 mt-0.5 truncate max-w-[120px]" title={record.transactionId}>
                                TXN: {record.transactionId}
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
                <div className="flex gap-2">
                    {record.status === 'pending' && (
                        <>
                            <button
                                className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-emerald-700 shadow-sm transition-all"
                                onClick={() => handleStatus(record, 'approved')}
                            >
                                Approve
                            </button>
                            <button
                                className="bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-red-100 border border-red-200 transition-all"
                                onClick={() => handleStatus(record, 'reject')}
                            >
                                Reject
                            </button>
                        </>
                    )}
                    {record.status === 'approved' && (
                        <button
                            className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-blue-700 shadow-sm transition-all"
                            onClick={() => handleStatus(record, 'completed')}
                        >
                            Mark Completed
                        </button>
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
        </Layout>
    );
};

export default DoctorAppointments;
