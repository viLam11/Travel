// src/pages/auth/RegisterPage.tsx - Multi-step
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../../components/auth/AuthLayout";
import EmailInput from "../../../components/auth/EmailInput";
import PasswordInput from "../../../components/auth/PasswordInput";
import AuthButton from "../../../components/auth/AuthButton";
import SocialLogin from "../../../components/auth/SocialLogin";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

const RegisterPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const navigate = useNavigate();

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

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase and number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrev = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Registration attempt:", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      setShowSuccessMessage(true);
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccessMessage) {
    return (
      <AuthLayout 
        heroTitle="Travelista Tours"
        heroSubtitle="Travel is the only purchase that enriches you in ways beyond material wealth"
      >
        <div className="text-center px-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            We've sent a verification email to <strong className="break-all">{formData.email}</strong>
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            Please check your email and click the verification link to activate your account.
          </p>
          <p className="text-xs sm:text-sm text-orange-500">
            Redirecting to login page in 3 seconds...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      heroTitle="Travelista Tours"
      heroSubtitle="Travel is the only purchase that enriches you in ways beyond material wealth"
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 w-full max-w-md px-4 sm:px-0">
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-2 w-16 sm:w-20 rounded-full transition-all ${step >= 1 ? 'bg-orange-500' : 'bg-gray-200'}`} />
          <div className={`h-2 w-16 sm:w-20 rounded-full transition-all ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
        </div>

        {/* Header - Only on Step 1 */}
        {step === 1 && (
          <div className="mb-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-orange-500 mb-1">
              Join Us
            </h1>
            <p className="text-sm sm:text-base text-gray-500">Create your account</p>
          </div>
        )}

        {/* Step 2 Header */}
        {step === 2 && (
          <div className="mb-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-orange-500 mb-1">
              Secure Your Account
            </h1>
            <p className="text-sm sm:text-base text-gray-500">Set up your password</p>
          </div>
        )}

        {/* STEP 1: Name + Email */}
        {step === 1 && (
          <>
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-orange-500 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg outline-none transition-all focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-orange-500 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg outline-none transition-all focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <EmailInput
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john.doe@email.com"
              error={errors.email}
              required
            />

            <AuthButton 
              type="button" 
              onClick={handleNext} 
              className="w-full"
              variant="primary"
            >
              NEXT
            </AuthButton>

            {/* Divider */}
            <div className="relative my-3 sm:my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-3 sm:px-4 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <SocialLogin />

            {/* Login Link */}
            <div className="text-center mt-3 sm:mt-4">
              <span className="text-xs sm:text-sm text-gray-600">Already have an account? </span>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-xs sm:text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors underline-offset-2 hover:underline"
              >
                Sign In
              </button>
            </div>
          </>
        )}

        {/* STEP 2: Password + Terms */}
        {step === 2 && (
          <>
            <PasswordInput
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a strong password"
              error={errors.password}
              required
            />

            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              error={errors.confirmPassword}
              required
            />

            {/* Password Requirements Indicator */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1.5">
                <li className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : ''}`}>
                  <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center text-xs flex-shrink-0 ${
                    formData.password.length >= 8 ? 'bg-green-100 text-green-600' : 'bg-gray-200'
                  }`}>
                    {formData.password.length >= 8 ? '✓' : '•'}
                  </span>
                  At least 8 characters
                </li>
                <li className={`flex items-center ${/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : ''}`}>
                  <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center text-xs flex-shrink-0 ${
                    /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? 'bg-green-100 text-green-600' : 'bg-gray-200'
                  }`}>
                    {/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? '✓' : '•'}
                  </span>
                  Upper and lowercase letters
                </li>
                <li className={`flex items-center ${/(?=.*\d)/.test(formData.password) ? 'text-green-600' : ''}`}>
                  <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center text-xs flex-shrink-0 ${
                    /(?=.*\d)/.test(formData.password) ? 'bg-green-100 text-green-600' : 'bg-gray-200'
                  }`}>
                    {/(?=.*\d)/.test(formData.password) ? '✓' : '•'}
                  </span>
                  At least one number
                </li>
              </ul>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="mt-0.5 sm:mt-1 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded flex-shrink-0"
              />
              <label className="text-xs sm:text-sm text-gray-600">
                I agree to the{" "}
                <button
                  type="button"
                  className="text-orange-500 hover:text-orange-600 underline"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="text-orange-500 hover:text-orange-600 underline"
                >
                  Privacy Policy
                </button>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.agreeToTerms}</p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 sm:gap-4">
              <AuthButton 
                type="button" 
                onClick={handlePrev} 
                variant="secondary"
                className="flex-1"
              >
                BACK
              </AuthButton>
              <AuthButton 
                type="submit" 
                variant="primary"
                loading={loading}
                disabled={loading}
                className="flex-1"
              >
                CREATE ACCOUNT
              </AuthButton>
            </div>
          </>
        )}
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;