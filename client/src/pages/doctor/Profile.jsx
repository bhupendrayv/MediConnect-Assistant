import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Row, Col, Input, TimePicker, message } from 'antd';
import { showLoading, hideLoading } from '../../redux/features/alertSlice';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const Profile = () => {
    const { user } = useSelector(state => state.user);
    const [doctor, setDoctor] = useState(null);
    const [isAvailable, setIsAvailable] = useState(true);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    const getDoctorInfo = async () => {
        try {
            const res = await axios.post('/api/v1/doctor/getDoctorInfo', { userId: params.id }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.data.success) {
                setDoctor(res.data.data);
                setIsAvailable(res.data.data.isAvailable !== false); // Default to true if undefined
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleToggleAvailability = async () => {
        try {
            dispatch(showLoading());
            const res = await axios.post('/api/v1/doctor/toggle-availability', {
                userId: user._id
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            dispatch(hideLoading());
            if (res.data.success) {
                message.success(res.data.message);
                setIsAvailable(res.data.data.isAvailable);
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            dispatch(hideLoading());
            console.log(error);
            message.error('Failed to toggle availability');
        }
    };

    const handleFinish = async (values) => {
        try {
            dispatch(showLoading());
            const res = await axios.post('/api/v1/doctor/updateProfile', {
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

    useEffect(() => {
        getDoctorInfo();
    }, []);

    return (
        <Layout>
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">Manage Profile</h1>

            {/* Availability Toggle */}
            {doctor && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`}></div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Availability Status</h3>
                                <p className="text-sm text-gray-500">
                                    You are currently <span className={`font-bold ${isAvailable ? 'text-green-600' : 'text-gray-600'}`}>
                                        {isAvailable ? 'Available' : 'Unavailable'}
                                    </span> for appointments
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggleAvailability}
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${isAvailable
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                        >
                            Mark as {isAvailable ? 'Unavailable' : 'Available'}
                        </button>
                    </div>
                </div>
            )}

            {doctor && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <Form layout="vertical" onFinish={handleFinish} className="m-3" initialValues={{
                        ...doctor,
                        timings: [
                            doctor.timings?.start ? dayjs(doctor.timings.start, 'HH:mm') : null,
                            doctor.timings?.end ? dayjs(doctor.timings.end, 'HH:mm') : null,
                        ]
                    }}>
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
                                Update Profile
                            </button>
                        </div>
                    </Form>
                </div>
            )}
        </Layout>
    );
};

export default Profile;
