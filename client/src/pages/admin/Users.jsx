import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { Table, message, Input, Tag, Popconfirm } from 'antd';
import { FiSearch, FiUser, FiMail, FiPhone, FiCalendar, FiShield, FiCheckCircle } from 'react-icons/fi';
import dayjs from 'dayjs';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const getUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/getAllUsers', {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token'),
                },
            });
            setLoading(false);
            if (res.data.success) {
                setUsers(res.data.data);
            }
        } catch (error) {
            setLoading(false);
            console.error(error);
            message.error("Error fetching registered patients");
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            title: 'Patient Details',
            dataIndex: 'name',
            render: (text, record) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm border border-blue-100 shadow-sm">
                        {record.name ? record.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 text-sm">{record.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                            <FiMail className="text-[10px]" /> {record.email}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            render: (phone) => (
                <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <FiPhone className="text-slate-400" /> {phone || 'Not provided'}
                </div>
            )
        },
        {
            title: 'Role & Status',
            dataIndex: 'role',
            render: (role, record) => (
                <div className="flex items-center gap-1.5">
                    <Tag color={record.isAdmin ? 'purple' : 'blue'} className="uppercase font-bold text-[10px] tracking-wider px-2.5 py-0.5 rounded-full">
                        {record.isAdmin ? 'Admin' : 'Patient'}
                    </Tag>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        <FiCheckCircle className="text-[10px]" /> Active
                    </span>
                </div>
            )
        },
        {
            title: 'Registered On',
            dataIndex: 'createdAt',
            render: (date) => (
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <FiCalendar className="text-slate-400" />
                    {date ? dayjs(date).format('DD MMM YYYY, hh:mm A') : 'Recent'}
                </div>
            )
        }
    ];

    return (
        <Layout>
            <div className="p-2 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 italic uppercase tracking-tight">Patient Directory</h1>
                        <p className="text-slate-400 font-medium text-sm mt-1">Manage and view all registered users and patients on the platform.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 font-bold text-xs">
                            Total Patients: {users.length}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 flex items-center justify-between">
                    <div className="relative w-full md:w-80">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search patient by name, email or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 h-11 rounded-2xl border-slate-200 bg-slate-50/50 font-medium text-xs"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={filteredUsers}
                        rowKey="_id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default Users;
