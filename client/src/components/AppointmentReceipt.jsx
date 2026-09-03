import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';
import { FiActivity, FiCalendar, FiClock, FiUser, FiMail, FiMapPin, FiDownload, FiShare2, FiSend, FiCheckCircle, FiPhone, FiCreditCard, FiShield } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { message } from 'antd';
import html2canvas from 'html2canvas';

const AppointmentReceipt = ({ appointment, onClose, autoDownload = false, silent = false }) => {
    const [showShareOptions, setShowShareOptions] = React.useState(false);
    const receiptRef = useRef(null);

    // Auto-trigger download if requested
    React.useEffect(() => {
        if (autoDownload || silent) {
            // Small delay to ensure initial mount
            const timer = setTimeout(() => {
                handleDownload();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [appointment, autoDownload, silent]);


    // Download receipt as PDF
    const handleDownload = async () => {
        try {
            message.loading({ content: 'Generating secure PDF...', key: 'download' });

            if (!receiptRef.current) {
                throw new Error('Receipt reference not found');
            }

            // Extended delay to ensure all assets (QR code, icons) are fully loaded
            await new Promise(resolve => setTimeout(resolve, 1500));

            const canvas = await html2canvas(receiptRef.current, {
                scale: 1.5, // High resolution for clear text
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                allowTaint: false,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 800, // Fixed width for consistent rendering
                onclone: (clonedDoc) => {
                    // Find the receipt container in the clone
                    const el = clonedDoc.querySelector('[data-receipt-container="true"]');
                    if (el) {
                        el.style.opacity = '1';
                        el.style.visibility = 'visible';
                        el.style.display = 'block';
                        el.style.position = 'relative';
                        el.style.left = '0';
                        el.style.top = '0';
                        el.style.width = '800px';
                        el.style.height = 'auto'; // Force auto height

                        // Ensure all parents are visible and not clipping
                        let parent = el.parentElement;
                        while (parent && parent !== clonedDoc.body) {
                            parent.style.transform = 'none';
                            parent.style.overflow = 'visible';
                            parent.style.maxHeight = 'none';
                            parent.style.height = 'auto';
                            parent.style.opacity = '1';
                            parent.style.visibility = 'visible';
                            parent.style.width = 'auto';
                            parent = parent.parentElement;
                        }
                    }
                }
            });

            // Use PNG for maximum compatibility and sharpness
            const imgData = canvas.toDataURL('image/png', 1.0);

            // Calculate dimensions for a perfect single-page fit
            const pdfWidth = 210; // Standard A4 width in mm
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [pdfWidth, pdfHeight],
                compress: true
            });

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

            const fileName = `SmartHealth-Receipt-${appointment.appointmentCode || 'receipt'}.pdf`;

            // 1. Download to system
            pdf.save(fileName);

            // 2. Open Preview in new tab (ensures user can see it instantly)
            const blob = pdf.output('blob');
            const blobURL = URL.createObjectURL(blob);
            window.open(blobURL, '_blank');

            message.success({ content: 'Receipt downloaded and opened!', key: 'download' });

            // If silent, close the background component after download
            if (silent) {
                setTimeout(onClose, 2000);
            }

        } catch (error) {
            console.error('Download error:', error);
            message.error({ content: 'Failed to generate PDF. Please try again.', key: 'download' });
            if (silent) onClose();
        }
    };


    const shareText = `
🏥 Smart Health Assistant - Appointment Receipt

✅ Verification Code: ${appointment.appointmentCode}
👤 Patient: ${appointment.userInfo?.name}
👨‍⚕️ Doctor: ${appointment.doctorInfo?.name?.toLowerCase().startsWith('dr') ? appointment.doctorInfo?.name : `Dr. ${appointment.doctorInfo?.name}`}
🩺 Specialization: ${appointment.doctorInfo?.specialization}
📅 Date: ${appointment.date}
🕐 Time: ${appointment.time}
💰 Total Amount: ₹${appointment.totalAmount || appointment.doctorInfo?.feesPerConsultation}
💳 Payment Status: ${appointment.paymentStatus || 'Pending'}
🆔 Transaction ID: ${appointment.transactionId || 'N/A'}
${appointment.status === 'approved' ? '✅ Doctor Status: Approved by Doctor' : `📋 Doctor Status: ${appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Pending'}`}

Please present this code at the time of your appointment.
        `.trim();

    // Share receipt
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Appointment Receipt',
                    text: shareText,
                });
                message.success('Shared successfully!');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    copyToClipboard(shareText);
                }
            }
        } else {
            copyToClipboard(shareText);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        message.success('Receipt details copied to clipboard!');
    };

    // Send via email
    const handleSendEmail = () => {
        try {
            const subject = encodeURIComponent(`Appointment Receipt - ${appointment.appointmentCode}`);
            const body = encodeURIComponent(`
Smart Health Assistant - Appointment Receipt

Verification Code: ${appointment.appointmentCode}

Patient Details:
Name: ${appointment.userInfo?.name}
Email: ${appointment.userInfo?.email}
Mobile: ${appointment.userInfo?.mobileNumber || 'N/A'}
Age: ${appointment.userInfo?.age}
Gender: ${appointment.userInfo?.gender}
Address: ${appointment.userInfo?.address}

Doctor Details:
Doctor: ${appointment.doctorInfo?.name?.toLowerCase().startsWith('dr') ? appointment.doctorInfo?.name : `Dr. ${appointment.doctorInfo?.name}`}
Specialization: ${appointment.doctorInfo?.specialization}
Consultation Fee: ₹${appointment.doctorInfo?.feesPerConsultation}
Doctor Approval: ${appointment.status === 'approved' ? 'Approved by Doctor' : appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Pending'}

Appointment Details:
Date: ${appointment.date}
Time: ${appointment.time}

Medical Issue: ${appointment.userInfo?.problem || 'N/A'}

Important: Please bring this verification code and a valid ID to your appointment. Arrive 10 minutes early for check-in.

For support, contact: medi.connectofficial2026@gmail.com
            `);

            const mailtoLink = `mailto:${appointment.userInfo?.email}?subject=${subject}&body=${body}`;

            // Create a temporary hidden link and click it to trigger email client
            const tempLink = document.createElement('a');
            tempLink.href = mailtoLink;
            tempLink.style.display = 'none';
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);

            message.success('Opening email client...');
        } catch (error) {
            console.error('Email error:', error);
            message.error('Failed to open email client');
        }
    };

    // Share via WhatsApp
    const handleWhatsAppShare = () => {
        try {
            const whatsappText = encodeURIComponent(`
🏥 *Smart Health Assistant*
*Appointment Receipt*

✅ *Verification Code:* ${appointment.appointmentCode}

👤 *Patient:* ${appointment.userInfo?.name}
📱 *Mobile:* ${appointment.userInfo?.mobileNumber || 'N/A'}

👨‍⚕️ *Doctor:* ${appointment.doctorInfo?.name?.toLowerCase().startsWith('dr') ? appointment.doctorInfo?.name : `Dr. ${appointment.doctorInfo?.name}`}
🩺 *Specialization:* ${appointment.doctorInfo?.specialization}
${appointment.status === 'approved' ? '✅ *Doctor Status:* Approved by Doctor' : `📋 *Doctor Status:* ${appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Pending'}`}

📅 *Date:* ${appointment.date}
🕐 *Time:* ${appointment.time}

💰 *Total Amount:* ₹${appointment.totalAmount || appointment.doctorInfo?.feesPerConsultation}
💳 *Payment Status:* ${appointment.paymentStatus || 'Pending'}

⚠️ *Important:* Please present this code at the time of your appointment.
            `);

            const whatsappUrl = `https://wa.me/?text=${whatsappText}`;
            window.open(whatsappUrl, '_blank');

            message.success('Opening WhatsApp...');
        } catch (error) {
            console.error('WhatsApp error:', error);
            message.error('Failed to open WhatsApp');
        }
    };

    // Share via Telegram
    const handleTelegramShare = () => {
        try {
            const telegramText = encodeURIComponent(`
🏥 *Smart Health Assistant*
*Appointment Receipt*

✅ Verification Code: ${appointment.appointmentCode}
👤 Patient: ${appointment.userInfo?.name}
👨‍⚕️ Doctor: ${appointment.doctorInfo?.name?.toLowerCase().startsWith('dr') ? appointment.doctorInfo?.name : `Dr. ${appointment.doctorInfo?.name}`}
📅 Date: ${appointment.date} at ${appointment.time}

Please present this code at the time of your appointment.
            `);

            const telegramUrl = `https://t.me/share/url?url=${window.location.origin}&text=${telegramText}`;
            window.open(telegramUrl, '_blank');

            message.success('Opening Telegram...');
        } catch (error) {
            console.error('Telegram error:', error);
            message.error('Failed to open Telegram');
        }
    };

    const receiptContent = (
        <div ref={receiptRef} className="p-8 bg-white" data-receipt-container="true">
            {/* Header */}
            <div className="text-center mb-8 pb-6 border-b-2 border-slate-100">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="bg-primary p-3 rounded-xl shadow-lg shadow-primary/20">
                        <FiActivity className="text-white text-3xl" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                        Smart<span className="text-primary">Health</span>
                    </h1>
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tighter italic uppercase mb-2">
                    Appointment Receipt
                </h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                    Confirmation & Verification Document
                </p>
            </div>

            {/* Verification Code - Prominent Display */}
            <div className="bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-3xl p-6 mb-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <p className="text-white/60 font-black uppercase tracking-[0.3em] text-[10px] mb-3 relative z-10">
                    Verification Code
                </p>
                <h3 className="text-white text-5xl font-black italic tracking-tighter uppercase mb-3 relative z-10">
                    {appointment.appointmentCode}
                </h3>
                <div className="flex items-center justify-center gap-2 text-white/80 relative z-10">
                    <FiCheckCircle className="text-xl" />
                    <p className="text-sm font-bold uppercase tracking-widest">
                        Booking Confirmed
                    </p>
                </div>

                {/* QR Code Section - Moved to Top */}
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
                        <QRCodeCanvas
                            value={`
🏥 SMART HEALTH ASSISTANT - DIGITAL RECEIPT
-------------------------------------------
✅ VERIFICATION: ${appointment.appointmentCode}
📋 STATUS: ${appointment.status?.toUpperCase() || 'PENDING'}
📅 DATE: ${appointment.date}
🕐 TIME: ${appointment.time}

👤 PATIENT PROFILE
Name: ${appointment.userInfo?.name}
Age/Gender: ${appointment.userInfo?.age}y / ${appointment.userInfo?.gender}
Mobile: ${appointment.userInfo?.mobileNumber || 'N/A'}
Problem: ${appointment.userInfo?.problem || 'General Checkup'}

👨‍⚕️ DOCTOR DETAILS
Doctor: ${appointment.doctorInfo?.name?.toLowerCase().startsWith('dr') ? appointment.doctorInfo?.name : `Dr. ${appointment.doctorInfo?.name}`}
Specialty: ${appointment.doctorInfo?.specialization}

💰 FINANCIAL SUMMARY
Total Amount: ₹${appointment.totalAmount || appointment.doctorInfo?.feesPerConsultation}
Payment: ${appointment.paymentStatus?.toUpperCase() || 'PENDING'}
Tx ID: ${appointment.transactionId || 'N/A'}
Services: ${appointment.selectedServices?.map(s => s.name || s).join(', ') || 'Standard Consultation'}

-------------------------------------------
Verified by SmartHealth System
Generated on: ${new Date().toLocaleString()}
                            `.trim()}
                            size={128}
                            level={"H"}
                            includeMargin={true}
                        />
                    </div>
                    <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scan for details</p>
                </div>
            </div>

            {/* Doctor Approval / Checkup Status */}
            <div className="mb-6">
                <div className={`rounded-2xl p-6 flex items-center gap-4 ${appointment.status === 'completed' || appointment.status === 'approved' ? 'bg-emerald-50 border-2 border-emerald-200' : appointment.status === 'rejected' || appointment.status === 'cancelled' ? 'bg-red-50 border-2 border-red-200' : 'bg-amber-50 border-2 border-amber-200'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${appointment.status === 'completed' || appointment.status === 'approved' ? 'bg-emerald-500' : appointment.status === 'rejected' || appointment.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'}`}>
                        <FiShield className="text-white text-xl" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Consultation Status</p>
                        <p className={`text-lg font-black uppercase tracking-tight italic ${appointment.status === 'completed' || appointment.status === 'approved' ? 'text-emerald-700' : appointment.status === 'rejected' || appointment.status === 'cancelled' ? 'text-red-700' : 'text-amber-700'}`}>
                            {appointment.status === 'completed' ? '✅ Checkup Completed' : appointment.status === 'approved' ? '✅ Approved by Doctor' : appointment.status === 'rejected' ? '❌ Rejected by Doctor' : appointment.status === 'cancelled' ? '🚫 Cancelled' : '⏳ Pending Doctor Approval'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Doctor Clinical Notes & Prescription */}
            {(appointment.doctorNotes || appointment.prescription || appointment.recommendations) && (
                <div className="mb-6">
                    <h3 className="text-lg font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FiFileText /> Clinical Notes & Prescription
                    </h3>
                    <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl p-6 space-y-3">
                        {appointment.prescribedAt && (
                            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                                Timestamp: {new Date(appointment.prescribedAt).toLocaleString()}
                            </p>
                        )}
                        {appointment.doctorNotes && (
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Diagnosis Notes</p>
                                <p className="text-sm font-medium text-slate-800">{appointment.doctorNotes}</p>
                            </div>
                        )}
                        {appointment.prescription && (
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Prescription / Medications</p>
                                <div className="bg-white p-4 rounded-xl border border-emerald-200 text-sm font-bold text-emerald-900">
                                    {appointment.prescription}
                                </div>
                            </div>
                        )}
                        {appointment.recommendations && (
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Recommendations & Follow-up</p>
                                <p className="text-sm font-medium text-slate-800">{appointment.recommendations}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Doctor Transfer History */}
            {appointment.transferHistory && appointment.transferHistory.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-black text-purple-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FiShare2 /> Doctor Transfer Audit Log ({appointment.transferHistory.length})
                    </h3>
                    <div className="bg-purple-50/70 border-2 border-purple-200 rounded-2xl p-6 space-y-2">
                        {appointment.transferHistory.map((t, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-xl border border-purple-100 text-xs flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-purple-900">{t.fromDoctorName} ➔ {t.toDoctorName}</p>
                                    <p className="text-[10px] text-slate-500">Reason: {t.reason}</p>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">
                                    {new Date(t.transferredAt).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Patient Information */}
            <div className="mb-6">
                <h3 className="text-lg font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FiUser /> Patient Information
                </h3>
                <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Full Name</p>
                            <p className="text-sm font-bold text-slate-800">{appointment.userInfo?.name}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Email</p>
                            <p className="text-sm font-bold text-slate-800">{appointment.userInfo?.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mobile Reference</p>
                            <p className="text-sm font-bold text-emerald-600 font-mono">{appointment.userInfo?.mobileNumber || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Age</p>
                            <p className="text-sm font-bold text-slate-800">{appointment.userInfo?.age} years</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Gender</p>
                            <p className="text-sm font-bold text-slate-800">{appointment.userInfo?.gender}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Address</p>
                            <p className="text-sm font-bold text-slate-800">{appointment.userInfo?.address}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Doctor Information */}
            <div className="mb-6">
                <h3 className="text-lg font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FiActivity /> Doctor Information
                </h3>
                <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Doctor Name</p>
                            <p className="text-sm font-bold text-slate-800">
                                {appointment.doctorInfo?.name?.toLowerCase().startsWith('dr') ? appointment.doctorInfo?.name : `Dr. ${appointment.doctorInfo?.name}`}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Specialization</p>
                            <p className="text-sm font-bold text-slate-800">{appointment.doctorInfo?.specialization}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Consultation Fee</p>
                        <p className="text-sm font-bold text-slate-800">₹{appointment.doctorInfo?.feesPerConsultation}</p>
                    </div>
                </div>
            </div>

            {/* Payment Details */}
            <div className="mb-6">
                <h3 className="text-lg font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FiCreditCard /> Payment Information
                </h3>
                <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Payment Status</p>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${appointment.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                {appointment.paymentStatus || 'Pending'}
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Transaction ID</p>
                            <p className="text-sm font-bold text-slate-800 font-mono text-xs">{appointment.transactionId || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Details */}
            {appointment.selectedServices && appointment.selectedServices.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FiActivity /> Service Details
                    </h3>
                    <div className="bg-slate-50 rounded-2xl p-6">
                        <div className="space-y-3 mb-4">
                            {appointment.selectedServices.map((svc, i) => (
                                <div key={i} className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-2 last:border-0 last:pb-0">
                                    <span className="font-bold text-slate-700">{svc.name || svc}</span>
                                    <span className="font-black text-slate-900">₹{svc.price || 0}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t-2 border-slate-200 pt-3 flex justify-between items-center">
                            <div className="text-left">
                                <span className="font-black uppercase text-xs tracking-widest text-slate-500">Total Amount</span>
                            </div>
                            <span className="font-black text-2xl text-emerald-600">
                                ₹{appointment.totalAmount || ((appointment.doctorInfo?.feesPerConsultation || 0) + appointment.selectedServices.reduce((acc, curr) => acc + (curr.price || 0), 0))}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Appointment Details */}
            <div className="mb-6">
                <h3 className="text-lg font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FiCalendar /> Appointment Details
                </h3>
                <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Date</p>
                            <p className="text-sm font-bold text-slate-800">{appointment.date}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Time</p>
                            <p className="text-sm font-bold text-slate-800">{appointment.time}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Medical Information */}
            {appointment.userInfo?.problem && (
                <div className="mb-6">
                    <h3 className="text-lg font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FiMail /> Medical Information
                    </h3>
                    <div className="bg-slate-50 rounded-2xl p-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Problem Description</p>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{appointment.userInfo?.problem}</p>
                    </div>
                </div>
            )}

            {/* Important Note */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
                <p className="text-xs font-bold text-amber-800 leading-relaxed">
                    <strong className="uppercase tracking-widest">Important:</strong> Please bring this verification code and a valid ID to your appointment. Arrive 10 minutes early for check-in.
                </p>
            </div>

            {/* Footer with Timestamps */}
            <div className="text-center pt-6 border-t-2 border-slate-100">
                <p className="text-slate-400 text-xs font-bold mb-1">
                    © 2026 Smart Health Assistant. All Rights Reserved.
                </p>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    Generated on: {new Date().toLocaleString()} • Audit Timestamp: {new Date().toISOString()}
                </p>
                <p className="text-slate-300 text-[10px] font-medium mt-1">
                    For support, contact: medi.connectofficial2026@gmail.com
                </p>
            </div>
        </div>
    );

    if (silent) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: '-9999px', // True off-screen, no height impact
                width: '800px',
                height: 'auto',
                opacity: 0.01,
                pointerEvents: 'none',
                zIndex: -9999,
                backgroundColor: 'white'
            }}>
                <div style={{ width: '800px', backgroundColor: 'white' }}>
                    {receiptContent}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all z-20 font-bold text-xl"
                >
                    ×
                </button>

                {/* Receipt Content */}
                {receiptContent}

                {/* Action Area */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col gap-5">
                    {/* Primary Download Button */}
                    <button
                        onClick={handleDownload}
                        className="group relative h-16 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            DOWNLOAD RECEIPT PDF
                        </span>
                    </button>

                    {/* Quick Share Section */}
                    <div className="flex items-center justify-between px-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Share Securely:</span>
                        <div className="flex gap-6">
                            <button
                                onClick={handleWhatsAppShare}
                                className="text-slate-400 hover:text-green-500 transition-all hover:scale-110"
                                title="WhatsApp"
                            >
                                <FaWhatsapp size={20} />
                            </button>
                            <button
                                onClick={handleSendEmail}
                                className="text-slate-400 hover:text-indigo-500 transition-all hover:scale-110"
                                title="Email"
                            >
                                <FiSend size={20} />
                            </button>
                            <button
                                onClick={handleTelegramShare}
                                className="text-slate-400 hover:text-sky-500 transition-all hover:scale-110"
                                title="Telegram"
                            >
                                <FaTelegram size={20} />
                            </button>
                            <button
                                onClick={handleShare}
                                className="text-slate-400 hover:text-slate-800 transition-all hover:scale-110"
                                title="More Options"
                            >
                                <FiShare2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div >
        </div >
    );
};

export default AppointmentReceipt;
