// src/pages/auth/ForgotPasswordPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../../components/auth/AuthLayout";
import EmailInput from "../../../components/auth/EmailInput";
import AuthButton from "../../../components/auth/AuthButton";

interface FormData {
  email: string;
}

interface FormErrors {
  email?: string;
}

const ForgotPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Password reset request:", formData);
      setEmailSent(true);
    } catch (error) {
      console.error("Password reset failed:", error);
      setErrors({
        email: "Email not found in our system. Please check and try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Resending email to:", formData.email);
    } catch (error) {
      console.error("Resend failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
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

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            We've sent a password reset link to <strong className="break-all">{formData.email}</strong>
          </p>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-orange-700 font-semibold mb-2">
              Didn't receive the email?
            </p>
            <ul className="text-xs sm:text-sm text-orange-600 space-y-1 text-left">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• The link expires in 15 minutes</li>
            </ul>
          </div>

          <AuthButton
            onClick={handleResendEmail}
            loading={loading}
            disabled={loading}
            className="mb-3 sm:mb-4 w-full"
          >
            Resend Email
          </AuthButton>

          <button
            onClick={() => navigate("/login")}
            className="text-sm sm:text-base text-orange-500 hover:text-orange-600 font-semibold transition-colors underline-offset-2 hover:underline cursor-pointer"
          >
            Back to Login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      heroTitle="Travelista Tours"
      heroSubtitle="Travel is the only purchase that enriches you in ways beyond material wealth"
    >
      <div className="mb-6 sm:mb-8 text-center px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-orange-500 mb-1">
          Reset Password
        </h1>
        <p className="text-sm sm:text-base text-gray-500">Enter your email to receive reset instructions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 px-4 sm:px-0">
        <EmailInput
          label="Email Address"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your registered email"
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
          SEND RESET LINK
        </AuthButton>

        <div className="text-center mt-4 sm:mt-6">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-sm sm:text-base text-orange-500 hover:text-orange-600 font-semibold transition-colors underline-offset-2 hover:underline cursor-pointer inline-flex items-center"
          >
            <span className="mr-1">←</span> Back to Login
          </button>
        </div>

        <div className="text-center mt-3 sm:mt-4">
          <span className="text-xs sm:text-sm text-gray-600">Don't have an account? </span>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-xs sm:text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors underline-offset-2 hover:underline cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;