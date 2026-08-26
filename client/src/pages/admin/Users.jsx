import { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/layout/Layout';
import axios from 'axios';
import { Table, message } from 'antd';

const Users = () => {
    const [users, setUsers] = useState([]);

    const getUsers = async () => {
        try {
            const res = await axios.get('/api/v1/admin/getAllUsers', {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token'),
                },
            });
            if (res.data.success) {
                setUsers(res.data.data);
            }
        } catch (error) {
            console.log(error);
            message.error("Error fetching users");
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Doctor',
            dataIndex: 'isDoctor',
            render: (_, record) => (<span>{record.isDoctor ? 'Yes' : 'No'}</span>)
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            render: () => (
                <div className="d-flex">
                    <button className="bg-red-500 text-white px-3 py-1 rounded-sm text-xs">Block</button>
                </div>
            )
        }
    ];

    return (
        <Layout>
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">Users List</h1>
            <div className="bg-white p-4 rounded-xl shadow-sm">
                <Table columns={columns} dataSource={users} rowKey="_id" />
            </div>
        </Layout>
    );
};

export default Users;
