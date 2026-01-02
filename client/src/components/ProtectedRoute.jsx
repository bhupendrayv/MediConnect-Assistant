import React, { useEffect, useCallback, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../redux/features/alertSlice';
import { setUser } from '../redux/features/userSlice';
import axios from 'axios';

export default function ProtectedRoute({ children }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    const hasFetched = useRef(false);

    // Get User Logic
    const getUser = useCallback(async () => {
        if (hasFetched.current) return;
        try {
            hasFetched.current = true;
            dispatch(showLoading());
            const res = await axios.post('/api/v1/user/getUserData',
                { token: localStorage.getItem('token') },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

            if (res.data.success) {
                dispatch(setUser(res.data.data));
            } else {
                localStorage.clear();
                navigate('/login');
            }
            dispatch(hideLoading());
        } catch (error) {
            dispatch(hideLoading());
            localStorage.clear();
            console.log(error);
            navigate('/login');
        } finally {
            hasFetched.current = false;
        }
    }, [dispatch, navigate]);

    useEffect(() => {
        if (!user && localStorage.getItem('token')) {
            getUser();
        }
    }, [user, getUser]);

    if (localStorage.getItem('token')) {
        return children;
    } else {
        return <Navigate to="/login" />;
    }
}
