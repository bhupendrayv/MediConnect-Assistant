import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import axios from 'axios';
import { Table, message } from 'antd';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);

    const getDoctors = async () => {
        try {
            const res = await axios.get('/api/v1/admin/getAllDoctors', {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token'),
                },
            });
            if (res.data.success) {
                setDoctors(res.data.data);
            }
        } catch (error) {
            console.log(error);
            message.error("Error fetching doctors");
        }
    };

    const handleAccountStatus = async (record, status) => {
        try {
            const res = await axios.post('/api/v1/admin/changeAccountStatus',
                { doctorId: record._id, userId: record.userId, status }, // userId might be needed if notifications need it
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem('token'),
                    },
                });
            if (res.data.success) {
                message.success(res.data.message);
                getDoctors(); // Refresh
            }
        } catch (error) {
            console.log(error);
            message.error("Something went wrong");
        }
    };

    useEffect(() => {
        getDoctors();
    }, []);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            render: (text, record) => (<span>Dr. {record.name}</span>)
        },
        {
            title: 'Status',
            dataIndex: 'status',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            render: (text, record) => (
                <div className="flex gap-2">
                    {record.status === 'pending' ? (
                        <button className="bg-green-500 text-white px-3 py-1 rounded-md text-xs hover:bg-green-600" onClick={() => handleAccountStatus(record, 'approved')}>Approve</button>
                    ) : (
                        <button className="bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600" onClick={() => handleAccountStatus(record, 'rejected')}>Reject</button>
                    )}
                </div>
            )
        }
    ];

    return (
        <Layout>
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">Doctors List</h1>
            <div className="bg-white p-4 rounded-xl shadow-sm">
                <Table columns={columns} dataSource={doctors} rowKey="_id" />
            </div>
        </Layout>
    );
};

export default Doctors;
