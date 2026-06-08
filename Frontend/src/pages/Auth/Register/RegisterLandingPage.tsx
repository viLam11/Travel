import { useNavigate } from 'react-router-dom';
import { User, Briefcase } from 'lucide-react';

export default function RegisterLandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Tạo tài khoản</h1>
                    <p className="text-sm text-gray-500">Bạn muốn đăng ký với tư cách gì?</p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/register/customer')}
                        className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-colors text-left group"
                    >
                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                            <User className="w-5 h-5 text-gray-500 group-hover:text-orange-600 transition-colors" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Khách hàng</p>
                            <p className="text-xs text-gray-500 mt-0.5">Đặt phòng, tour, vé tham quan</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/register/provider')}
                        className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-colors text-left group"
                    >
                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                            <Briefcase className="w-5 h-5 text-gray-500 group-hover:text-orange-600 transition-colors" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Đối tác dịch vụ</p>
                            <p className="text-xs text-gray-500 mt-0.5">Kinh doanh khách sạn, tour, vé hoạt động</p>
                        </div>
                    </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Đã có tài khoản?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="text-orange-500 hover:text-orange-600 font-medium"
                    >
                        Đăng nhập
                    </button>
                </p>
            </div>
        </div>
    );
}
