// src/pages/auth/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../../components/auth/AuthLayout";
import EmailInput from "../../../components/auth/EmailInput";
import PasswordInput from "../../../components/auth/PasswordInput";
import AuthButton from "../../../components/auth/AuthButton";
import SocialLogin from "../../../components/auth/SocialLogin";
import AirplaneAnimation from "@/components/ui/Airplane/airplane/AirplaneAnimation";

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
    email: "thisuix@mail.com",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Login attempt:", formData);
      
      // Simulate successful login
      // In real app, handle response and redirect
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Login failed:", error);
      setErrors({
        general: "Invalid email or password. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      heroTitle="Travelista Tours"
      heroSubtitle="Travel is the only purchase that enriches you in ways beyond material wealth"
    >
      {/* Welcome Header */}
      <AirplaneAnimation/>
      <div className="mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-orange-500 mb-1">
          Welcome
        </h1>
        <p className="text-gray-500">Login with Email</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* General Error Display */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Email Field */}
        <EmailInput
          label="Email Id"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="thisuix@mail.com"
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

        {/* Forgot Password */}
        <div className="text-right">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-gray-500 hover:text-orange-500 transition-colors hover:underline cursor-pointer"
          >
            Forgot your password?
          </button>
        </div>

        {/* Login Button */}
        <AuthButton
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          LOGIN
        </AuthButton>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">OR</span>
          </div>
        </div>

        {/* Social Login */}
        <SocialLogin />

        {/* Register Link */}
        <div className="text-center mt-6">
          <span className="text-gray-600">Don't have account? </span>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-orange-500 hover:text-orange-600 font-semibold transition-colors underline-offset-2 hover:underline cursor-pointer"
          >
            Register Now
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;