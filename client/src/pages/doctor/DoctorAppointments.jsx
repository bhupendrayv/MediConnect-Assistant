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
            const res = await axios.get('/api/v1/doctor/doctor-appointments', {
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
            const res = await axios.post('/api/v1/doctor/update-status', { appointmentsId: record._id, status }, {
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
            title: 'ID',
            dataIndex: '_id',
        },
        {
            title: 'Patient',
            dataIndex: 'name',
            render: (text, record) => (
                <span>{record.userInfo?.name}</span>
            )
        },
        {
            title: 'Code',
            dataIndex: 'appointmentCode',
            render: (text, record) => (
                <Tag color="blue" className="font-bold">{record.appointmentCode}</Tag>
            )
        },
        {
            title: 'Symptoms',
            dataIndex: 'symptoms',
            render: (text, record) => (<span>{record.userInfo?.problem}</span>)
        },
        {
            title: 'Date & Time',
            dataIndex: 'date',
            render: (text, record) => (
                <span>
                    {dayjs(record.date, 'DD-MM-YYYY', true).isValid()
                        ? dayjs(record.date, 'DD-MM-YYYY').format("DD-MM-YYYY")
                        : dayjs(record.date).isValid()
                            ? dayjs(record.date).format("DD-MM-YYYY")
                            : record.date
                    }
                    &nbsp; {record.time}
                </span>
            )
        },
        {
            title: 'Services',
            dataIndex: 'selectedServices',
            render: (text, record) => (
                <div className="flex flex-wrap gap-1">
                    {record.selectedServices && record.selectedServices.length > 0 ? (
                        record.selectedServices.map((svc, i) => (
                            <Tag color="cyan" key={i}>
                                {svc.name} <b>(₹{svc.price})</b>
                            </Tag>
                        ))
                    ) : (
                        <span className="text-gray-400 text-xs">Standard</span>
                    )}
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (text, record) => (
                <Tag color={record.status === 'pending' ? 'yellow' : record.status === 'approved' ? 'green' : 'red'}>{record.status.toUpperCase()}</Tag>
            )
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            render: (text, record) => (
                <div className="flex gap-2">
                    {record.status === 'pending' && (
                        <>
                            <button className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600" onClick={() => handleStatus(record, 'approved')}>Approve</button>
                            <button className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600" onClick={() => handleStatus(record, 'reject')}>Reject</button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <Layout>
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">Patient Appointments</h1>
            <div className="bg-white p-4 rounded-xl shadow-sm">
                <Table columns={columns} dataSource={appointments} rowKey="_id" />
            </div>
        </Layout>
    );
};

export default DoctorAppointments;
