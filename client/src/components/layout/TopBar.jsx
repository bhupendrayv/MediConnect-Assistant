import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiPhone, FiMapPin, FiMail } from 'react-icons/fi';

const TopBar = () => {
    const [settings, setSettings] = useState({
        emergencyContact: 'Loading...',
        address: 'Loading...',
        email: 'Loading...'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/user/getPublicSiteSettings');
                if (res.data.success) {
                    setSettings(res.data.data);
                }
            } catch (error) {
                console.error('Error fetching site settings', error);
                setSettings({
                    emergencyContact: '+91 1234567890',
                    address: 'Health St, Medical District',
                    email: 'medi.connectofficial2026@gmail.com'
                });
            }
        };
        fetchSettings();
    }, []);

    const scrollContent = (
        <div className="flex items-center gap-8 whitespace-nowrap px-4">
            <div className="flex items-center gap-2 text-emerald-400">
                <FiPhone className="animate-pulse" />
                <span>Emergency: <a href={`tel:${settings.emergencyContact}`} className="font-bold hover:text-white transition-colors">{settings.emergencyContact}</a></span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
                <FiMail />
                <span>Contact: <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">{settings.email}</a></span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
                <FiMapPin />
                <span>{settings.address}</span>
            </div>
            <div className="text-xs text-emerald-400 font-black uppercase tracking-widest italic">
                24/7 Expert Medical Care Available
            </div>
        </div>
    );

    return (
        <div className="bg-slate-900 text-white py-2 text-sm font-medium z-50 relative overflow-hidden">
            <style>{`
                @keyframes scrollLeftToRight {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-scroll {
                    animation: scrollLeftToRight 60s linear infinite;
                }
            `}</style>
            <div className="flex animate-scroll">
                {scrollContent}
                {scrollContent}
                {scrollContent}
            </div>
        </div>
    );
};

export default TopBar;
