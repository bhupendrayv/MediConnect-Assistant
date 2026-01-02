import React from 'react';
import Layout from '../components/layout/Layout';
import { Tabs, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../redux/features/alertSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NotificationPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);

    const handleMarkAllRead = async () => {
        try {
            dispatch(showLoading());
            const res = await axios.post('/api/v1/user/get-all-notification', { userId: user._id }, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token'),
                },
            });
            dispatch(hideLoading());
            if (res.data.success) {
                message.success(res.data.message);
                // Ideally refresh user state here or reload
                window.location.reload();
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            dispatch(hideLoading());
            console.log(error);
            message.error("Something went wrong");
        }
    };

    const handleDeleteAllRead = async () => {
        // Implementation for delete API if needed
        message.info("Feature coming soon");
    };

    return (
        <Layout>
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">Notifications</h1>
            <Tabs>
                <Tabs.TabPane tab="Unread" key={0}>
                    <div className="flex justify-end mb-4">
                        <h4 className="text-primary cursor-pointer hover:underline" onClick={handleMarkAllRead}>Mark all as read</h4>
                    </div>
                    {user?.unseenNotifications.map((notification, index) => (
                        <div key={index} className="bg-white p-4 mb-2 rounded-lg shadow-sm border-l-4 border-primary cursor-pointer hover:bg-gray-50" onClick={() => navigate(notification.onClickPath)}>
                            <div className="text-gray-800">{notification.message}</div>
                        </div>
                    ))}
                    {user?.unseenNotifications.length === 0 && <p className="text-center text-gray-500">No new notifications</p>}
                </Tabs.TabPane>
                <Tabs.TabPane tab="Read" key={1}>
                    <div className="flex justify-end mb-4">
                        <h4 className="text-red-500 cursor-pointer hover:underline" onClick={handleDeleteAllRead}>Delete all read</h4>
                    </div>
                    {user?.seenNotifications.map((notification, index) => (
                        <div key={index} className="bg-white p-4 mb-2 rounded-lg shadow-sm opacity-60 cursor-pointer" onClick={() => navigate(notification.onClickPath)}>
                            <div className="text-gray-800">{notification.message}</div>
                        </div>
                    ))}
                </Tabs.TabPane>
            </Tabs>
        </Layout>
    );
};

export default NotificationPage;
