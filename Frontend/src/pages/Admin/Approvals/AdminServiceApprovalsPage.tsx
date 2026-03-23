import React, { useState } from 'react';
import {
    CheckSquare,
    XSquare,
    ArrowRight,
    AlertCircle,
    Search,
    Eye
} from 'lucide-react';

// Types
type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface ServiceUpdateReq {
    id: string;
    providerId: string;
    providerName: string;
    serviceName: string;
    serviceType: 'hotel' | 'tour' | 'place';
    status: ApprovalStatus;
    submittedAt: string;
    changes: {
        field: string;
        oldValue: string;
        newValue: string;
    }[];
}

// Mock Data
const mockRequests: ServiceUpdateReq[] = [
    {
        id: 'REQ-001',
        providerId: 'P102',
        providerName: 'Khách sạn Majestic',
        serviceName: 'Majestic Saigon Hotel',
        serviceType: 'hotel',
        status: 'pending',
        submittedAt: '2026-03-09T14:30:00Z',
        changes: [
            { field: 'Mô tả', oldValue: 'Khách sạn 4 sao tại trung tâm thành phố...', newValue: 'Khách sạn 5 sao cao cấp tại trung tâm thành phố, mới nâng cấp...' },
            { field: 'Số điện thoại', oldValue: '0901234567', newValue: '0901234588' },
            { field: 'Tiện ích', oldValue: 'Hồ bơi, Wifi miễn phí', newValue: 'Hồ bơi, Wifi miễn phí, Spa, Gym' }
        ]
    },
    {
        id: 'REQ-002',
        providerId: 'P105',
        providerName: 'Hà Nội Tours',
        serviceName: 'Tour Vịnh Hạ Long 2N1Đ',
        serviceType: 'tour',
        status: 'pending',
        submittedAt: '2026-03-10T08:15:00Z',
        changes: [
            { field: 'Giá cơ bản', oldValue: '2,500,000 đ', newValue: '2,800,000 đ' },
            { field: 'Lịch trình', oldValue: 'Ngày 1: Hà Nội - Tuần Châu...', newValue: 'Ngày 1: Hà Nội - Tuần Châu (Đón bằng xe Limousine)...' }
        ]
    },
    {
        id: 'REQ-003',
        providerId: 'P111',
        providerName: 'Vinpearl JSC',
        serviceName: 'Vinpearl Resort Nha Trang',
        serviceType: 'hotel',
        status: 'approved',
        submittedAt: '2026-03-08T10:00:00Z',
        changes: [
            { field: 'Địa chỉ', oldValue: 'Đảo Hòn Tre', newValue: 'Đảo Hòn Tre, phường Vĩnh Nguyên, Nha Trang' }
        ]
    }
];

