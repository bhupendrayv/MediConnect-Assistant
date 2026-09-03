import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { Form, Input, Select, message, Button } from 'antd';
import { FiBell, FiSend, FiUsers, FiCheckCircle } from 'react-icons/fi';

const { TextArea } = Input;
const { Option } = Select;

const AdminBroadcast = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleBroadcast = async (values) => {
        try {
            setLoading(true);
            const res = await api.post('/admin/broadcast-notification', values, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token')
                }
            });
            setLoading(false);
            if (res.data.success) {
                message.success(res.data.message || 'Notification broadcasted successfully!');
                form.resetFields();
            } else {
                message.error(res.data.message || 'Failed to broadcast');
            }
        } catch (error) {
            setLoading(false);
            console.error(error);
            message.error(error.response?.data?.message || 'Error broadcasting message');
        }
    };

    return (
        <Layout>
            <div className="p-2 md:p-6 max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-800 italic uppercase tracking-tight">Notification Broadcast</h1>
                    <p className="text-slate-400 font-medium text-sm mt-1">Send immediate platform alerts, health updates, or operational notices.</p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl shadow-sm">
                            <FiBell />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Compose Broadcast Message</h3>
                            <p className="text-xs text-slate-400">Delivered directly to user inboxes with push alerts.</p>
                        </div>
                    </div>

                    <Form
                        layout="vertical"
                        form={form}
                        onFinish={handleBroadcast}
                        initialValues={{ targetGroup: 'all' }}
                    >
                        <Form.Item
                            label={<span className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Audience</span>}
                            name="targetGroup"
                            rules={[{ required: true }]}
                        >
                            <Select className="h-12 rounded-xl">
                                <Option value="all">📢 All Registered Accounts (Patients & Doctors)</Option>
                                <Option value="doctors">👨‍⚕️ Doctors Only</Option>
                                <Option value="patients">👥 Patients Only</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-xs font-bold uppercase tracking-wider text-slate-500">Alert Title</span>}
                            name="title"
                            rules={[{ required: true, message: 'Please provide a title' }]}
                        >
                            <Input placeholder="e.g. Free Blood Donation Camp Scheduled This Weekend" className="h-12 rounded-xl" />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-xs font-bold uppercase tracking-wider text-slate-500">Message Content</span>}
                            name="message"
                            rules={[{ required: true, message: 'Please write your message' }]}
                        >
                            <TextArea rows={5} placeholder="Write full details here..." className="rounded-xl p-4 text-sm" />
                        </Form.Item>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary hover:bg-emerald-600 text-white font-bold px-8 h-12 rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-2 transition-all text-sm"
                            >
                                <FiSend /> {loading ? 'Broadcasting...' : 'Send Broadcast Now'}
                            </button>
                        </div>
                    </Form>
                </div>
            </div>
        </Layout>
    );
};

export default AdminBroadcast;
