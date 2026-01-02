import React, { useState } from 'react';
import { FiVideo, FiUser, FiActivity, FiRefreshCw, FiDroplet, FiCheckCircle, FiEdit2, FiX, FiCheck } from 'react-icons/fi';

const icons = {
    FiVideo: <FiVideo />,
    FiUser: <FiUser />,
    FiActivity: <FiActivity />,
    FiRefreshCw: <FiRefreshCw />,
    FiDroplet: <FiDroplet />
};

const ServiceSelector = ({ services, selectedServices, onToggleService, onUpdateService }) => {
    const [editingId, setEditingId] = useState(null);
    const [editPrice, setEditPrice] = useState('');

    const startEdit = (e, service) => {
        e.stopPropagation(); // Prevent card selection
        setEditingId(service.id);
        setEditPrice(service.price);
    };

    const saveEdit = (e, service) => {
        e.stopPropagation();
        if (onUpdateService && !isNaN(editPrice)) {
            onUpdateService(service.id, editPrice);
        }
        setEditingId(null);
    };

    const cancelEdit = (e) => {
        e.stopPropagation();
        setEditingId(null);
    };

    return (
        <div className="grid md:grid-cols-2 gap-4">
            {services.map(service => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                const isEditing = editingId === service.id;

                return (
                    <div
                        key={service.id}
                        onClick={() => !isEditing && onToggleService(service)}
                        className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${isSelected ? 'border-primary bg-emerald-50' : 'border-slate-100 bg-white hover:border-emerald-200'}`}
                    >
                        {isSelected && !isEditing && (
                            <div className="absolute top-4 right-4 text-emerald-600">
                                <FiCheckCircle className="text-xl" />
                            </div>
                        )}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${isSelected ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'}`}>
                            {icons[service.icon]}
                        </div>
                        <h4 className={`text-lg font-black italic uppercase mb-2 ${isSelected ? 'text-slate-800' : 'text-slate-600'}`}>{service.name}</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed mb-4">{service.description}</p>

                        <div className="flex items-center justify-between mt-auto">
                            {isEditing ? (
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    <span className="font-bold text-slate-700">₹</span>
                                    <input
                                        type="number"
                                        autoFocus
                                        value={editPrice}
                                        onChange={(e) => setEditPrice(e.target.value)}
                                        className="w-20 bg-slate-100 rounded-lg px-2 py-1 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <div className="flex gap-1">
                                        <button onClick={(e) => saveEdit(e, service)} className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"><FiCheck size={14} /></button>
                                        <button onClick={cancelEdit} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><FiX size={14} /></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-700 text-lg">₹{service.price}</span>
                                    {onUpdateService && (
                                        <button
                                            onClick={(e) => startEdit(e, service)}
                                            className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            title="Edit Fee"
                                        >
                                            <FiEdit2 size={12} />
                                        </button>
                                    )}
                                </div>
                            )}
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{service.duration}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ServiceSelector;
