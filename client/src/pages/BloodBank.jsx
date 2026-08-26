import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Form, Input, Select, DatePicker, message, Table, Tag, Modal } from 'antd';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../redux/features/alertSlice';
import { FiPlus, FiDroplet } from 'react-icons/fi';import moment from 'moment';

const BloodBank = () => {
    const { user } = useSelector(state => state.user);
    const [requests, setRequests] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const dispatch = useDispatch();

    const getRequests = async () => {
        try {
            setTableLoading(true);
            const res = await axios.get('/api/v1/user/get-blood-requests', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setTableLoading(false);
            if (res.data.success) {
                setRequests(res.data.data);
            }
        } catch (error) {
            setTableLoading(false);
            console.log(error);
            message.error('Error fetching requests');
        }
    };

    useEffect(() => {
        getRequests();
    }, []);

    const onFinish = async (values) => {
        try {
            dispatch(showLoading());
            const finalValues = {
                ...values,
                userId: user._id,
                neededBy: values.neededBy.toISOString()
            };
            const res = await axios.post('/api/v1/user/request-blood', finalValues, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            dispatch(hideLoading());
            if (res.data.success) {
                message.success(res.data.message);
                setIsModalOpen(false);
                getRequests();
            }
        } catch (error) {
            dispatch(hideLoading());
            console.log(error);
            message.error('Something went wrong');
        }
    };

    const columns = [
        {
            title: 'Patient',
            dataIndex: 'patientName',
            render: (text, record) => (
                <div className="flex flex-col">
                    <span className="font-black italic uppercase text-slate-800">{record.patientName}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{record.contactNumber}</span>
                </div>
            )
        },
        {
            title: 'Blood Group',
            dataIndex: 'bloodGroup',
            render: (text) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 font-black">
                        {text}
                    </div>
                </div>
            )
        },
        {
            title: 'Units',
            dataIndex: 'units',
            render: (text) => <span className="font-black italic text-slate-700">{text} Units</span>
        },
        {
            title: 'Hospital & Location',
            dataIndex: 'hospitalName',
            render: (text, record) => (
                <div className="flex flex-col">
                    <span className="text-xs font-black uppercase text-slate-700 italic">{record.hospitalName}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{record.address}</span>
                </div>
            )
        },
        {
            title: 'Needed By',
            dataIndex: 'neededBy',
            render: (text) => (
                <span className="text-xs font-bold text-slate-500 italic uppercase">
                    {moment(text).format('DD MMM YYYY, HH:mm')}
                </span>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => (
                <Tag color={status === 'pending' ? 'gold' : status === 'approved' ? 'cyan' : status === 'fulfilled' ? 'green' : 'red'} className="border-none rounded-full px-4 font-black uppercase italic text-[10px]">
                    {status}
                </Tag>
            )
        }
    ];

    return (
        <Layout>
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase leading-none mb-2 flex items-center gap-4">
                            <FiDroplet className="text-red-500" /> Blood Bank.
                        </h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Request life-saving blood groups instantly</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-4 bg-red-500 text-white rounded-2xl font-black italic tracking-tight hover:bg-red-600 transition-all flex items-center gap-3 shadow-xl shadow-red-500/20 uppercase text-xs"
                    >
                        <FiPlus className="text-xl" /> New Blood Request
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {['A+', 'B+', 'O+', 'AB+'].map((group, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 text-xl font-black">
                                    {group}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Stock Status</p>
                                    <p className="text-slate-800 font-black italic uppercase">Available</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Your Recent Requests</h2>
                    <Table
                        columns={columns}
                        dataSource={requests}
                        pagination={{ pageSize: 5 }}
                        rowKey="_id"
                        className="custom-table"
                        loading={tableLoading}
                    />
                </div>

                {/* New Request Modal */}
                <Modal
                    title={<span className="text-2xl font-black italic uppercase tracking-tight text-slate-800">Create Request</span>}
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    footer={null}
                    centered
                    width={700}
                    className="blood-modal"
                >
                    <Form layout="vertical" onFinish={onFinish} className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <Form.Item label="Patient Name" name="patientName" rules={[{ required: true }]}>
                                <Input placeholder="Full Legal Name" className="h-14 rounded-2xl bg-slate-50 border-none font-bold px-6" />
                            </Form.Item>
                            <Form.Item label="Blood Group" name="bloodGroup" rules={[{ required: true }]}>
                                <Select placeholder="Select Group" className="h-14 blood-select">
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                                        <Select.Option key={g} value={g}>{g}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item label="Units Required" name="units" rules={[{ required: true }]}>
                                <Input type="number" min={1} placeholder="Number of units" className="h-14 rounded-2xl bg-slate-50 border-none font-bold px-6" />
                            </Form.Item>
                            <Form.Item label="Phone Number" name="contactNumber" rules={[{ required: true }]}>
                                <Input placeholder="Contact number" className="h-14 rounded-2xl bg-slate-50 border-none font-bold px-6" />
                            </Form.Item>
                            <Form.Item label="Hospital Name" name="hospitalName" rules={[{ required: true }]}>
                                <Input placeholder="Hospital/Clinic Name" className="h-14 rounded-2xl bg-slate-50 border-none font-bold px-6" />
                            </Form.Item>
                            <Form.Item label="Needed By" name="neededBy" rules={[{ required: true }]}>
                                <DatePicker showTime className="h-14 w-full rounded-2xl bg-slate-50 border-none px-6 font-bold" />
                            </Form.Item>
                        </div>
                        <Form.Item label="Hospital Address" name="address" rules={[{ required: true }]}>
                            <Input.TextArea placeholder="Complete location for delivery" className="bg-slate-50 border-none rounded-2xl p-6 font-bold" rows={3} />
                        </Form.Item>
                        <Form.Item label="Reason / Notes" name="reason">
                            <Input.TextArea placeholder="Any specific medical notes..." className="bg-slate-50 border-none rounded-2xl p-6 font-bold" rows={2} />
                        </Form.Item>

                        <div className="flex gap-4 pt-6">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 h-16 rounded-2xl font-black uppercase tracking-widest italic text-slate-400 hover:bg-slate-50 transition-all text-[10px]">Cancel</button>
                            <button type="submit" className="flex-1 h-16 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest italic shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-3">
                                Submit Request <FiDroplet />
                            </button>
                        </div>
                    </Form>
                </Modal>
            </div>

            <style>{`
                .blood-select .ant-select-selector {
                    height: 56px !important;
                    border-radius: 1rem !important;
                    background: #f8fafc !important;
                    border: none !important;
                    padding: 0 24px !important;
                    display: flex;
                    align-items: center;
                }
                .blood-select span {
                    font-weight: 700 !important;
                }
            `}</style>
        </Layout>
    );
};

export default BloodBank;
