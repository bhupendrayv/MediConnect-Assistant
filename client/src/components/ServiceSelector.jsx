import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FiVideo, FiUser, FiActivity, FiRefreshCw, FiDroplet, FiCheckCircle, FiEdit2, FiX, FiCheck } from 'react-icons/fi';

const icons = {
    FiVideo: <FiVideo />,
    FiUser: <FiUser />,
    FiActivity: <FiActivity />,
    FiRefreshCw: <FiRefreshCw />,
    FiDroplet: <FiDroplet />
};

const ServiceSelector = ({ services, selectedServices, onToggleService, onUpdateService }) => {
    const { user } = useSelector(state => state.user || {});
    const isAdmin = Boolean(user?.role === 'admin' || user?.isAdmin);

    const [editingId, setEditingId] = useState(null);
    const [editPrice, setEditPrice] = useState('');

    const startEdit = (e, service) => {
        if (!isAdmin) return; // Strict admin only
        e.stopPropagation(); // Prevent card selection
        setEditingId(service.id);
        setEditPrice(service.price);
    };

    const saveEdit = (e, service) => {
        e.stopPropagation();
        if (isAdmin && onUpdateService && !isNaN(editPrice)) {
            onUpdateService(service.id, editPrice);
        }
        setEditingId(null);
    };

    const cancelEdit = (e) => {
        e.stopPropagation();
        setEditingId(null);
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {services.map(service => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                const isEditing = isAdmin && editingId === service.id;

                return (
                    <div
                        key={service.id}
                        onClick={() => !isEditing && onToggleService(service)}
                        className={`p-3 rounded-xl border cursor-pointer relative transition-all ${
                            isSelected
                                ? 'border-emerald-500 bg-emerald-50/80'
                                : 'border-slate-100 bg-white hover:border-emerald-300'
                        }`}
                    >
                        {isSelected && !isEditing && (
                            <div className="absolute top-2 right-2 text-emerald-600">
                                <FiCheckCircle className="text-sm" />
                            </div>
                        )}

                        <div className="flex items-center gap-2 mb-1.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                                isSelected
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-50 text-slate-400'
                            }`}>
                                {icons[service.icon]}
                            </div>
                            <h4 className={`text-sm leading-tight ${
                                isSelected ? 'text-slate-900' : 'text-slate-700'
                            }`}>
                                {service.name}
                            </h4>
                        </div>

                        <p className="text-[10px] text-slate-400 leading-snug mb-2 line-clamp-2">
                            {service.description}
                        </p>

                        <div className="flex items-center justify-between">
                            {isEditing ? (
                                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                    <span className="text-slate-700 text-xs">₹</span>
                                    <input
                                        type="number"
                                        autoFocus
                                        value={editPrice}
                                        onChange={(e) => setEditPrice(e.target.value)}
                                        className="w-14 bg-slate-100 rounded px-1 py-0.5 text-xs text-slate-800 outline-none"
                                    />
                                    <button onClick={(e) => saveEdit(e, service)} className="p-1 bg-emerald-100 text-emerald-700 rounded"><FiCheck size={10} /></button>
                                    <button onClick={cancelEdit} className="p-1 bg-red-100 text-red-600 rounded"><FiX size={10} /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1">
                                    <span className="text-slate-900 text-sm">
                                        ₹{service.price}
                                    </span>
                                    {isAdmin && onUpdateService && (
                                        <button
                                            onClick={(e) => startEdit(e, service)}
                                            className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-emerald-600 hover:text-white transition-all"
                                            title="Admin: Edit Fee"
                                        >
                                            <FiEdit2 size={9} />
                                        </button>
                                    )}
                                </div>
                            )}

                            <span className="text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full border border-slate-100">
                                {service.duration}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ServiceSelector;
