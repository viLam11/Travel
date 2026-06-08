import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import AuthLayout from "../../../components/page/auth/AuthLayout";
import EmailInput from "../../../components/page/auth/EmailInput";
import PasswordInput from "../../../components/page/auth/PasswordInput";
import AuthButton from "../../../components/page/auth/AuthButton";
import SocialLogin from "../../../components/page/auth/SocialLogin";
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

const RegisterPage: React.FC = () => {
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
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });

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
      heroTitle="Travelista Tours"
      heroSubtitle="Travel is the only purchase that enriches you in ways beyond material wealth"
    >
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 w-full max-w-md px-4 sm:px-0">

        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Tạo tài khoản</h1>
          <p className="text-sm text-gray-500">Đăng ký để bắt đầu khám phá</p>
        </div>

        <FormInput
          label="Tên đăng nhập"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Nhập tên đăng nhập"
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
          placeholder="Địa chỉ email"
          error={errors.email}
          required
        />

        <div>
          <PasswordInput
            label="Mật khẩu"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Tạo mật khẩu mạnh"
            error={errors.password}
            required
          />
          {formData.password && (
            <div className="mt-1.5 space-y-0.5">
              {formData.password.length < 8 && (
                <p className="text-red-500 text-xs">Ít nhất 8 ký tự</p>
              )}
              {formData.password.length >= 8 && !/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) && (
                <p className="text-red-500 text-xs">Cần có chữ hoa và chữ thường</p>
              )}
              {formData.password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) && !/(?=.*\d)/.test(formData.password) && (
                <p className="text-red-500 text-xs">Cần có ít nhất một số</p>
              )}
            </div>
          )}
        </div>

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

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-gray-400">hoặc</span>
          </div>
        </div>

        <SocialLogin />

        <div className="text-center">
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

export default RegisterPage;
