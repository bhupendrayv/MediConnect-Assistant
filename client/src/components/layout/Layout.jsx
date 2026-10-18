import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../redux/features/userSlice';
import { message } from 'antd';
import { FiActivity, FiBell, FiCalendar, FiCpu, FiGrid, FiHome, FiLogOut, FiMenu, FiSettings, FiUser, FiUserCheck, FiDroplet, FiCamera, FiCreditCard, FiPlusCircle, FiSearch, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../ThemeToggle';

const Layout = ({ children }) => {
    const { user } = useSelector((state) => state.user);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

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
                        dispatch(setUser(res.data.data));
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

    const SidebarContent = ({ isMobile = false }) => (
        <>
            {/* Logo */}
            <Link to="/" className="px-6 mb-10 flex items-center gap-4 group cursor-pointer no-underline" style={{ textDecoration: 'none' }}>
                <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/20 shrink-0 group-hover:scale-110 transition-transform">
                    <FiActivity className="text-white text-2xl" />
                </div>
                {(!collapsed || isMobile) && (
                    <span
                        className="text-2xl font-black italic tracking-tighter uppercase select-none leading-none"
                        style={{ color: '#ffffff', textDecoration: 'none' }}
                    >
                        Health<span style={{ color: '#10b981' }}>Hub.</span>
                    </span>
                )}
            </Link>

            {/* Navigation */}
            <div className="flex-1 px-3 space-y-1 overflow-y-auto">
                <Link to="/" onClick={() => isMobile && setMobileOpen(false)}>
                    <div className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group ${location.pathname === '/' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <span className="text-xl shrink-0 group-hover:scale-110 transition-transform"><FiHome /></span>
                        {(!collapsed || isMobile) && <span className="font-black italic uppercase tracking-widest text-xs">Public Site</span>}
                    </div>
                </Link>
                <div className="h-px bg-white/5 mx-4 my-2 opacity-50"></div>
                {menuToBeRendered.map((menu) => {
                    const isActive = location.pathname === menu.path;
                    return (
                        <Link key={menu.name} to={menu.path} onClick={() => isMobile && setMobileOpen(false)}>
                            <div className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group ${isActive ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <span className="text-xl shrink-0">{menu.icon}</span>
                                {(!collapsed || isMobile) && <span className="font-black italic uppercase tracking-widest text-xs">{menu.name}</span>}
                                {isActive && (!collapsed || isMobile) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"></div>}
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/5">
                <div
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all cursor-pointer group"
                >
                    <FiLogOut className="text-xl shrink-0 group-hover:rotate-180 transition-transform duration-500" />
                    {(!collapsed || isMobile) && <span className="font-black italic uppercase tracking-widest text-xs">Sign Out</span>}
                </div>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

            {/* ── Mobile Overlay Drawer ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        />
                        {/* Drawer */}
                        <motion.div
                            key="drawer"
                            initial={{ x: -320 }}
                            animate={{ x: 0 }}
                            exit={{ x: -320 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed top-0 left-0 h-full w-72 bg-slate-900 z-50 flex flex-col pt-10 shadow-2xl md:hidden"
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                            >
                                <FiX className="text-lg" />
                            </button>
                            <SidebarContent isMobile={true} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Desktop Sidebar ── */}
            <motion.div
                initial={false}
                animate={{ width: collapsed ? 80 : 280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-slate-900 h-full relative z-20 shadow-2xl flex-col pt-10 hidden md:flex overflow-hidden"
            >
                <SidebarContent isMobile={false} />
            </motion.div>

            {/* ── Main Content Area ── */}
            <div className="flex-1 flex flex-col h-screen relative min-w-0">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 border-b border-slate-100 z-10 shrink-0 shadow-sm">
                    <div className="flex items-center gap-4">
                        {/* Toggle button – works on both mobile and desktop */}
                        <button
                            id="sidebar-toggle-btn"
                            onClick={() => {
                                // On mobile toggle mobile drawer; on desktop collapse
                                if (window.innerWidth < 768) {
                                    setMobileOpen(prev => !prev);
                                } else {
                                    setCollapsed(prev => !prev);
                                }
                            }}
                            className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/30 hover:bg-emerald-50 transition-all shadow-sm"
                            title="Toggle Sidebar"
                            aria-label="Toggle Sidebar"
                        >
                            <motion.div
                                animate={{ rotate: collapsed ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <FiMenu className="text-xl" />
                            </motion.div>
                        </button>

                        <div className="hidden md:block">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-0.5">Current Portal</h2>
                            <p className="font-black italic uppercase text-slate-800 tracking-tight text-sm leading-none">
                                {user?.isAdmin ? 'Administrator' : user?.isDoctor ? 'Verified Doctor' : 'Patient Central'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-5">
                        {/* Light/Dark Mode Toggle */}
                        <div className="flex items-center" title="Toggle Light/Dark Mode">
                            <ThemeToggle />
                        </div>

                        {/* Notifications */}
                        <div
                            className="relative w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 cursor-pointer hover:text-primary hover:border-primary/30 hover:bg-emerald-50 transition-all shadow-sm"
                            onClick={() => navigate('/notification')}
                        >
                            <FiBell className="text-xl" />
                            {user?.unseenNotifications?.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow">
                                    {user.unseenNotifications.length}
                                </span>
                            )}
                        </div>

                        {/* Profile */}
                        <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-slate-100">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <div className="text-right hidden sm:block">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Welcome</p>
                                <p className="font-black italic uppercase text-slate-800 tracking-tight leading-none text-sm">{user?.name}</p>
                            </div>
                            <div
                                onClick={handleProfileClick}
                                className="w-12 h-12 bg-gradient-to-br from-primary/20 to-emerald-600/30 rounded-2xl flex items-center justify-center text-primary font-black text-lg shadow-inner border-2 border-white cursor-pointer overflow-hidden relative group"
                                title="Click to change profile picture"
                            >
                                {user?.image ? (
                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-emerald-700 font-black text-xl">{user?.name?.charAt(0).toUpperCase()}</span>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FiCamera className="text-white text-base" />
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
