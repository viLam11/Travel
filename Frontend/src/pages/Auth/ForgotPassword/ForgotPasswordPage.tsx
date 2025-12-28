// src/pages/auth/ForgotPasswordPage.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../../components/page/auth/AuthLayout";
import EmailInput from "../../../components/page/auth/EmailInput";
import AuthButton from "../../../components/page/auth/AuthButton";
import apiClient from "@/services/apiClient";

interface FormData {
  email: string;
  otp: string;
}

interface FormErrors {
  email?: string;
  otp?: string;
}

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [formData, setFormData] = useState<FormData>({
    email: "",
    otp: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-focus first OTP input when step 2
  useEffect(() => {
    if (step === 2) {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // OTP Input Handlers
  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = formData.otp.split('');
    newOtp[index] = value.slice(-1);
    const otpString = newOtp.join('');

    setFormData({ ...formData, otp: otpString });

    if (errors.otp) {
      setErrors({ ...errors, otp: "" });
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    setFormData({ ...formData, otp: pastedData.padEnd(6, '') });
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const validateEmail = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      setErrors({ email: "Email là bắt buộc" });
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      setErrors({ email: "Email không hợp lệ" });
      return false;
    }
    return true;
  };

  const validateOTP = (): boolean => {
    if (formData.otp.length !== 6) {
      setErrors({ otp: "Vui lòng nhập đủ 6 số" });
      return false;
    }
    return true;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setLoading(true);
    try {
      await apiClient.auth.forgotPassword({ email: formData.email });

      setStep(2);
      setCountdown(60);
    } catch (error: any) {
      console.error("Gửi OTP thất bại:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";

      // Translate common errors to Vietnamese
      let vietnameseError = errorMessage;
      if (errorMessage.includes("Email not found")) {
        vietnameseError = "Email không tồn tại trong hệ thống";
      } else if (errorMessage.includes("Account not verified")) {
        vietnameseError = "Tài khoản chưa được xác thực. Vui lòng xác thực tài khoản trước";
      }

      setErrors({ email: vietnameseError });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateOTP()) return;

    setLoading(true);
    try {
      const response = await apiClient.auth.verifyResetOTP({
        email: formData.email,
        otp: formData.otp
      });

      // Navigate to reset password page with token
      navigate(`/reset-password?token=${response.resetToken}`);
    } catch (error: any) {
      console.error("Xác thực OTP thất bại:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";

      // Translate common errors to Vietnamese
      let vietnameseError = errorMessage;
      if (errorMessage.includes("Invalid OTP")) {
        vietnameseError = "Mã OTP không đúng. Vui lòng thử lại";
      } else if (errorMessage.includes("expired")) {
        vietnameseError = "Mã OTP đã hết hạn. Vui lòng gửi lại mã mới";
      }

      setErrors({ otp: vietnameseError });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      // Reuse forgot-password endpoint
      await apiClient.auth.forgotPassword({ email: formData.email });

      setCountdown(60);
      setFormData({ ...formData, otp: "" });
      // Clear all OTP inputs
      inputRefs.current.forEach(input => {
        if (input) input.value = "";
      });
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      console.error("Gửi lại OTP thất bại:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể gửi lại OTP";
      setErrors({ otp: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: Nhập Email
  if (step === 1) {
    return (
      <AuthLayout
        heroTitle="Travelista Tours"
        heroSubtitle="Travel is the only purchase that enriches you in ways beyond material wealth"
      >
        <div className="mb-6 sm:mb-8 text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-orange-500 mb-1">
            Quên Mật Khẩu
          </h1>
          <p className="text-sm sm:text-base text-gray-500">Nhập email để nhận mã OTP</p>
        </div>

        <form onSubmit={handleSendOTP} className="space-y-5 sm:space-y-6 px-4 sm:px-0">
          <EmailInput
            label="Địa chỉ Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your.email@example.com"
            error={errors.email}
            required
          />

          <AuthButton
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            GỬI MÃ OTP
          </AuthButton>

          <div className="text-center mt-4 sm:mt-6">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm sm:text-base text-orange-500 hover:text-orange-600 font-semibold transition-colors underline-offset-2 hover:underline cursor-pointer inline-flex items-center"
            >
              <span className="mr-1">←</span>Quay lại Đăng nhập
            </button>
          </div>

          <div className="text-center mt-3 sm:mt-4">
            <span className="text-xs sm:text-sm text-gray-600">Chưa có tài khoản? </span>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-xs sm:text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              Đăng ký ngay
            </button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  // STEP 2: Nhập OTP
  return (
    <AuthLayout
      heroTitle="Travelista Tours"
      heroSubtitle="Travel is the only purchase that enriches you in ways beyond material wealth"
    >
      <div className="text-center px-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Xác Thực OTP</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          Chúng tôi đã gửi mã OTP đến <strong className="break-all text-orange-500">{formData.email}</strong>
        </p>

        <form onSubmit={handleVerifyOTP} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-orange-500 mb-2">
              Mã OTP <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 justify-center">
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  ref={(el) => { (inputRefs.current[index] = el) }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={formData.otp[index] || ''}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(index, e)}
                  onPaste={index === 0 ? handleOTPPaste : undefined}
                  className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold border-2 rounded-lg outline-none transition-all ${errors.otp
                    ? 'border-red-500'
                    : formData.otp[index]
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-300 focus:border-orange-500'
                    }`}
                />
              ))}
            </div>
            {errors.otp && (
              <p className="text-red-500 text-xs sm:text-sm mt-2">{errors.otp}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-orange-700 font-semibold mb-2">
              Lưu ý:
            </p>
            <ul className="text-xs sm:text-sm text-orange-600 space-y-1 text-left">
              <li>• Kiểm tra hộp thư spam nếu không thấy email</li>
              <li>• Mã OTP có hiệu lực trong 5 phút</li>
              <li>• Không chia sẻ mã OTP với bất kỳ ai</li>
            </ul>
          </div>

          {/* Verify Button */}
          <AuthButton
            type="submit"
            loading={loading}
            disabled={loading || formData.otp.length !== 6}
            className="w-full"
          >
            XÁC THỰC
          </AuthButton>

          {/* Resend OTP */}
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                Gửi lại mã sau <span className="font-semibold text-orange-500">{countdown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors underline-offset-2 hover:underline cursor-pointer disabled:opacity-50"
              >
                Gửi lại mã OTP
              </button>
            )}
          </div>

          {/* Change Email */}
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setFormData({ email: formData.email, otp: "" });
              setErrors({});
            }}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors underline-offset-2 hover:underline cursor-pointer"
          >
            <span className="mr-1">←</span> Thay đổi email
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;