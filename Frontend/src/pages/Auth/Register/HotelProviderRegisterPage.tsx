import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import AuthLayout from "../../../components/page/auth/AuthLayout";
import EmailInput from "../../../components/page/auth/EmailInput";
import PasswordInput from "../../../components/page/auth/PasswordInput";
import AuthButton from "../../../components/page/auth/AuthButton";
import FormInput from "../../../components/page/auth/FormInput";

interface FormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
}

interface FormErrors {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeToTerms?: string;
}

const HotelProviderRegisterPage: React.FC = () => {
    const [providerType, setProviderType] = useState<'hotel' | 'ticket'>('hotel');
    const [formData, setFormData] = useState<FormData>({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });

        if (errors[name as keyof FormErrors]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = "Tên đăng nhập là bắt buộc";
        } else if (formData.username.length < 3) {
            newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
        } else if (!/^[a-zA-Z0-9._]+$/.test(formData.username)) {
            newErrors.username = "Chỉ được dùng chữ, số, dấu chấm và gạch dưới";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = "Email là bắt buộc";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Email không hợp lệ";
        }

        if (!formData.password) {
            newErrors.password = "Mật khẩu là bắt buộc";
        } else if (formData.password.length < 8) {
            newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = "Mật khẩu phải có chữ hoa, chữ thường và số";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu không khớp";
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = "Bạn phải đồng ý với điều khoản";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                providerType,
            });

            toast.success('Đăng ký thành công! Kiểm tra email để xác thực tài khoản.');
            navigate("/verify-email", { state: { email: formData.email } });

        } catch (error: any) {
            const errorMessage = error instanceof Error ? error.message : "Đăng ký thất bại. Vui lòng thử lại.";
            const lowerMessage = errorMessage.toLowerCase();

            if (lowerMessage.includes("username") || lowerMessage.includes("tên đăng nhập")) {
                setErrors({ ...errors, username: "Tên đăng nhập đã tồn tại" });
            } else if (lowerMessage.includes("email")) {
                setErrors({ ...errors, email: "Email đã được sử dụng" });
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            heroTitle="Travello for Business"
            heroSubtitle="Quản lý dịch vụ du lịch của bạn một cách chuyên nghiệp"
        >
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 w-full max-w-md px-4 sm:px-0">

                <div className="mb-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                        Đăng ký đối tác
                    </h1>
                    <p className="text-sm text-gray-500">Tạo tài khoản để bắt đầu kinh doanh</p>
                </div>

                {/* Provider type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Loại dịch vụ
                    </label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setProviderType('hotel')}
                            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                                providerType === 'hotel'
                                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                        >
                            Lưu trú
                        </button>
                        <button
                            type="button"
                            onClick={() => setProviderType('ticket')}
                            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                                providerType === 'ticket'
                                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                        >
                            Tour / Vé
                        </button>
                    </div>
                </div>

                <FormInput
                    label="Tên đăng nhập"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="hotel_manager_123"
                    error={errors.username}
                    required
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    }
                />

                <EmailInput
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="business@example.com"
                    error={errors.email}
                    required
                />

                <PasswordInput
                    label="Mật khẩu"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Tạo mật khẩu mạnh"
                    error={errors.password}
                    required
                />

                <PasswordInput
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập lại mật khẩu"
                    error={errors.confirmPassword}
                    required
                />

                <div className="flex items-start gap-2">
                    <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        className="cursor-pointer mt-0.5 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded flex-shrink-0"
                    />
                    <label className="text-xs sm:text-sm text-gray-600 leading-tight">
                        Tôi đồng ý với{" "}
                        <button type="button" className="text-orange-500 hover:text-orange-600 underline">
                            Điều khoản dịch vụ
                        </button>
                        {" "}và{" "}
                        <button type="button" className="text-orange-500 hover:text-orange-600 underline">
                            Chính sách bảo mật
                        </button>
                    </label>
                </div>
                {errors.agreeToTerms && (
                    <p className="text-red-500 text-xs -mt-2">{errors.agreeToTerms}</p>
                )}

                <AuthButton
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={loading}
                    className="w-full"
                >
                    Tạo tài khoản
                </AuthButton>

                <div className="text-center mt-2">
                    <span className="text-sm text-gray-500">Đã có tài khoản? </span>
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-sm text-orange-500 hover:text-orange-600 font-medium cursor-pointer"
                    >
                        Đăng nhập
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
};

export default HotelProviderRegisterPage;
