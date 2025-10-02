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
      // Simulate API call
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
        <div className="text-center">
          {/* Email Icon */}
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to <strong>{formData.email}</strong>
          </p>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-orange-700">
              <strong>Didn't receive the email?</strong>
            </p>
            <ul className="text-sm text-orange-600 mt-2 space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• The link expires in 15 minutes</li>
            </ul>
          </div>

          <AuthButton
            onClick={handleResendEmail}
            loading={loading}
            disabled={loading}
            className="mb-4"
          >
            Resend Email
          </AuthButton>

          <button
            onClick={() => navigate("/login")}
            className="text-orange-500 hover:text-orange-600 font-semibold transition-colors underline-offset-2 hover:underline cursor-pointer"
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
      <div className="mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-orange-500 mb-1">
          Reset Password
        </h1>
        <p className="text-gray-500">Enter your email to receive reset instructions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <EmailInput
          label="Email Address"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your registered email"
          error={errors.email}
          required
        />

        {/* Submit Button */}
        <AuthButton
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          SEND RESET LINK
        </AuthButton>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-orange-500 hover:text-orange-600 font-semibold transition-colors underline-offset-2 hover:underline cursor-pointer"
          >
            ← Back to Login
          </button>
        </div>

        {/* Register Link */}
        <div className="text-center mt-4">
          <span className="text-gray-600">Don't have an account? </span>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-orange-500 hover:text-orange-600 font-semibold transition-colors underline-offset-2 hover:underline cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;