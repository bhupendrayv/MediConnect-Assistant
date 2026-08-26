import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import axios from 'axios';
import { Table, Tag, message, Tooltip } from 'antd';
import moment from 'moment';
import { FiCheckCircle, FiClock, FiXCircle, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Payments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const printReceipt = (record) => {
        const doc = record.doctorInfo || {};
        const user = record.userInfo || {};
        const doctorName = doc.name?.toLowerCase().startsWith('dr') ? doc.name : `Dr. ${doc.name}`;
        const txId = record.transactionId || 'N/A';
        // QR code data - compact patient record summary
        const qrData = encodeURIComponent(
            `Code:${record.appointmentCode}|Patient:${user.name || 'N/A'}|Doctor:${doctorName}|Spec:${doc.specialization || 'N/A'}|Date:${record.date}|Time:${record.time}|Amt:${record.totalAmount}|Status:PAID`
        );
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}&margin=4`;

        const html = `<!DOCTYPE html><html><head><title>Receipt - ${record.appointmentCode}</title>
        <style>
        body{font-family:Arial,sans-serif;padding:40px;color:#1e293b;max-width:600px;margin:auto}
        .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
        .header-left h1{color:#10b981;font-size:28px;margin:0 0 4px 0}
        .header-left h2{font-size:14px;color:#64748b;margin:0}
        .qr-box{border:1px solid #e2e8f0;border-radius:8px;padding:6px;text-align:center}
        .qr-box img{display:block;width:90px;height:90px}
        .qr-box p{margin:4px 0 0;font-size:9px;color:#94a3b8;letter-spacing:1px}
        .code{background:#f0fdf4;border:2px solid #10b981;border-radius:12px;padding:16px;text-align:center;margin:20px 0}
        .code h3{font-size:36px;color:#10b981;margin:0;letter-spacing:4px}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        td{padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:14px}
        td:first-child{color:#64748b;font-weight:600;width:40%}
        td:last-child{font-weight:700} .paid{color:#10b981;font-weight:700}
        .footer{margin-top:32px;text-align:center;color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0;padding-top:16px}
        @media print{button{display:none}}
        </style></head>
        <body>
        <div class='header'>
          <div class='header-left'>
            <h1>SmartHealth</h1>
            <h2>Appointment Receipt</h2>
          </div>
          <div class='qr-box'>
            <img src='${qrUrl}' alt='QR Code' />
            <p>SCAN FOR DETAILS</p>
          </div>
        </div>
        <div class='code'><p style='margin:0;font-size:11px;color:#64748b;letter-spacing:3px'>VERIFICATION CODE</p>
        <h3>${record.appointmentCode}</h3><p style='margin:4px 0 0;color:#10b981;font-size:13px'>✓ Booking Confirmed</p></div>
        <table>
        <tr><td>Patient Name</td><td>${user.name || 'N/A'}</td></tr>
        <tr><td>Doctor</td><td>${doctorName || 'N/A'}</td></tr>
        <tr><td>Specialization</td><td>${doc.specialization || 'N/A'}</td></tr>
        <tr><td>Date</td><td>${record.date || 'N/A'}</td></tr>
        <tr><td>Time</td><td>${record.time || 'N/A'}</td></tr>
        <tr><td>Amount Paid</td><td>₹${record.totalAmount || doc.feesPerConsultation || 'N/A'}</td></tr>
        <tr><td>Payment Status</td><td class='paid'>✓ PAID</td></tr>
        <tr><td>Transaction ID</td><td style='font-size:11px;word-break:break-all'>${txId}</td></tr>
        <tr><td>Date of Payment</td><td>${moment(record.updatedAt || record.createdAt).format('DD MMM YYYY, hh:mm A')}</td></tr>
        </table>
        <div class='footer'><p>© 2024 Smart Health Assistant. All Rights Reserved.</p>
        <p>For support: medi.connectofficial2026@gmail.com</p></div>
        <script>window.onload=function(){window.print();}</script>
        </body></html>`;
        const w = window.open('', '_blank');
        w.document.write(html);
        w.document.close();
    };

    const getPayments = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/v1/user/user-appointments', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setLoading(false);
            if (res.data.success) {
                setAppointments(res.data.data);
            }
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    }, [setAppointments]);

    const verifyStripePayment = useCallback(async (sessionId, appointmentId) => {
        try {
            setLoading(true);
            message.loading({ content: 'Verifying your payment...', key: 'verify', duration: 0 });
            const res = await axios.post('/api/v1/user/verify-stripe-payment', { sessionId, appointmentId }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setLoading(false);
            message.destroy('verify');
            if (res.data.success) {
                setPaymentSuccess(true);
                message.success('🎉 Payment Successful! Your appointment is confirmed.');
                window.history.replaceState({}, document.title, window.location.pathname);
                getPayments();
            } else {
                message.error('Payment verification failed. Please contact support.');
                getPayments();
            }
        } catch (error) {
            setLoading(false);
            message.destroy('verify');
            console.log(error);
            message.error('Error verifying Stripe payment');
        }
    }, [getPayments]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const appointmentId = urlParams.get('appointmentId');

        if (sessionId && appointmentId) {
            verifyStripePayment(sessionId, appointmentId);
        } else {
            getPayments();
        }
    }, [verifyStripePayment, getPayments]);

    const columns = [
        {
            title: 'Appointment ID',
            dataIndex: 'appointmentCode',
            key: 'appointmentCode',
            render: (text) => <span className="font-black italic uppercase text-slate-800">{text}</span>
        },
        {
            title: 'Doctor',
            dataIndex: 'doctorInfo',
            key: 'doctor',
            render: (doctorInfo) => (
                <div>
                    <p className="font-bold text-slate-800 uppercase tracking-tight italic">{doctorInfo.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{doctorInfo.specialization}</p>
                </div>
            )
        },
        {
            title: 'Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount) => <span className="font-black text-primary italic">₹{amount}</span>
        },
        {
            title: 'Payment Status',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status) => {
                let icon = <FiClock className="mr-1" />;
                if (status === 'paid') {
                    icon = <FiCheckCircle className="mr-1" />;
                } else if (status === 'failed') {
                    icon = <FiXCircle className="mr-1" />;
                }
                return (
                    <Tag icon={icon} color={status === 'paid' ? 'success' : status === 'failed' ? 'error' : 'processing'} className="rounded-full px-4 py-1 font-bold uppercase tracking-widest text-[10px]">
                        {status || 'pending'}
                    </Tag>
                );
            }
        },
        {
            title: 'Transaction ID',
            key: 'transactionId',
            render: (record) => {
                const txId = record.transactionId || null;
                return txId ? (
                    <Tooltip title={txId}>
                        <span className="text-slate-400 font-mono text-xs cursor-help">
                            {txId}
                        </span>
                    </Tooltip>
                ) : <span className="text-slate-300 text-xs">---</span>;
            }
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'date',
            render: (date) => <span className="text-slate-500 font-medium text-xs">{moment(date).format('DD MMM YYYY, hh:mm A')}</span>
        },
        {
            title: 'Receipt',
            key: 'receipt',
            render: (record) => (
                record.paymentStatus === 'paid' ? (
                    <button
                        onClick={() => printReceipt(record)}
                        className="flex items-center gap-2 bg-primary text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full hover:bg-emerald-600 transition-all hover:scale-105 shadow-md shadow-primary/20"
                    >
                        <FiDownload />
                        Receipt
                    </button>
                ) : (
                    <span className="text-slate-300 text-xs font-bold uppercase">—</span>
                )
            )
        }
    ];

    return (
        <Layout>
            <div className="p-8 max-w-6xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase leading-none mb-2">Payment History.</h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Track your consultation bills and transactions</p>
                </motion.div>

                {/* Payment Success Banner */}
                {paymentSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-200 flex items-center gap-6"
                    >
                        <div className="bg-white/20 rounded-2xl p-4">
                            <FiCheckCircle className="text-white text-4xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Payment Successful! 🎉</h2>
                            <p className="text-emerald-100 font-bold text-sm mt-1">Your appointment has been confirmed and payment recorded. Click <strong>Receipt</strong> in the table below to download your PDF.</p>
                        </div>
                        <button
                            onClick={() => setPaymentSuccess(false)}
                            className="ml-auto text-white/60 hover:text-white font-bold text-xl"
                        >×</button>
                    </motion.div>
                )}

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
                >
                    <Table 
                        columns={columns} 
                        dataSource={appointments.filter(app => app.totalAmount > 0)} 
                        loading={loading}
                        rowKey="_id"
                        pagination={{ pageSize: 8 }}
                        className="custom-table"
                    />
                </motion.div>
            </div>
        </Layout>
    );
};

export default Payments;
