// src/pages/auth/VerifyEmailPage.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../../../components/page/auth/AuthLayout";
import AuthButton from "../../../components/page/auth/AuthButton";

interface LocationState {
  email: string;
  userData?: {
    firstName: string;
    lastName: string;
    password: string;
  };
}

const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, userData } = (location.state as LocationState) || {};
  
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect nếu không có email
  useEffect(() => {
    // if (!email) {
    //   navigate("/register");
    // }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = otp.split('');
    newOtp[index] = value.slice(-1);
    const otpString = newOtp.join('');
    
    setOtp(otpString);
    
    if (error) {
      setError("");
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    setOtp(pastedData.padEnd(6, ''));
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError("Vui lòng nhập đủ 6 số");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Xác thực OTP:", { email, otp, userData });
      
      // TODO: Call API verify OTP và tạo tài khoản
      // const response = await api.verifyEmailAndRegister({ email, otp, ...userData });
      
      setVerificationSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", { 
          state: { message: "Đăng ký thành công! Vui lòng đăng nhập." }
        });
      }, 3000);
      
    } catch (error) {
      console.error("Xác thực OTP thất bại:", error);
      setError("Mã OTP không đúng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Gửi lại OTP đến:", email);
      // TODO: Call API resend OTP
      
      setCountdown(60);
      setOtp("");
      setError("");
      
      // Clear all OTP inputs
      inputRefs.current.forEach(input => {
        if (input) input.value = "";
      });
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Gửi lại OTP thất bại:", error);
      setError("Không thể gửi lại OTP. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (verificationSuccess) {
    return (
      <AuthLayout 
        heroTitle="Travelista Tours"
        heroSubtitle="Travel is the only purchase that enriches you in ways beyond material wealth"
      >
        <div className="text-center px-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-bounce">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Xác Thực Thành Công!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            Email <strong className="break-all text-orange-500">{email}</strong> đã được xác thực.
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            Tài khoản của bạn đã được tạo thành công!
          </p>
          <div className="flex items-center justify-center gap-2 text-orange-500">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs sm:text-sm">
              Đang chuyển đến trang đăng nhập...
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // OTP Input screen
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

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Xác Thực Email</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          Chúng tôi đã gửi mã OTP đến <strong className="break-all text-orange-500">{email}</strong>
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
                  ref={(el) => {
                    inputRefs.current[index] = el;
                    }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[index] || ''}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(index, e)}
                  onPaste={index === 0 ? handleOTPPaste : undefined}
                  className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold border-2 rounded-lg outline-none transition-all ${
                    error 
                      ? 'border-red-500' 
                      : otp[index] 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-300 focus:border-orange-500'
                  }`}
                />
              ))}
            </div>
            {error && (
              <p className="text-red-500 text-xs sm:text-sm mt-2">{error}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-orange-700 font-semibold mb-2">
              Lưu ý:
            </p>
            <ul className="text-xs sm:text-sm text-orange-600 space-y-1 text-left">
              <li>• Kiểm tra hộp thư spam/junk nếu không thấy email</li>
              <li>• Mã OTP có hiệu lực trong 10 phút</li>
              <li>• Không chia sẻ mã OTP với bất kỳ ai</li>
            </ul>
          </div>

          {/* Verify Button */}
          <AuthButton
            type="submit"
            loading={loading}
            disabled={loading || otp.length !== 6}
            className="w-full"
          >
            XÁC THỰC EMAIL
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

          {/* Back to Register */}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors underline-offset-2 hover:underline cursor-pointer"
          >
            <span className="mr-1">←</span>Thay đổi thông tin đăng ký
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;