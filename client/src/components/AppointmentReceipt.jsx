import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';
import { 
    FiActivity, FiCalendar, FiClock, FiUser, FiMail, FiMapPin, 
    FiDownload, FiPrinter, FiShare2, FiSend, FiCheckCircle, 
    FiPhone, FiCreditCard, FiShield, FiFileText, FiX 
} from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { message } from 'antd';
import html2canvas from 'html2canvas';

const AppointmentReceipt = ({ appointment, onClose, autoDownload = false, silent = false }) => {
    const receiptRef = useRef(null);

    // Auto-trigger download if requested
    React.useEffect(() => {
        if (autoDownload || silent) {
            const timer = setTimeout(() => {
                handleDownload();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [appointment, autoDownload, silent]);

    // Native browser print dialog (uses @media print)
    const handlePrint = () => {
        window.print();
    };

    // Download receipt as standard single-page A4 PDF
    const handleDownload = async () => {
        if (appointment.paymentStatus === 'pending_cash') {
            message.warning({ content: 'Receipt download will be available once cash payment is received and confirmed at the clinic counter.', key: 'download', duration: 4 });
            return;
        }

        try {
            message.loading({ content: 'Generating compact A4 PDF...', key: 'download' });

            if (!receiptRef.current) {
                throw new Error('Receipt reference not found');
            }

            // Small delay to ensure QR canvas is completely rendered
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(receiptRef.current, {
                scale: 2, // High resolution crisp text
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                allowTaint: false,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 794, // 210mm at 96dpi
            });

            const imgData = canvas.toDataURL('image/png', 1.0);

            // A4 dimensions in mm
            const pdfWidth = 210;
            const pdfHeight = 297;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            // Single page fitting
            if (imgHeight <= pdfHeight) {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight, undefined, 'FAST');
            } else {
                const scaledWidth = (canvas.width * pdfHeight) / canvas.height;
                const xOffset = (pdfWidth - scaledWidth) / 2;
                pdf.addImage(imgData, 'PNG', Math.max(0, xOffset), 0, Math.min(pdfWidth, scaledWidth), pdfHeight, undefined, 'FAST');
            }

            const fileName = `SmartHealth-Receipt-${appointment.appointmentCode || 'receipt'}.pdf`;
            pdf.save(fileName);

            const blob = pdf.output('blob');
            const blobURL = URL.createObjectURL(blob);
            window.open(blobURL, '_blank');

            message.success({ content: 'Receipt downloaded & opened!', key: 'download' });

            if (silent && onClose) {
                setTimeout(onClose, 1500);
            }
        } catch (error) {
            console.error('PDF Generation Error:', error);
            message.error({ content: 'Failed to generate PDF. You can also use the Print button.', key: 'download' });
            if (silent && onClose) onClose();
        }
    };

    const shareText = `
🏥 Smart Health Assistant - Appointment Receipt
✅ Verification Code: ${appointment.appointmentCode}
👤 Patient: ${appointment.userInfo?.name}
👨‍⚕️ Doctor: ${appointment.doctorInfo?.name?.toLowerCase().startsWith('dr') ? appointment.doctorInfo?.name : `Dr. ${appointment.doctorInfo?.name}`}
🩺 Specialization: ${appointment.doctorInfo?.specialization}
📅 Date: ${appointment.date} | 🕐 Time: ${appointment.time}
💰 Amount: ₹${appointment.totalAmount || appointment.doctorInfo?.feesPerConsultation}
💳 Status: ${(appointment.paymentStatus || 'Pending').toUpperCase()}
    `.trim();

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        message.success('Receipt details copied to clipboard!');
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Appointment Receipt',
                    text: shareText,
                });
            } catch (err) {
                if (err.name !== 'AbortError') copyToClipboard(shareText);
            }
        } else {
            copyToClipboard(shareText);
        }
    };

    const handleWhatsAppShare = () => {
        const text = encodeURIComponent(shareText);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const handleSendEmail = () => {
        const subject = encodeURIComponent(`Appointment Receipt - ${appointment.appointmentCode}`);
        const body = encodeURIComponent(shareText);
        window.open(`mailto:${appointment.userInfo?.email || ''}?subject=${subject}&body=${body}`, '_blank');
    };

    const handleTelegramShare = () => {
        const text = encodeURIComponent(shareText);
        window.open(`https://t.me/share/url?url=${window.location.origin}&text=${text}`, '_blank');
    };

    const docName = appointment.doctorInfo?.name?.toLowerCase().startsWith('dr') 
        ? appointment.doctorInfo?.name 
        : `Dr. ${appointment.doctorInfo?.name || 'Specialist'}`;
    const totalAmountVal = appointment.totalAmount || appointment.doctorInfo?.feesPerConsultation || 500;
    const isPaid = (appointment.paymentStatus || '').toLowerCase() === 'paid';
    const isApproved = (appointment.status || '').toLowerCase() === 'approved' || (appointment.status || '').toLowerCase() === 'completed';

    // Core Printable Receipt Component
    const receiptContent = (
        <div 
            ref={receiptRef}
            id="receipt-print-area"
            className="receipt-print-wrapper bg-white text-slate-800 p-6 md:p-8 max-w-[794px] mx-auto text-xs border border-slate-200 rounded-2xl shadow-sm"
            style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
            }}
        >
            {/* Header: Logo, Title & QR Code */}
            <div className="flex items-start justify-between pb-4 mb-4 border-b border-slate-200 page-break-avoid">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-xl flex-shrink-0 shadow-sm">
                        <FiActivity />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                                Smart<span className="text-emerald-600">Health</span>
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Verified Receipt
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                            Official Consultation & Verification Document
                        </p>
                    </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center flex-shrink-0">
                    <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                        <QRCodeCanvas
                            value={`Code:${appointment.appointmentCode}|Patient:${appointment.userInfo?.name || 'N/A'}|Doctor:${docName}|Date:${appointment.date}|Time:${appointment.time}|Amt:${totalAmountVal}|Status:${isPaid ? 'PAID' : 'PENDING'}`}
                            size={72}
                            level="M"
                            includeMargin={false}
                        />
                    </div>
                    <span className="text-[8px] font-mono font-bold text-slate-400 mt-1 uppercase tracking-wider">
                        Scan to verify
                    </span>
                </div>
            </div>

            {/* Compact Header Strip: Verification Code + Status Badges */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 flex items-center justify-between flex-wrap gap-2 page-break-avoid">
                <div className="flex items-center gap-3">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block leading-none">
                            Verification Code
                        </span>
                        <span className="text-xl font-black font-mono tracking-widest text-emerald-600 leading-tight">
                            {appointment.appointmentCode}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Payment Badge */}
                    <span 
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                            isPaid 
                                ? 'bg-emerald-500 text-white border-emerald-600' 
                                : 'bg-amber-500 text-white border-amber-600'
                        }`}
                        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                    >
                        {isPaid ? '✓ Paid' : 'Pending Payment'}
                    </span>

                    {/* Doctor Status Badge */}
                    <span 
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                            isApproved
                                ? 'bg-teal-50 text-teal-800 border-teal-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                    >
                        {isApproved ? 'Approved by Doctor' : 'Doctor Pending'}
                    </span>
                </div>
            </div>

            {/* 2-Column Info Grid: Patient Info & Doctor Info */}
            <div className="grid grid-cols-2 gap-3 mb-3 page-break-avoid">
                {/* Block 1: Patient Details */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100 text-slate-900 font-black uppercase text-[10px] tracking-wider">
                        <FiUser className="text-emerald-600" /> Patient Information
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-[11px]">
                        <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                            <span className="font-bold text-slate-800 truncate block">{appointment.userInfo?.name || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Mobile / Phone</span>
                            <span className="font-bold text-slate-800 font-mono block">{appointment.userInfo?.mobileNumber || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Age & Gender</span>
                            <span className="font-bold text-slate-800 block">
                                {appointment.userInfo?.age ? `${appointment.userInfo?.age} yrs` : 'N/A'} • {appointment.userInfo?.gender || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Address</span>
                            <span className="font-bold text-slate-800 truncate block">{appointment.userInfo?.address || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Block 2: Doctor Details */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100 text-slate-900 font-black uppercase text-[10px] tracking-wider">
                        <FiShield className="text-emerald-600" /> Specialist Information
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-[11px]">
                        <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Specialist Name</span>
                            <span className="font-bold text-slate-800 truncate block">{docName}</span>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Department / Spec</span>
                            <span className="font-bold text-slate-800 truncate block">{appointment.doctorInfo?.specialization || 'General Healthcare'}</span>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Consultation Fee</span>
                            <span className="font-bold text-emerald-700 block">₹{appointment.doctorInfo?.feesPerConsultation || 500}</span>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Slot Schedule</span>
                            <span className="font-bold text-slate-800 block">{appointment.date} • {appointment.time}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Block 3: Services & Financial Summary (Table) */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 mb-3 page-break-avoid">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-slate-900 font-black uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                        <FiCreditCard className="text-emerald-600" /> Fee Breakdown & Selected Services
                    </span>
                    <div className="flex flex-col items-end text-[10px] font-mono text-slate-500">
                        <span>Tx ID: <strong className="text-slate-700">{appointment.transactionId || 'N/A'}</strong></span>
                        <span>Method: <strong className="text-slate-700">{appointment.paymentMethod === 'cash' ? 'Cash' : 'Online'}</strong></span>
                    </div>
                </div>

                <table className="w-full text-[11px] mb-2 border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 text-[9px] font-black uppercase tracking-wider text-slate-400">
                            <th className="text-left pb-1 font-bold">Description</th>
                            <th className="text-center pb-1 font-bold">Category</th>
                            <th className="text-right pb-1 font-bold">Amount (INR)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr>
                            <td className="py-1.5 font-medium text-slate-800">Specialist Consultation ({docName})</td>
                            <td className="py-1.5 text-center text-slate-500 text-[10px]">Medical Visit</td>
                            <td className="py-1.5 text-right font-bold text-slate-800 font-mono">₹{appointment.doctorInfo?.feesPerConsultation || 500}</td>
                        </tr>
                        {appointment.selectedServices && appointment.selectedServices.map((svc, i) => (
                            <tr key={i}>
                                <td className="py-1.5 font-medium text-slate-800">{svc.name || svc}</td>
                                <td className="py-1.5 text-center text-slate-500 text-[10px]">Clinical Service</td>
                                <td className="py-1.5 text-right font-bold text-slate-800 font-mono">₹{svc.price || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-between items-center pt-2 border-t-2 border-slate-200 font-bold">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black">
                        Total Amount Paid / Payable
                    </span>
                    <span className="text-base font-black text-emerald-600 font-mono">
                        ₹{totalAmountVal}
                    </span>
                </div>
                
                {appointment.approvedBy && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 text-[10px]">
                        <span className="uppercase tracking-widest text-slate-400 font-bold">
                            Payment Verified By
                        </span>
                        <span className="font-bold text-slate-800">
                            {appointment.approvedBy} {appointment.paidAt && `on ${new Date(appointment.paidAt).toLocaleDateString()}`}
                        </span>
                    </div>
                )}
            </div>

            {/* Block 4: Medical Problem or Clinical Notes */}
            {(appointment.userInfo?.problem || appointment.doctorNotes || appointment.prescription) && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3 text-[11px] page-break-avoid">
                    {appointment.userInfo?.problem && (
                        <div className="mb-1.5 last:mb-0">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Reported Symptoms / Concern:</span>
                            <p className="font-medium text-slate-700 italic mt-0.5">{appointment.userInfo?.problem}</p>
                        </div>
                    )}
                    {appointment.doctorNotes && (
                        <div className="mb-1.5 last:mb-0 border-t border-slate-200 pt-1.5">
                            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 block">Specialist Clinical Notes:</span>
                            <p className="font-medium text-slate-800 mt-0.5">{appointment.doctorNotes}</p>
                        </div>
                    )}
                    {appointment.prescription && (
                        <div className="border-t border-slate-200 pt-1.5">
                            <span className="text-[9px] font-black uppercase tracking-wider text-teal-700 block">Prescribed Medication / Follow-Up:</span>
                            <p className="font-medium text-slate-800 mt-0.5">{appointment.prescription}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Important Notice */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-lg px-3 py-2 mb-3 text-[10px] text-amber-900 page-break-avoid">
                <p className="leading-snug">
                    <strong className="font-black uppercase tracking-wide">Notice:</strong> Present this verification code at clinic counter upon arrival. Please carry a valid government ID and arrive 10 minutes prior to your designated slot.
                </p>
            </div>

            {/* Compact 1-Line Footer */}
            <div className="pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400 font-medium page-break-avoid">
                <span>© 2026 Smart Health Assistant</span>
                <span className="mx-2">•</span>
                <span>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
                <span className="mx-2">•</span>
                <span>Support: medi.connectofficial2026@gmail.com</span>
            </div>
        </div>
    );

    // Silent background rendering for automated downloads
    if (silent) {
        return (
            <div style={{ position: 'fixed', top: 0, left: '-9999px', width: '794px', zIndex: -9999, background: 'white' }}>
                {receiptContent}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
            {/* Print CSS injected for seamless single-page window.print() */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 8mm;
                    }
                    body {
                        background: #ffffff !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #receipt-print-area, #receipt-print-area * {
                        visibility: visible !important;
                    }
                    #receipt-print-area {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 210mm !important;
                        box-sizing: border-box !important;
                        margin: 0 auto !important;
                        padding: 6mm !important;
                        background: #ffffff !important;
                        box-shadow: none !important;
                        border: 1px solid #cbd5e1 !important;
                        border-radius: 6px !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .page-break-avoid {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                }
            ` }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Top Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0 no-print">
                    <div>
                        <h3 className="text-sm font-black uppercase italic tracking-wider text-slate-800">
                            Appointment Receipt
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Code: <strong className="text-emerald-600 font-mono">{appointment.appointmentCode}</strong>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors"
                        title="Close"
                    >
                        <FiX />
                    </button>
                </div>

                {/* Scrollable Receipt Preview */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100/60 custom-scrollbar">
                    {receiptContent}
                </div>

                {/* Bottom Action Controls */}
                <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-3 shrink-0 no-print">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDownload}
                            className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                        >
                            <FiDownload className="text-sm" />
                            Download Single-Page PDF
                        </button>
                        <button
                            onClick={handlePrint}
                            className="h-12 px-5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                            title="Direct Print or Save as PDF"
                        >
                            <FiPrinter className="text-sm" />
                            Print
                        </button>
                    </div>

                    {/* Quick Sharing Options */}
                    <div className="flex items-center justify-between px-2 pt-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            Share Receipt:
                        </span>
                        <div className="flex items-center gap-4 text-slate-400">
                            <button onClick={handleWhatsAppShare} className="hover:text-emerald-500 hover:scale-110 transition-all" title="WhatsApp">
                                <FaWhatsapp size={16} />
                            </button>
                            <button onClick={handleSendEmail} className="hover:text-blue-500 hover:scale-110 transition-all" title="Email">
                                <FiSend size={16} />
                            </button>
                            <button onClick={handleTelegramShare} className="hover:text-sky-500 hover:scale-110 transition-all" title="Telegram">
                                <FaTelegram size={16} />
                            </button>
                            <button onClick={handleShare} className="hover:text-slate-800 hover:scale-110 transition-all" title="Copy / Native Share">
                                <FiShare2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AppointmentReceipt;
