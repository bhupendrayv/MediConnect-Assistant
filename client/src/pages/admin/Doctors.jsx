import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { Table, message, Modal, Form, Input, InputNumber, TimePicker, Tag, Button, Select, Tabs } from 'antd';
import { FiPlus, FiSearch, FiUserCheck, FiPhone, FiMail, FiMapPin, FiClock, FiDollarSign, FiAward, FiShield } from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
const { Option } = Select;

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [form] = Form.useForm();

    const getDoctors = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/getAllDoctors', {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token'),
                },
            });
            setLoading(false);
            if (res.data.success) {
                setDoctors(res.data.data);
            }
        } catch (error) {
            setLoading(false);
            console.error(error);
            message.error("Error fetching doctors");
        }
    };

    const handleAccountStatus = async (record, status) => {
        try {
            const res = await api.post('/admin/changeAccountStatus',
                { doctorId: record._id, status },
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem('token'),
                    },
                });
            if (res.data.success) {
                message.success(res.data.message);
                getDoctors();
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to update status");
        }
    };

    const handleAddDoctor = async (values) => {
        try {
            const payload = {
                ...values,
                timings: values.timings ? {
                    start: dayjs(values.timings[0]).format("HH:mm"),
                    end: dayjs(values.timings[1]).format("HH:mm"),
                } : { start: "09:00", end: "17:00" },
                feesPerConsultation: Number(values.feesPerConsultation)
            };

            const res = await api.post('/admin/addDoctor', payload, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token')
                }
            });

            if (res.data.success) {
                message.success(res.data.message || 'Doctor created successfully!');
                setIsAddModalOpen(false);
                form.resetFields();
                getDoctors();
            } else {
                message.error(res.data.message || 'Failed to add doctor');
            }
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Error adding doctor account');
        }
    };

    useEffect(() => {
        getDoctors();
    }, []);

    // Filter by tab and search term
    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = 
            (doc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doc.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doc.specialization || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;
        if (activeTab === 'all') return true;
        if (activeTab === 'approved') return doc.status === 'approved';
        if (activeTab === 'pending') return doc.status === 'pending';
        if (activeTab === 'rejected') return doc.status === 'rejected';
        return true;
    });

    const columns = [
        {
            title: 'Doctor',
            dataIndex: 'name',
            render: (text, record) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-sm shadow-sm border border-emerald-100">
                        {record.name ? record.name.charAt(0).toUpperCase() : 'D'}
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 text-sm">Dr. {record.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                            <FiMail className="text-[10px]" /> {record.email}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Specialization',
            dataIndex: 'specialization',
            render: (text) => (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    <FiAward className="text-blue-500" /> {text || 'General Physician'}
                </span>
            )
        },
        {
            title: 'Fee / Timing',
            dataIndex: 'feesPerConsultation',
            render: (fee, record) => (
                <div>
                    <div className="font-bold text-slate-700 text-xs">₹{fee || 500} / visit</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <FiClock className="text-[10px]" /> {record.timings?.start || '09:00'} - {record.timings?.end || '17:00'}
                    </div>
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => {
                let color = 'gold';
                if (status === 'approved') color = 'green';
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
            render: (text, record) => (
                <div className="flex items-center gap-2">
                    {record.status !== 'approved' && (
                        <button
                            onClick={() => handleAccountStatus(record, 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-all shadow-sm"
                        >
                            Approve
                        </button>
                    )}
                    {record.status !== 'rejected' && (
                        <button
                            onClick={() => handleAccountStatus(record, 'rejected')}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs px-3 py-1.5 rounded-xl border border-red-200 transition-all"
                        >
                            {record.status === 'approved' ? 'Suspend' : 'Reject'}
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <Layout>
            <div className="p-2 md:p-6">
                {/* Header with Title and Add Button */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 italic uppercase tracking-tight">Doctor Management</h1>
                        <p className="text-slate-400 font-medium text-sm mt-1">Manage, verify, and onboard specialized doctors into the portal.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary hover:bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all text-sm group"
                    >
                        <FiPlus className="text-lg group-hover:rotate-90 transition-transform" />
                        Add New Doctor
                    </button>
                </div>

                {/* Filters & Tabs */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        className="font-bold text-sm"
                        items={[
                            { key: 'all', label: `All Doctors (${doctors.length})` },
                            { key: 'approved', label: `Active (${doctors.filter(d => d.status === 'approved').length})` },
                            { key: 'pending', label: `Pending (${doctors.filter(d => d.status === 'pending').length})` },
                            { key: 'rejected', label: `Suspended (${doctors.filter(d => d.status === 'rejected').length})` },
                        ]}
                    />
                    <div className="relative w-full md:w-72">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search by name or specialty..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 h-11 rounded-2xl border-slate-200 bg-slate-50/50 font-medium text-xs"
                        />
                    </div>
                </div>

                {/* Doctors Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={filteredDoctors}
                        rowKey="_id"
                        loading={loading}
                        pagination={{ pageSize: 8 }}
                        className="ant-table-custom"
                    />
                </div>
            </div>

            {/* Add Doctor Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                            <FiPlus />
                        </div>
                        <span className="font-black text-slate-800 text-lg">Onboard New Doctor</span>
                    </div>
                }
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
                footer={null}
                width={700}
                centered
            >
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleAddDoctor}
                    className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4"
                >
                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-600">Full Name</span>}
                        name="name"
                        rules={[{ required: true, message: 'Doctor name is required' }]}
                    >
                        <Input placeholder="e.g. Rajesh Sharma" className="h-11 rounded-xl" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-600">Email Address</span>}
                        name="email"
                        rules={[{ required: true, type: 'email', message: 'Valid email is required' }]}
                    >
                        <Input placeholder="doctor@clinic.com" className="h-11 rounded-xl" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-600">Password</span>}
                        name="password"
                        rules={[{ required: true, message: 'Set an initial password' }]}
                    >
                        <Input.Password placeholder="••••••••" className="h-11 rounded-xl" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-600">Specialization</span>}
                        name="specialization"
                        rules={[{ required: true, message: 'Specialization is required' }]}
                    >
                        <Select placeholder="Select specialization" className="h-11 rounded-xl">
                            <Option value="Cardiology">Cardiology</Option>
                            <Option value="Dermatology">Dermatology</Option>
                            <Option value="Neurology">Neurology</Option>
                            <Option value="General Physician">General Physician</Option>
                            <Option value="Orthopedics">Orthopedics</Option>
                            <Option value="Pediatrics">Pediatrics</Option>
                            <Option value="Gynecology">Gynecology</Option>
                            <Option value="Dentistry">Dentistry</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-600">Consultation Fee (₹)</span>}
                        name="feesPerConsultation"
                        rules={[{ required: true, message: 'Fee is required' }]}
                        initialValue={500}
                    >
                        <InputNumber min={50} max={10000} className="w-full h-11 rounded-xl flex items-center" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-600">Experience</span>}
                        name="experience"
                        initialValue="3+ Years"
                    >
                        <Input placeholder="e.g. 5+ Years" className="h-11 rounded-xl" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-600">Phone Number</span>}
                        name="phone"
                    >
                        <Input placeholder="+91 9876543210" className="h-11 rounded-xl" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-600">Visiting Timings</span>}
                        name="timings"
                    >
                        <TimePicker.RangePicker format="HH:mm" className="w-full h-11 rounded-xl" />
                    </Form.Item>

                    <div className="md:col-span-2">
                        <Form.Item
                            label={<span className="text-xs font-bold text-slate-600">Clinic / Hospital Address</span>}
                            name="address"
                        >
                            <Input placeholder="Suite 402, Care Plaza, Medical Road" className="h-11 rounded-xl" />
                        </Form.Item>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button onClick={() => setIsAddModalOpen(false)} className="rounded-xl h-11 px-6 font-semibold">
                            Cancel
                        </Button>
                        <button
                            type="submit"
                            className="bg-primary hover:bg-emerald-600 text-white font-bold px-8 h-11 rounded-xl shadow-lg shadow-primary/20 transition-all text-sm"
                        >
                            Create Doctor
                        </button>
                    </div>
                </Form>
            </Modal>
        </Layout>
    );
};

export default Doctors;
