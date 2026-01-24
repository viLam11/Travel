// src/pages/Auth/Login/LoginPage.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import AuthLayout from "../../../components/page/auth/AuthLayout";
import UsernameOrEmailInput from "../../../components/page/auth/UsernameOrEmailInput";
import PasswordInput from "../../../components/page/auth/PasswordInput";
import AuthButton from "../../../components/page/auth/AuthButton";
import SocialLogin from "../../../components/page/auth/SocialLogin";
import AirplaneAnimation from "@/components/ui/Airplane/AirplaneAnimation";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, currentUser } = useAuth();
  const successMessage = location.state?.message;

  // Redirect nếu đã login
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const role = currentUser.user.role;
      const redirectPath = role === 'PROVIDER' ? '/admin/dashboard' : '/homepage';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email/Username validation
    if (!formData.email) {
      newErrors.email = "Email hoặc Tên đăng nhập là bắt buộc";
    } else if (formData.email.includes('@')) {
      // If it looks like an email, validate as email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Email không hợp lệ";
      }
    } else {
      // If it doesn't have @, validate as username (e.g. min length)
      if (formData.email.length < 3) {
        newErrors.email = "Tên đăng nhập phải có ít nhất 3 ký tự";
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
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
    // Clear previous errors
    setErrors({});

    try {
      // Use the login function from useAuth hook
      await login(formData.email, formData.password);

      // Get user from currentUser (already set by useAuth)
      const role = currentUser?.user?.role;

      // Show success message
      toast.success('Đăng nhập thành công!');

      // Check for return URL
      const returnUrl = sessionStorage.getItem('returnUrl');

      if (returnUrl) {
        sessionStorage.removeItem('returnUrl');
        navigate(returnUrl);
      } else {
        // Role-based redirect
        const redirectPath = role === 'PROVIDER' ? '/admin/dashboard' : '/homepage';
        navigate(redirectPath);
      }

    } catch (error: any) {
      console.error("Đăng nhập thất bại (LoginPage):", error);

      // useAuth already handles error message mapping to Vietnamese
      // Display as inline error instead of toast for better UX and security
      const errorMessage = error instanceof Error
        ? error.message
        : "Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại.";

      // Set general error to display below password field
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate, location.pathname]);

  return (
    <AuthLayout
      heroTitle="Travelista Tours"
      heroSubtitle="Travel is the only purchase that enriches you in ways beyond material wealth"
    >
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-700 text-sm sm:text-base">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Test Credentials Info - Uncomment if using mock auth */}
      {/* 
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">Tài khoản test (Mock):</p>
        <div className="space-y-2 text-xs">
          <div className="bg-white p-2 rounded">
            <p className="font-semibold text-blue-700">Admin/Provider:</p>
            <p className="text-gray-600">Email: <code>admin@example.com</code></p>
            <p className="text-gray-600">Password: <code>admin123</code></p>
          </div>
          <div className="bg-white p-2 rounded">
            <p className="font-semibold text-green-700">User:</p>
            <p className="text-gray-600">Email: <code>user@example.com</code></p>
            <p className="text-gray-600">Password: <code>user123</code></p>
          </div>
        </div>
      </div>
      */}

      {/* Airplane Animation - Hidden on mobile */}
      {/* <div className="hidden lg:block">
        <AirplaneAnimation />
      </div> */}

      {/* Welcome Header - Responsive text sizes */}
      <div className="mb-6 sm:mb-8 text-center px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-orange-500 mb-1">
          Welcome
        </h1>
        <p className="text-sm sm:text-base text-gray-500">Login with Email or Username</p>
      </div>

      {/* Login Form - Responsive spacing */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 px-4 sm:px-0">
        {/* Username or Email Field */}
        <UsernameOrEmailInput
          label="Email hoặc Tên đăng nhập"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Nhập email hoặc tên đăng nhập"
          error={errors.email}
          required
        />

        {/* Password Field */}
        <PasswordInput
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter your password"
          error={errors.password}
          required
        />

        {/* General Error Message - Simple red text */}
        {errors.general && (
          <p className="text-red-600 text-sm -mt-2 animate-fade-in">
            {errors.general}
          </p>
        )}

        {/* Forgot Password - Responsive text size */}
        <div className="text-right">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-xs sm:text-sm text-gray-500 hover:text-orange-500 transition-colors hover:underline cursor-pointer"
          >
            Forgot your password?
          </button>
        </div>

        {/* Login Button - Full width on mobile */}
        <AuthButton
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
          className="w-full"
        >
          LOGIN
        </AuthButton>

        {/* Divider - Responsive margin */}
        <div className="relative my-4 sm:my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="px-3 sm:px-4 bg-white text-gray-500">OR</span>
          </div>
        </div>

        {/* Social Login */}
        <SocialLogin />

        {/* Register Link - Responsive text size */}
        <div className="text-center mt-4 sm:mt-6">
          <span className="text-xs sm:text-sm text-gray-600">Don't have account? </span>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-xs sm:text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors underline-offset-2 hover:underline cursor-pointer"
          >
            Register Now
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;