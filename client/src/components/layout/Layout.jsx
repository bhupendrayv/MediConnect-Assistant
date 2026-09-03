import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../redux/features/userSlice';
import { message } from 'antd';
import { FiActivity, FiBell, FiCalendar, FiCpu, FiGrid, FiHome, FiLogOut, FiMenu, FiSettings, FiUser, FiUserCheck, FiDroplet, FiCamera, FiCreditCard, FiPlusCircle, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
    const { user } = useSelector((state) => state.user);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [collapsed, setCollapsed] = useState(false);

    // Menu list based on role
    const userMenu = [
        { name: 'Dashboard', path: '/dashboard', icon: <FiGrid /> },
        { name: 'Book Appointment', path: '/book-appointment', icon: <FiPlusCircle /> },
        { name: 'Appointments', path: '/appointments', icon: <FiCalendar /> },
        { name: 'Records Search', path: '/mobile-lookup', icon: <FiSearch /> },
        { name: 'Symptom AI', path: '/ai-diagnosis', icon: <FiCpu /> },
        { name: 'Blood Bank', path: '/blood-bank', icon: <FiDroplet style={{ color: '#ef4444' }} /> },
        { name: 'Payments', path: '/payments', icon: <FiCreditCard /> },
    ];

    const doctorMenu = [
        { name: 'Dashboard', path: '/dashboard', icon: <FiGrid /> },
        { name: 'Verify Code', path: '/verify-appointment', icon: <FiUserCheck /> },
        { name: 'Blood Bank', path: '/blood-bank', icon: <FiDroplet style={{ color: '#ef4444' }} /> },
        { name: 'My Visits', path: '/doctor-appointments', icon: <FiCalendar /> },
        { name: 'My Profile', path: `/doctor/profile/${user?._id}`, icon: <FiUser /> },
        { name: 'Payments', path: '/payments', icon: <FiCreditCard /> },
    ];

    const adminMenu = [
        { name: 'Dashboard', path: '/dashboard', icon: <FiGrid /> },
        { name: 'Doctors', path: '/admin/doctors', icon: <FiUserCheck /> },
        { name: 'Patients', path: '/admin/users', icon: <FiUser /> },
        { name: 'Appointments', path: '/admin/appointments', icon: <FiCalendar /> },
        { name: 'Blood Requests', path: '/admin/blood-requests', icon: <FiDroplet style={{ color: '#ef4444' }} /> },
        { name: 'Broadcast', path: '/admin/broadcast', icon: <FiBell /> },
        { name: 'Site Settings', path: '/admin/settings', icon: <FiSettings /> },
    ];

    const menuToBeRendered = user?.isAdmin ? adminMenu : user?.isDoctor ? doctorMenu : userMenu;

    const handleLogout = () => {
        localStorage.clear();
        dispatch(setUser(null));
        message.success('Signed out successfully');
        navigate('/login');
    };

    const fileInputRef = useRef(null);

    const handleProfileClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const base64Image = reader.result;
                    const res = await axios.post('/user/update-profile-picture',
                        { userId: user._id, image: base64Image },
                        { headers: { Authorization: "Bearer " + localStorage.getItem('token') } }
                    );
                    if (res.data.success) {
                        message.success(res.data.message);
                        dispatch(setUser(res.data.data)); // Update redux state with new image
                    } else {
                        message.error(res.data.message);
                    }
                } catch (error) {
                    console.log(error);
                    message.error('Something went wrong');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Sidebar */}
            <motion.div
                initial={false}
                animate={{ width: collapsed ? 100 : 300 }}
                className="bg-slate-900 h-full relative z-20 shadow-2xl flex flex-col pt-10"
            >
                {/* Logo */}
                <Link to="/" className="px-8 mb-12 flex items-center gap-4 group cursor-pointer">
                    <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/20 shrink-0 group-hover:scale-110 transition-transform">
                        <FiActivity className="text-white text-2xl" />
                    </div>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-2xl font-black text-white italic tracking-tighter uppercase"
                        >
                            Health<span className="text-primary">Hub.</span>
                        </motion.span>
                    )}
                </Link>

                {/* Navigation */}
                <div className="flex-1 px-4 space-y-2">
                    <Link to="/">
                        <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${location.pathname === '/' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <span className="text-xl group-hover:scale-110 transition-transform"><FiHome /></span>
                            {!collapsed && <span className="font-black italic uppercase tracking-widest text-xs">Public Site</span>}
                        </div>
                    </Link>
                    <div className="h-px bg-white/5 mx-4 my-2 opacity-50"></div>
                    {menuToBeRendered.map((menu) => {
                        const isActive = location.pathname === menu.path;
                        return (
                            <Link key={menu.name} to={menu.path}>
                                <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${isActive ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                    <span className="text-xl">{menu.icon}</span>
                                    {!collapsed && <span className="font-black italic uppercase tracking-widest text-xs">{menu.name}</span>}
                                    {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"></div>}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/5">
                    <div
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all cursor-pointer group"
                    >
                        <FiLogOut className="text-xl group-hover:rotate-180 transition-transform duration-500" />
                        {!collapsed && <span className="font-black italic uppercase tracking-widest text-xs">Sign Out</span>}
                    </div>
                </div>
            </motion.div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen relative">
                {/* Header */}
                <header className="h-24 bg-white/70 backdrop-blur-xl flex items-center justify-between px-10 border-b border-slate-100 z-10 shrink-0">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                        >
                            <FiMenu className="text-xl" />
                        </button>
                        <div className="hidden md:block">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Current Portal</h2>
                            <p className="font-black italic uppercase text-slate-800 tracking-tight">{user?.isAdmin ? 'Administrator' : user?.isDoctor ? 'Verfied Doctor' : 'Patient Central'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Notifications */}
                        <div
                            className="relative w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer hover:text-primary transition-all"
                            onClick={() => navigate('/notification')}
                        >
                            <FiBell className="text-xl" />
                            {user?.unseenNotifications?.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center border-4 border-white">
                                    {user.unseenNotifications.length}
                                </span>
                            )}
                        </div>

                        {/* Profile */}
                        <div className="flex items-center gap-4 pl-8 border-l border-slate-100">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Welcome</p>
                                <p className="font-black italic uppercase text-slate-800 tracking-tight leading-none">{user?.name}</p>
                            </div>
                            <div
                                onClick={handleProfileClick}
                                className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center text-primary font-black text-xl shadow-inner border border-white/50 cursor-pointer overflow-hidden relative group"
                                title="Click to change profile picture"
                            >
                                {user?.image ? (
                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0).toUpperCase()
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FiCamera className="text-white text-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="flex-1 overflow-y-auto bg-slate-50/50">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