export const AdminServiceApprovalsPage: React.FC = () => {
    const [requests, setRequests] = useState<ServiceUpdateReq[]>(mockRequests);
    const [selectedReq, setSelectedReq] = useState<ServiceUpdateReq | null>(null);
    const [filterStatus, setFilterStatus] = useState<ApprovalStatus | 'all'>('pending');

    // Modal state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const filteredRequests = requests.filter(req => filterStatus === 'all' || req.status === filterStatus);

    const handleApprove = (id: string) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
        setSelectedReq(null);
        // Toast success here ideally
    };

    const handleRejectClick = () => {
        setShowRejectModal(true);
    };

    const confirmReject = () => {
        if (selectedReq && rejectReason.trim()) {
            setRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, status: 'rejected' } : r));
            setShowRejectModal(false);
            setSelectedReq(null);
            setRejectReason('');
            // Toast notify rejection sent to provider
        }
    };

    const getStatusBadge = (status: ApprovalStatus) => {
        switch (status) {
            case 'pending': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400">Chờ duyệt</span>;
            case 'approved': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400">Đã duyệt</span>;
            case 'rejected': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400">Từ chối</span>;
        }
    };

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Duyệt thông tin Dịch vụ</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Kiểm duyệt các thay đổi thông tin do Chủ dịch vụ đề xuất trước khi hiển thị công khai.</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2">
                    {(['pending', 'approved', 'rejected', 'all'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${filterStatus === status
                                ? 'bg-blue-600 text-white dark:bg-blue-500'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            {status === 'pending' ? 'Chờ duyệt' : status === 'approved' ? 'Đã duyệt' : status === 'rejected' ? 'Đã từ chối' : 'Tất cả'}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc mã HT..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
                    />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Side: Request List */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                                    <th className="p-4 font-semibold">Mã YC</th>
                                    <th className="p-4 font-semibold">Chủ dịch vụ</th>
                                    <th className="p-4 font-semibold">Tên dịch vụ</th>
                                    <th className="p-4 font-semibold">Thời gian gửi</th>
                                    <th className="p-4 font-semibold">Trạng thái</th>
                                    <th className="p-4 font-semibold">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.length > 0 ? filteredRequests.map(req => (
                                    <tr key={req.id} className={`border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors ${selectedReq?.id === req.id ? 'bg-blue-50/80 dark:bg-gray-700' : ''}`}>
                                        <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{req.id}</td>
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{req.providerName}</td>
                                        <td className="p-4 text-sm text-gray-900 dark:text-white font-medium">{req.serviceName}</td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{new Date(req.submittedAt).toLocaleDateString()}</td>
                                        <td className="p-4">{getStatusBadge(req.status)}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => setSelectedReq(req)}
                                                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Xem xét
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            Không có yêu cầu nào phù hợp với bộ lọc.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Side: Detail Panel (Side-by-side DIFF) */}
                {selectedReq && (
                    <div className="w-full lg:w-[450px] xl:w-[500px] flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-blue-200 dark:border-gray-700 overflow-hidden flex flex-col h-[calc(100vh-250px)] sticky top-6">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-900/50 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Chi tiết yêu cầu {selectedReq.id}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedReq.serviceName} ({selectedReq.providerName})</p>
                            </div>
                            {getStatusBadge(selectedReq.status)}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-3 flex gap-3 text-sm text-yellow-800 dark:text-yellow-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 text-yellow-600 dark:text-yellow-500" />
                                <p>Nhà cung cấp yêu cầu cập nhật {selectedReq.changes.length} mục thông tin. Vui lòng đối chiếu cẩn thận trước khi phê duyệt.</p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                    <ArrowRight className="w-4 h-4 text-blue-500" />
                                    Nội dung thay đổi
                                </h4>

                                {selectedReq.changes.map((change, idx) => (
                                    <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <div className="bg-gray-100 dark:bg-gray-900 px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Trường: {change.field}
                                        </div>
                                        <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
                                            <div className="p-3 bg-red-50/30 dark:bg-red-900/10">
                                                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase mb-1 block">Hiện tại (Cũ)</span>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 line-through decoration-red-300 dark:decoration-red-500/50 decoration-2">{change.oldValue}</p>
                                            </div>
                                            <div className="p-3 bg-green-50/30 dark:bg-green-900/10">
                                                <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase mb-1 block">Đề cập xuất (Mới)</span>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium">{change.newValue}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedReq.status === 'pending' && (
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
                                <button
                                    onClick={() => handleApprove(selectedReq.id)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white py-2.5 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 shadow-sm cursor-pointer"
                                >
                                    <CheckSquare className="w-4 h-4" />
                                    Phê duyệt
                                </button>
                                <button
                                    onClick={handleRejectClick}
                                    className="flex-1 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 py-2.5 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 cursor-pointer"
                                >
                                    <XSquare className="w-4 h-4" />
                                    Từ chối
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Reject */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-transparent dark:border-gray-700">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lý do từ chối</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Thông báo này sẽ được gửi đến chủ dịch vụ.</p>
                        </div>
                        <div className="p-5">
                            <textarea
                                rows={4}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Nhập lý do chi tiết để chủ dịch vụ có thể chỉnh sửa lại (VD: Hình ảnh mờ, thông tin không hợp lệ...)"
                                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                            ></textarea>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer rounded-lg transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmReject}
                                disabled={!rejectReason.trim()}
                                className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white font-medium hover:bg-red-700 dark:hover:bg-red-600 cursor-pointer rounded-lg transition-colors disabled:opacity-50"
                            >
                                Xác nhận từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServiceApprovalsPage;
