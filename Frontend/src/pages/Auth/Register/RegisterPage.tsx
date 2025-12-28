// src/pages/auth/RegisterPage.tsx
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
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Tên đăng nhập là bắt buộc";
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
    } else if (!/^[a-zA-Z0-9._]+$/.test(formData.username)) {
      newErrors.username = "Tên đăng nhập không được có dấu, khoảng trắng hoặc ký tự đặc biệt (ngoại trừ . và _)";
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

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Call real Backend API
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');

      // Navigate to verify email page
      navigate("/verify-email", {
        state: {
          email: formData.email,
        }
      });

    } catch (error: any) {
      console.error("Registration failed:", error);
      // Attempt to extract the error message
      let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";

      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error?.response?.data) {
        // Handle backend ErrorResponse structure { status, message }
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      // Debug: Log the extracted error message
      console.log("Extracted errorMessage:", errorMessage);

      // Special handling for specific errors to map to fields
      const lowerMessage = errorMessage.toLowerCase();
      if (lowerMessage.includes("username") || lowerMessage.includes("tên đăng nhập")) {
        setErrors({ ...errors, username: "Tên đăng nhập đã tồn tại" });
      } else if (lowerMessage.includes("email")) {
        setErrors({ ...errors, email: "Email đã tồn tại" });
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

        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-orange-500 mb-1">
            Đăng Ký
          </h1>
          <p className="text-sm sm:text-base text-gray-500">Tạo tài khoản mới</p>
        </div>

        {/* Username */}
        {/* Username */}
        <FormInput
          label="Tên đăng nhập"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="HoangAnh123"
          error={errors.username}
          required
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          }
        />

        {/* Email */}
        <EmailInput
          label="Địa chỉ Email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="nguyenvana@email.com"
          error={errors.email}
          required
        />

        {/* Password */}
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

          {/* Progressive Password Validation - Show only unmet requirements */}
          {formData.password && (
            <div className="mt-1.5 space-y-1">
              {/* Show error only if requirement is not met */}
              {formData.password.length < 8 && (
                <p className="text-red-500 text-xs flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Mật khẩu phải có ít nhất 8 ký tự
                </p>
              )}

              {formData.password.length >= 8 && !/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) && (
                <p className="text-red-500 text-xs flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Mật khẩu phải có chữ hoa và chữ thường
                </p>
              )}

              {formData.password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) && !/(?=.*\d)/.test(formData.password) && (
                <p className="text-red-500 text-xs flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Mật khẩu phải có ít nhất một số
                </p>
              )}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <PasswordInput
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Nhập lại mật khẩu"
          error={errors.confirmPassword}
          required
        />

        {/* Terms and Conditions - Compact */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className="mt-0.5 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded flex-shrink-0"
          />
          <label className="text-xs sm:text-sm text-gray-600 leading-tight">
            Tôi đồng ý với{" "}
            <button
              type="button"
              className="text-orange-500 hover:text-orange-600 underline"
            >
              Điều khoản dịch vụ
            </button>{" "}
            và{" "}
            <button
              type="button"
              className="text-orange-500 hover:text-orange-600 underline"
            >
              Chính sách bảo mật
            </button>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-red-500 text-xs sm:text-sm -mt-2">{errors.agreeToTerms}</p>
        )}

        {/* Submit Button */}
        <AuthButton
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
          className="w-full"
        >
          TẠO TÀI KHOẢN
        </AuthButton>

        {/* Divider */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="px-3 sm:px-4 bg-white text-gray-500">HOẶC</span>
          </div>
        </div>

        {/* Social Login */}
        <SocialLogin />

        {/* Login Link */}
        <div className="text-center mt-3">
          <span className="text-xs sm:text-sm text-gray-600">Đã có tài khoản? </span>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-xs sm:text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors underline-offset-2 hover:underline cursor-pointer"
          >
            Đăng nhập
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;