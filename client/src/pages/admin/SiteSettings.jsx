import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import axios from 'axios';
import { message, Form, Input, Button, Card, Spin } from 'antd';
import { FiSave, FiSettings } from 'react-icons/fi';

const SiteSettings = () => {
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();

    const fetchSettings = async () => {
        try {
            const res = await axios.get('/api/v1/admin/getSiteSettings', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.data.success) {
                form.setFieldsValue(res.data.data);
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const res = await axios.post('/api/v1/admin/updateSiteSettings', values, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.data.success) {
                message.success('Settings updated successfully');
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <FiSettings className="text-primary" /> Site Settings
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage public contact information and address</p>
                    </div>
                </div>

                <Card className="shadow-sm rounded-2xl border-0 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            className="max-w-lg"
                        >
                            <Form.Item
                                label="Emergency Contact Number"
                                name="emergencyContact"
                                rules={[{ required: true, message: 'Please enter contact number' }]}
                            >
                                <Input prefix={<span className="text-slate-400">📞</span>} placeholder="+919942199618" size="large" />
                            </Form.Item>

                            <Form.Item
                                label="Support Email"
                                name="email"
                                rules={[{ required: true, message: 'Please enter support email' }, { type: 'email', message: 'Please enter a valid email' }]}
                            >
                                <Input prefix={<span className="text-slate-400">✉️</span>} placeholder="support@smarthealth.com" size="large" />
                            </Form.Item>

                            <Form.Item
                                label="Hospital Address"
                                name="address"
                                rules={[{ required: true, message: 'Please enter hospital address' }]}
                            >
                                <Input.TextArea placeholder="123, Health Street..." rows={3} showCount maxLength={200} />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" size="large" icon={<FiSave />} block className="h-12 text-lg font-bold bg-primary">
                                    Save Changes
                                </Button>
                            </Form.Item>
                        </Form>
                    )}
                </Card>
            </div>
        </Layout>
    );
};

export default SiteSettings;
