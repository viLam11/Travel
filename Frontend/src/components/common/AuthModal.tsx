// src/components/common/AuthModal.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({
    isOpen,
    onClose,
    message = "Bạn cần đăng nhập để thực hiện chức năng này và trải nghiệm đầy đủ các tính năng của chúng tôi."
}) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLogin = () => {
        sessionStorage.setItem("returnUrl", window.location.pathname);
        navigate("/login");
    };

    const handleRegister = () => {
        sessionStorage.setItem("returnUrl", window.location.pathname);
        navigate("/register");
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                    Yêu cầu đăng nhập
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-center mb-8 leading-relaxed">
                    {message}
                </p>

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleLogin}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                        Đăng nhập ngay
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                        Hủy bỏ
                    </button>
                </div>

                {/* Footer note */}
                <p className="text-xs text-gray-500 text-center mt-6">
                    Chưa có tài khoản?{" "}
                    <button
                        onClick={handleRegister}
                        className="text-orange-500 hover:text-orange-600 font-semibold hover:underline"
                    >
                        Đăng ký tại đây
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthModal;
