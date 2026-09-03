import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { Table, message, Tag, Tabs, Input } from 'antd';
import { FiDroplet, FiSearch, FiCheck, FiX, FiClock, FiMapPin, FiPhone } from 'react-icons/fi';
import dayjs from 'dayjs';

const AdminBloodRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const getRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/getAllBloodRequests', {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token'),
                },
            });
            setLoading(false);
            if (res.data.success) {
                setRequests(res.data.data);
            }
        } catch (error) {
            setLoading(false);
            console.error(error);
            message.error("Error fetching blood requests");
        }
    };

    const handleStatusUpdate = async (requestId, status) => {
        try {
            const res = await api.post('/admin/updateBloodStatus',
                { requestId, status },
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem('token'),
                    },
                });
            if (res.data.success) {
                message.success(res.data.message || `Request marked as ${status}`);
                getRequests();
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to update status");
        }
    };

    useEffect(() => {
        getRequests();
    }, []);

    const filteredRequests = requests.filter(req => {
        const matchesSearch =
            (req.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (req.hospitalName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (req.bloodGroup || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;
        if (activeTab === 'all') return true;
        return req.status === activeTab;
    });

    const columns = [
        {
            title: 'Patient & Group',
            dataIndex: 'patientName',
            render: (name, record) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 font-black flex items-center justify-center text-xs shadow-sm border border-red-100">
                        {record.bloodGroup}
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 text-sm">{name}</div>
                        <div className="text-[11px] text-slate-400 font-medium">Units: {record.units || 1} Unit(s)</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Hospital & Address',
            dataIndex: 'hospitalName',
            render: (hospital, record) => (
                <div>
                    <div className="font-bold text-slate-700 text-xs">{hospital}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <FiMapPin className="text-[10px]" /> {record.address}
                    </div>
                </div>
            )
        },
        {
            title: 'Contact',
            dataIndex: 'contactNumber',
            render: (phone) => (
                <div className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <FiPhone className="text-slate-400" /> {phone}
                </div>
            )
        },
        {
            title: 'Needed By',
            dataIndex: 'neededBy',
            render: (date) => (
                <div className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <FiClock className="text-red-400" />
                    {date ? dayjs(date).format('DD MMM YYYY') : 'Urgent'}
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => {
                let color = 'gold';
                if (status === 'approved' || status === 'fulfilled') color = 'green';
                if (status === 'rejected') color = 'volcano';
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
                    {record.status === 'pending' && (
                        <>
                            <button
                                onClick={() => handleStatusUpdate(record._id, 'approved')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-all shadow-sm"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleStatusUpdate(record._id, 'rejected')}
                                className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs px-3 py-1.5 rounded-xl border border-red-200"
                            >
                                Reject
                            </button>
                        </>
                    )}
                    {record.status === 'approved' && (
                        <button
                            onClick={() => handleStatusUpdate(record._id, 'fulfilled')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-all shadow-sm"
                        >
                            Mark Fulfilled
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
                        <h1 className="text-3xl font-black text-slate-800 italic uppercase tracking-tight">Blood Bank Moderation</h1>
                        <p className="text-slate-400 font-medium text-sm mt-1">Review urgent blood donations and update requisition fulfillment.</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        className="font-bold text-sm"
                        items={[
                            { key: 'all', label: `All Requests (${requests.length})` },
                            { key: 'pending', label: `Pending (${requests.filter(r => r.status === 'pending').length})` },
                            { key: 'approved', label: `Approved (${requests.filter(r => r.status === 'approved').length})` },
                            { key: 'fulfilled', label: `Fulfilled (${requests.filter(r => r.status === 'fulfilled').length})` },
                        ]}
                    />
                    <div className="relative w-full md:w-72">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search blood group or patient..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 h-11 rounded-2xl border-slate-200 bg-slate-50/50 font-medium text-xs"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={filteredRequests}
                        rowKey="_id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default AdminBloodRequests;
