import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { Table, message, Tag, Input, Select, Tabs } from 'antd';
import { FiSearch, FiCalendar, FiClock, FiDollarSign, FiUser, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Option } = Select;

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const getAppointments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/getAllAppointments', {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token'),
                },
            });
            setLoading(false);
            if (res.data.success) {
                setAppointments(res.data.data);
            }
        } catch (error) {
            setLoading(false);
            console.error(error);
            message.error("Error fetching global appointments ledger");
        }
    };

    useEffect(() => {
        getAppointments();
    }, []);

    const totalRevenue = appointments
        .filter(a => a.paymentStatus === 'paid')
        .reduce((sum, a) => sum + (Number(a.totalAmount) || 0), 0);

    const filteredAppointments = appointments.filter(appt => {
        const matchesSearch =
            (appt.appointmentCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (appt.userInfo?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (appt.doctorInfo?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (appt.userInfo?.mobileNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;
        if (statusFilter === 'all') return true;
        return appt.status === statusFilter;
    });

    const handleStatusUpdate = async (appointmentId, status) => {
        try {
            const res = await api.post('/admin/updateAppointmentStatus', {
                appointmentId,
                status
            }, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token')
                }
            });
            if (res.data.success) {
                message.success(res.data.message || `Appointment marked as ${status}`);
                getAppointments();
            } else {
                message.error(res.data.message || 'Status update failed');
            }
        } catch (error) {
            console.error('Update status error:', error);
            message.error(error.response?.data?.message || 'Error updating appointment status');
        }
    };

    const columns = [
        {
            title: 'Code & Date',
            dataIndex: 'appointmentCode',
            render: (code, record) => (
                <div>
                    <span className="font-mono font-black text-xs text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20 inline-block">
                        {code || 'N/A'}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <FiCalendar className="text-[10px]" /> {record.date} ({record.time})
                    </div>
                </div>
            )
        },
        {
            title: 'Patient',
            dataIndex: 'userInfo',
            render: (info) => (
                <div>
                    <div className="font-bold text-slate-800 text-xs">{info?.name || 'Guest Patient'}</div>
                    <div className="text-[11px] text-slate-400">{info?.mobileNumber || info?.email}</div>
                    {info?.problem && (
                        <div className="text-[10px] text-slate-500 italic mt-0.5 max-w-[150px] truncate">
                            Symp: {info.problem}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Doctor',
            dataIndex: 'doctorInfo',
            render: (doc) => (
                <div>
                    <div className="font-bold text-slate-700 text-xs">Dr. {doc?.name}</div>
                    <div className="text-[11px] text-blue-600 font-semibold">{doc?.specialization}</div>
                </div>
            )
        },
        {
            title: 'Amount / Payment',
            dataIndex: 'totalAmount',
            render: (amount, record) => (
                <div>
                    <div className="font-black text-slate-800 text-xs">₹{amount || record.doctorInfo?.feesPerConsultation || 0}</div>
                    <Tag color={record.paymentStatus === 'paid' ? 'green' : 'orange'} className="text-[9px] uppercase font-bold px-2 py-0 rounded-full mt-0.5">
                        {record.paymentStatus || 'Pending'}
                    </Tag>
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => {
                let color = 'gold';
                if (status === 'approved' || status === 'completed') color = 'green';
                if (status === 'cancelled' || status === 'rejected') color = 'volcano';
                return (
                    <Tag color={color} className="uppercase font-bold text-[10px] tracking-wider px-2.5 py-0.5 rounded-full">
                        {status}
                    </Tag>
                );
            }
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    {record.status !== 'approved' && record.status !== 'completed' && (
                        <button
                            onClick={() => handleStatusUpdate(record._id, 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm transition-all"
                        >
                            Approve
                        </button>
                    )}
                    {record.status !== 'rejected' && record.status !== 'cancelled' && (
                        <button
                            onClick={() => handleStatusUpdate(record._id, 'rejected')}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3 py-1.5 rounded-xl border border-red-200 transition-all"
                        >
                            Reject
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <Layout>
            <div className="p-2 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 italic uppercase tracking-tight">Appointments Ledger</h1>
                        <p className="text-slate-400 font-medium text-sm mt-1">Audit all platform consultations, transaction settlements, and visits.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 text-emerald-700 px-5 py-3 rounded-2xl border border-emerald-100 flex items-center gap-2">
                            <FiDollarSign className="text-emerald-600 text-lg" />
                            <div>
                                <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Settled Revenue</div>
                                <div className="text-base font-black">₹{totalRevenue.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Tabs
                        activeKey={statusFilter}
                        onChange={setStatusFilter}
                        className="font-bold text-sm"
                        items={[
                            { key: 'all', label: `All (${appointments.length})` },
                            { key: 'approved', label: `Approved (${appointments.filter(a => a.status === 'approved').length})` },
                            { key: 'completed', label: `Completed (${appointments.filter(a => a.status === 'completed').length})` },
                            { key: 'pending', label: `Pending (${appointments.filter(a => a.status === 'pending').length})` },
                            { key: 'cancelled', label: `Cancelled (${appointments.filter(a => a.status === 'cancelled').length})` },
                        ]}
                    />
                    <div className="relative w-full md:w-72">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search by code, doctor or patient..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 h-11 rounded-2xl border-slate-200 bg-slate-50/50 font-medium text-xs"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={filteredAppointments}
                        rowKey="_id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default AdminAppointments;
