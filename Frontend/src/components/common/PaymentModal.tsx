import React from 'react';
import { X, CreditCard, Wallet, Smartphone } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPayment: (method: 'vnpay' | 'zalopay' | 'momo') => void;
    amount: number;
    orderId: string | number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSelectPayment, amount, orderId }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-orange-500 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Thanh toán đơn hàng</h2>
                        <p className="text-orange-100 text-sm mt-1">Mã đơn: #{orderId}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Amount Info */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Tổng số tiền:</span>
                        <span className="text-2xl font-black text-orange-600">{amount.toLocaleString()} VNĐ</span>
                    </div>
                </div>

                {/* Payment Options */}
                <div className="p-6 space-y-4">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Chọn phương thức thanh toán</p>
                    
                    <button 
                        onClick={() => onSelectPayment('vnpay')}
                        className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-gray-900 line-clamp-1">VNPAY</p>
                            <p className="text-xs text-gray-500">Thẻ ATM, Visa, Master, QR Code</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => onSelectPayment('zalopay')}
                        className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                            <Wallet className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-gray-900">ZaloPay</p>
                            <p className="text-xs text-gray-500">Ví điện tử ZaloPay</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => onSelectPayment('momo')}
                        className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-all group"
                    >
                        <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                            <Smartphone className="w-6 h-6 text-pink-600" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-gray-900">MoMo</p>
                            <p className="text-xs text-gray-500">Ví điện tử MoMo</p>
                        </div>
                    </button>
                </div>

                <div className="p-6 bg-gray-50 text-center text-[10px] text-gray-400">
                    <p>Bằng việc nhấn chọn phương thức thanh toán, bạn đồng ý với các điều khoản của Travello.</p>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
