// src/pages/auth/ResetPasswordPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../../components/auth/AuthLayout";
import PasswordInput from "../../../components/auth/PasswordInput";
import AuthButton from "../../../components/auth/AuthButton";

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  token?: string;
}

const ResetPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    // Validate token when component mounts
    if (!token) {
      setTokenValid(false);
      setErrors({ token: "Invalid or missing reset token" });
    } else {
      // Simulate token validation
      validateToken(token);
    }
  }, [token]);

  const validateToken = async (resetToken: string) => {
    try {
      // Simulate API call to validate token
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Validating token:", resetToken);
      
      // For demo purposes, assume token is valid
      // In real app, check with backend
      setTokenValid(true);
    } catch (error) {
      setTokenValid(false);
      setErrors({ token: "Reset link has expired or is invalid" });
    }
  };

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

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase and number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      
      console.log("Password reset:", {
        token,
        newPassword: formData.password,
      });

      setPasswordReset(true);
      
      // Redirect to login after success
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (error) {
      console.error("Password reset failed:", error);
      setErrors({
        token: "Failed to reset password. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  // Invalid token state
  if (!tokenValid) {
    return (
      <AuthLayout 
        heroTitle="Travelista Tours"
        heroSubtitle="Travel is the only purchase that enriches you in ways beyond material wealth"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h1>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired.
          </p>
          
          <div className="space-y-4">
            <AuthButton
              onClick={() => navigate("/forgot-password")}
              variant="primary"
            >
              Request New Reset Link
            </AuthButton>
            
            <button
              onClick={() => navigate("/login")}
              className="text-orange-500 hover:text-orange-600 font-semibold transition-colors underline-offset-2 hover:underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (passwordReset) {
    return (
      <AuthLayout 
        heroTitle="Travelista Tours"
        heroSubtitle="Travel is the only purchase that enriches you in ways beyond material wealth"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your password has been successfully updated.
          </p>
          <p className="text-sm text-orange-500">
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
      <div className="mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-orange-500 mb-1">
          New Password
        </h1>
        <p className="text-gray-500">Enter your new password</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Password Field */}
        <PasswordInput
          label="New Password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter your new password"
          error={errors.password}
          required
        />

        {/* Confirm Password Field */}
        <PasswordInput
          label="Confirm New Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm your new password"
          error={errors.confirmPassword}
          required
        />

        {/* Password Requirements */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : ''}`}>
              <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center text-xs ${
                formData.password.length >= 8 ? 'bg-green-100 text-green-600' : 'bg-gray-200'
              }`}>
                {formData.password.length >= 8 ? '✓' : '•'}
              </span>
              At least 8 characters
            </li>
            <li className={`flex items-center ${/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : ''}`}>
              <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center text-xs ${
                /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? 'bg-green-100 text-green-600' : 'bg-gray-200'
              }`}>
                {/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? '✓' : '•'}
              </span>
              Upper and lowercase letters
            </li>
            <li className={`flex items-center ${/(?=.*\d)/.test(formData.password) ? 'text-green-600' : ''}`}>
              <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center text-xs ${
                /(?=.*\d)/.test(formData.password) ? 'bg-green-100 text-green-600' : 'bg-gray-200'
              }`}>
                {/(?=.*\d)/.test(formData.password) ? '✓' : '•'}
              </span>
              At least one number
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <AuthButton
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          RESET PASSWORD
        </AuthButton>

        {/* Error display */}
        {errors.token && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{errors.token}</p>
          </div>
        )}
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;