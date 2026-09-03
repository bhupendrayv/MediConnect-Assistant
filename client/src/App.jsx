import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import { useSelector } from 'react-redux';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';
import ApplyDoctor from './pages/ApplyDoctor';
import NotificationPage from './pages/NotificationPage';
import Doctors from './pages/admin/Doctors';
import Users from './pages/admin/Users';
import Profile from './pages/doctor/Profile';
import BookingPage from './pages/BookingPage';
import Appointments from './pages/Appointments';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import AIHelper from './pages/AIHelper';
import VerifyAppointment from './pages/VerifyAppointment';
import BloodBank from './pages/BloodBank';
import LandingPage from './pages/LandingPage';
import SiteSettings from './pages/admin/SiteSettings';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminBloodRequests from './pages/admin/AdminBloodRequests';
import AdminBroadcast from './pages/admin/AdminBroadcast';
import AdminLogin from './pages/admin/AdminLogin';
import DoctorLogin from './pages/doctor/DoctorLogin';
import MobileLookup from './pages/MobileLookup';
import { FiActivity } from 'react-icons/fi';

function App() {
    const { loading } = useSelector(state => state.alerts);
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            {loading && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
                    <div className="bg-primary p-4 rounded-3xl shadow-2xl shadow-primary/20 animate-bounce mb-6">
                        <FiActivity className="text-white text-4xl" />
                    </div>
                    <div className="flex flex-col items-center">
                        <h2 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter animate-pulse">Processing...</h2>
                        <div className="mt-4 flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                        </div>
                    </div>
                </div>
            )}
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={
                    <ProtectedRoute>
                        <HomePage />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <HomePage />
                    </ProtectedRoute>
                } />
                <Route path="/apply-doctor" element={
                    <ProtectedRoute>
                        <ApplyDoctor />
                    </ProtectedRoute>
                } />
                <Route path="/blood-bank" element={
                    <ProtectedRoute>
                        <BloodBank />
                    </ProtectedRoute>
                } />
                <Route path="/notification" element={
                    <ProtectedRoute>
                        <NotificationPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                    <ProtectedRoute>
                        <Users />
                    </ProtectedRoute>
                } />
                <Route path="/admin/doctors" element={
                    <ProtectedRoute>
                        <Doctors />
                    </ProtectedRoute>
                } />
                <Route path="/admin/appointments" element={
                    <ProtectedRoute>
                        <AdminAppointments />
                    </ProtectedRoute>
                } />
                <Route path="/admin/blood-requests" element={
                    <ProtectedRoute>
                        <AdminBloodRequests />
                    </ProtectedRoute>
                } />
                <Route path="/admin/broadcast" element={
                    <ProtectedRoute>
                        <AdminBroadcast />
                    </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                    <ProtectedRoute>
                        <SiteSettings />
                    </ProtectedRoute>
                } />

                <Route path="/doctor/profile/:id" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />
                <Route path="/doctor/book-appointment/:doctorId" element={
                    <ProtectedRoute>
                        <BookingPage />
                    </ProtectedRoute>
                } />
                <Route path="/book-appointment" element={
                    <ProtectedRoute>
                        <BookingPage />
                    </ProtectedRoute>
                } />
                <Route path="/appointments" element={
                    <ProtectedRoute>
                        <Appointments />
                    </ProtectedRoute>
                } />
                <Route path="/doctor-appointments" element={
                    <ProtectedRoute>
                        <DoctorAppointments />
                    </ProtectedRoute>
                } />
                <Route path="/mobile-lookup" element={
                    <ProtectedRoute>
                        <MobileLookup />
                    </ProtectedRoute>
                } />
                <Route path="/ai-diagnosis" element={
                    <ProtectedRoute>
                        <AIHelper />
                    </ProtectedRoute>
                } />
                <Route path="/verify-appointment" element={
                    <ProtectedRoute>
                        <VerifyAppointment />
                    </ProtectedRoute>
                } />
                <Route path="/login" element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } />
                <Route path="/admin" element={
                    <PublicRoute>
                        <AdminLogin />
                    </PublicRoute>
                } />
                <Route path="/admin/login" element={
                    <PublicRoute>
                        <AdminLogin />
                    </PublicRoute>
                } />
                <Route path="/doctor" element={
                    <PublicRoute>
                        <DoctorLogin />
                    </PublicRoute>
                } />
                <Route path="/doctor/login" element={
                    <PublicRoute>
                        <DoctorLogin />
                    </PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
