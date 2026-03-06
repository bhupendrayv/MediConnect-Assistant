import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';
import { FiActivity, FiCalendar, FiClock, FiUser, FiMail, FiMapPin, FiDownload, FiShare2, FiSend, FiCheckCircle, FiPhone } from 'react-icons/fi';
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

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            const pageHeight = pdf.internal.pageSize.getHeight();

            let heightLeft = pdfHeight;
            let position = 0;

            // Page 1
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
            heightLeft -= pageHeight;

            // Handle multi-page if receipt is longer than A4
            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
                heightLeft -= pageHeight;
            }

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
💰 Consultation Fee: ₹${appointment.doctorInfo?.feesPerConsultation}

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

Appointment Details:
Date: ${appointment.date}
Time: ${appointment.time}

Medical Issue: ${appointment.userInfo?.problem || 'N/A'}

Important: Please bring this verification code and a valid ID to your appointment. Arrive 10 minutes early for check-in.

For support, contact: support@smarthealth.com
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

📅 *Date:* ${appointment.date}
🕐 *Time:* ${appointment.time}

💰 *Consultation Fee:* ₹${appointment.doctorInfo?.feesPerConsultation}

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
        <div ref={receiptRef} className="p-12 bg-white" data-receipt-container="true">
            {/* Header */}
            <div className="text-center mb-12 pb-8 border-b-2 border-slate-100">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="bg-primary p-3 rounded-xl shadow-lg shadow-primary/20">
                        <FiActivity className="text-white text-3xl" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                        Smart<span className="text-primary">Health</span>
                    </h1>
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter italic uppercase mb-2">
                    Appointment Receipt
                </h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                    Confirmation & Verification Document
                </p>
            </div>

            {/* Verification Code - Prominent Display */}
            <div className="bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-3xl p-8 mb-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <p className="text-white/60 font-black uppercase tracking-[0.3em] text-[10px] mb-3 relative z-10">
                    Verification Code
                </p>
                <h3 className="text-white text-6xl font-black italic tracking-tighter uppercase mb-3 relative z-10">
                    {appointment.appointmentCode}
                </h3>
                <div className="flex items-center justify-center gap-2 text-white/80 relative z-10">
                    <FiCheckCircle className="text-xl" />
                    <p className="text-sm font-bold uppercase tracking-widest">
                        Booking Confirmed
                    </p>
                </div>

                {/* QR Code Section - Moved to Top */}
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
                        <QRCodeCanvas
                            value={`
Patient: ${appointment.userInfo?.name}
Age/Gender: ${appointment.userInfo?.age}/${appointment.userInfo?.gender}
Doctor: ${appointment.doctorInfo?.name?.toLowerCase().startsWith('dr') ? appointment.doctorInfo?.name : `Dr. ${appointment.doctorInfo?.name}`} (${appointment.doctorInfo?.specialization})
Date/Time: ${appointment.date} at ${appointment.time}
Code: ${appointment.appointmentCode}
Medical Issue: ${appointment.userInfo?.problem || 'N/A'}
                                `.trim()}
                            size={128}
                            level={"H"}
                            includeMargin={true}
                        />
                    </div>
                    <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scan for details</p>
                </div>
            </div>

            {/* Patient Information */}
            <div className="mb-8">
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
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mobile Number</p>
                            <p className="text-sm font-bold text-slate-800">{appointment.userInfo?.mobileNumber || 'N/A'}</p>
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
            <div className="mb-8">
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

            {/* Service Details */}
            {appointment.selectedServices && appointment.selectedServices.length > 0 && (
                <div className="mb-8">
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
            <div className="mb-8">
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
                <div className="mb-8">
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
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-8">
                <p className="text-xs font-bold text-amber-800 leading-relaxed">
                    <strong className="uppercase tracking-widest">Important:</strong> Please bring this verification code and a valid ID to your appointment. Arrive 10 minutes early for check-in.
                </p>
            </div>

            {/* Footer */}
            <div className="text-center pt-6 border-t-2 border-slate-100">
                <p className="text-slate-400 text-xs font-bold">
                    © 2024 Smart Health Assistant. All Rights Reserved.
                </p>
                <p className="text-slate-300 text-[10px] font-medium mt-1">
                    For support, contact: support@smarthealth.com
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
                className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto"
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
                <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col gap-6">
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
