import React from 'react';
import Layout from '../components/layout/Layout';
import { Form, Row, Col, Input, TimePicker, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showLoading, hideLoading } from '../redux/features/alertSlice';
import axios from 'axios';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const ApplyDoctor = () => {
    const { user } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleFinish = async (values) => {
        try {
            dispatch(showLoading());
            const res = await axios.post('/user/apply-doctor', {
                ...values,
                userId: user._id,
                timings: {
                    start: dayjs(values.timings[0]).format("HH:mm"),
                    end: dayjs(values.timings[1]).format("HH:mm"),
                },
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            dispatch(hideLoading());
            if (res.data.success) {
                message.success(res.data.message);
                navigate('/');
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            dispatch(hideLoading());
            console.log(error);
            message.error('Something Went Wrong');
        }
    };

    return (
        <Layout>
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">Apply Doctor Account</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <Form layout="vertical" onFinish={handleFinish} className="m-3">
                    <h4 className="text-lg font-medium text-gray-600 mb-4">Personal Details :</h4>
                    <Row gutter={20}>
                        <Col xs={24} md={24} lg={8}>
                            <Form.Item label="First Name" name="firstName" rules={[{ required: true }]}>
                                <Input type="text" placeholder="your first name" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={24} lg={8}>
                            <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}>
                                <Input type="text" placeholder="your last name" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={24} lg={8}>
                            <Form.Item label="Phone No" name="phone" rules={[{ required: true }]}>
                                <Input type="text" placeholder="your contact no" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={24} lg={8}>
                            <Form.Item label="Email" name="email" rules={[{ required: true }]}>
                                <Input type="email" placeholder="your email address" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={24} lg={8}>
                            <Form.Item label="Website" name="website">
                                <Input type="text" placeholder="your website" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={24} lg={8}>
                            <Form.Item label="Address" name="address" rules={[{ required: true }]}>
                                <Input type="text" placeholder="your clinic address" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <h4 className="text-lg font-medium text-gray-600 mb-4 mt-6">Professional Details :</h4>
                    <Row gutter={20}>
                        <Col xs={24} md={24} lg={8}>
                            <Form.Item label="Specialization" name="specialization" rules={[{ required: true }]}>
                                <Input type="text" placeholder="your specialization" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={24} lg={8}>
                            <Form.Item label="Experience" name="experience" rules={[{ required: true }]}>
                                <Input type="text" placeholder="your experience" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={24} lg={8}>
                            <Form.Item label="Fees Per Consultation" name="feesPerConsultation" rules={[{ required: true }]}>
                                <Input type="text" placeholder="your fees per consultation" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={24} lg={8}>
                            <Form.Item label="Timings" name="timings" rules={[{ required: true }]}>
                                <TimePicker.RangePicker format="HH:mm" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <div className="flex justify-end">
                        <button className="bg-primary text-white py-2 px-6 rounded-md font-medium hover:bg-blue-600 transition-colors" type="submit">
                            Submit Application
                        </button>
                    </div>
                </Form>
            </div>
        </Layout>
    );
};

export default ApplyDoctor;
