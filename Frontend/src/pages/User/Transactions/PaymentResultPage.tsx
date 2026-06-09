import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Home,
  RefreshCcw,
  Loader2,
  ChevronRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import apiClient from '@/services/apiClient';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'failed' | 'pending' | 'error'>('pending');
  const [orderData, setOrderData] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState(3);

  // Option A: backend redirect params (?payment=success&orderId=xxx)
  const backendPaymentStatus = searchParams.get('payment');

  // Extract common parameters (MoMo / ZaloPay direct callbacks)
  const vnpResponseCode = searchParams.get('vnp_ResponseCode');
  const momoResultCode = searchParams.get('resultCode');
  const zpStatus = searchParams.get('status');

  const orderId = useMemo(() => {
    return searchParams.get('vnp_TxnRef') ||
      searchParams.get('orderId') ||
      searchParams.get('order_id') ||
      searchParams.get('apptransid')?.split('_')[1];
  }, [searchParams]);

  const amount = useMemo(() => {
    const vnpAmount = searchParams.get('vnp_Amount');
    if (vnpAmount) return parseInt(vnpAmount) / 100;
    return searchParams.get('amount');
  }, [searchParams]);

  const paymentMethod = useMemo(() => {
    if (backendPaymentStatus) return 'VNPAY';
    if (vnpResponseCode !== null) return 'VNPAY';
    if (momoResultCode !== null) return 'MOMO';
    if (zpStatus !== null) return 'ZALOPAY';
    return 'UNKNOWN';
  }, [backendPaymentStatus, vnpResponseCode, momoResultCode, zpStatus]);

  useEffect(() => {
    const verifyPayment = async () => {
      // Option A: backend already verified VNPay — trust the redirect params
      if (backendPaymentStatus) {
        setStatus(backendPaymentStatus === 'success' ? 'success' : 'failed');
        if (backendPaymentStatus === 'success' && orderId) {
          try {
            const order = await apiClient.orders.getById(orderId);
            setOrderData(order);
          } catch (_) { /* non-critical */ }
        }
        setLoading(false);
        return;
      }

      if (!orderId) {
        setStatus('error');
        setLoading(false);
        return;
      }

      const storedRetry = sessionStorage.getItem(`retry_count_${orderId}`);
      if (storedRetry) setRetryCount(parseInt(storedRetry));

      try {
        setLoading(true);

        let isSuccess = false;
        if (momoResultCode === '0') isSuccess = true;
        else if (zpStatus === '1') isSuccess = true;
        else if (vnpResponseCode === '00') isSuccess = true;

        try {
          const order = await apiClient.orders.getById(orderId);
          setOrderData(order);
          if (order.status === 'SUCCESS' || order.status === 'ACCEPTED') {
            setStatus('success');
          } else if (order.status === 'FAILED' || order.status === 'CANCELLED') {
            setStatus('failed');
          } else {
            setStatus(isSuccess ? 'success' : 'failed');
          }
        } catch (e) {
          console.warn('Could not fetch order details', e);
          setStatus(isSuccess ? 'success' : 'failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [backendPaymentStatus, orderId, vnpResponseCode, momoResultCode, zpStatus, searchParams]);

  // Auto-redirect to transactions list after success
  useEffect(() => {
    if (status !== 'success') return;
    if (countdown <= 0) {
      navigate('/user/transactions');
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown, navigate]);

  const handleRetry = async () => {
    if (retryCount >= 3) {
      toast.error('Bạn đã thử lại quá 3 lần. Vui lòng tạo đơn hàng mới.');
      return;
    }

    const nextRetry = retryCount + 1;
    setRetryCount(nextRetry);
    sessionStorage.setItem(`retry_count_${orderId}`, nextRetry.toString());

    const loadingToast = toast.loading('Đang khởi tạo lại thanh toán...');
    try {
      let response: any;
      const finalAmount = amount || orderData?.finalPrice || orderData?.totalPrice;

      if (paymentMethod === 'VNPAY') {
        response = await apiClient.payments.vnpay.createPaymentV2(finalAmount, orderId!);
      } else if (paymentMethod === 'MOMO') {
        response = await apiClient.payments.momo.createOrder(finalAmount, orderId!.toString());
      } else if (paymentMethod === 'ZALOPAY') {
        response = await apiClient.payments.zalopay.createOrder(
          currentUser?.user?.name || 'User',
          finalAmount,
          orderId!
        );
      }

      toast.dismiss(loadingToast);
      const payUrl = response?.paymentUrl || response?.order_url || response?.payUrl || response;
      if (typeof payUrl === 'string' && payUrl.startsWith('http')) {
        window.location.href = payUrl;
      } else {
        toast.error('Không tìm thấy link thanh toán mới.');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Lỗi khi thử lại thanh toán.');
    }
  };

  const formatVND = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Đang xác thực giao dịch...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-orange-100/50 overflow-hidden border border-gray-100"
      >
        {/* Header Visual */}
        <div className={`py-12 flex flex-col items-center justify-center relative overflow-hidden ${status === 'success' ? 'bg-emerald-50' : status === 'failed' ? 'bg-rose-50' : 'bg-amber-50'
          }`}>
          {/* Decorative Circles */}
          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-40 h-40 rounded-full bg-white/20 blur-2xl" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
          >
            {status === 'success' ? (
              <div className="bg-emerald-500 p-5 rounded-full shadow-lg shadow-emerald-200">
                <CheckCircle2 className="w-16 h-16 text-white" />
              </div>
            ) : status === 'failed' ? (
              <div className="bg-rose-500 p-5 rounded-full shadow-lg shadow-rose-200">
                <XCircle className="w-16 h-16 text-white" />
              </div>
            ) : (
              <div className="bg-amber-500 p-5 rounded-full shadow-lg shadow-amber-200">
                <AlertCircle className="w-16 h-16 text-white" />
              </div>
            )}
          </motion.div>

          <h1 className="text-2xl font-black text-gray-900 mt-6 tracking-tight">
            {status === 'success' ? 'Thanh toán thành công!' :
              status === 'failed' ? 'Thanh toán thất bại' :
                'Có lỗi xảy ra'}
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-2 px-8 text-center">
            {status === 'success'
              ? 'Tuyệt vời! Giao dịch của bạn đã được xác nhận.'
              : status === 'failed'
                ? 'Rất tiếc, giao dịch không thể hoàn tất.'
                : 'Chúng tôi không tìm thấy thông tin giao dịch này.'}
          </p>
        </div>

        {/* Details Section */}
        <div className="p-8">
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Mã đơn hàng</span>
              <span className="text-gray-900 font-black font-mono">#{orderId || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Số tiền</span>
              <span className="text-gray-900 font-black text-lg">
                {amount ? formatVND(Number(amount)) : orderData?.finalPrice ? formatVND(orderData.finalPrice) : 'Liên hệ'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Phương thức</span>
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 p-1.5 rounded-lg">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-gray-900 font-bold">{paymentMethod}</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Thời gian</span>
              <span className="text-gray-900 font-medium">
                {new Date().toLocaleTimeString('vi-VN')} {new Date().toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>

          {/* Security Banner */}
          <div className="bg-blue-50/50 rounded-2xl p-4 flex items-start gap-3 mb-8 border border-blue-100/50">
            <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
              Giao dịch của bạn được bảo mật bởi tiêu chuẩn quốc tế. Mọi thắc mắc vui lòng liên hệ hotline 1900 xxxx để được hỗ trợ 24/7.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {status === 'success' ? (
              <button
                onClick={() => navigate('/user/transactions')}
                className="w-full py-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-xl shadow-emerald-100 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
              >
                XEM GIAO DỊCH CỦA TÔI
                <span className="ml-2 bg-emerald-700 text-xs px-2 py-0.5 rounded-full">{countdown}s</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            ) : status === 'failed' ? (
              <button
                onClick={handleRetry}
                disabled={retryCount >= 3}
                className="w-full py-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black shadow-xl shadow-orange-100 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center"
              >
                {retryCount >= 3 ? 'ĐÃ HẾT LƯỢT THỬ' : `THỬ THANH TOÁN LẠI (${retryCount}/3)`}
                <RefreshCcw className={`w-5 h-5 ml-2 ${retryCount < 3 ? 'animate-spin' : ''}`} />
              </button>
            ) : null}

            <button
              onClick={() => navigate('/')}
              className="w-full py-6 rounded-2xl border border-gray-100 text-gray-500 font-bold hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center"
            >
              VỀ TRANG CHỦ <Home className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>

        {/* Footer Support */}
        <div className="px-8 pb-8 flex flex-col items-center">
          <div className="w-8 h-1 bg-gray-100 rounded-full mb-4" />
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
            Hỗ trợ khách hàng <ChevronRight className="w-3 h-3" />
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentResultPage;
