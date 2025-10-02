import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import FormInput from "./FormInput";

interface PasswordInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder = "Enter your password",
  error,
  required = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const passwordIcon = (
    <svg width="18" height="20" viewBox="0 0 35 37" fill="none">
      <path
        d="M8.75 15.4166V12.3333C8.75 7.2304 10.2083 3.08331 17.5 3.08331C24.7917 3.08331 26.25 7.2304 26.25 12.3333V15.4166"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5003 28.5208C19.5139 28.5208 21.1462 26.7953 21.1462 24.6667C21.1462 22.5381 19.5139 20.8125 17.5003 20.8125C15.4868 20.8125 13.8545 22.5381 13.8545 24.6667C13.8545 26.7953 15.4868 28.5208 17.5003 28.5208Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24.792 33.9167H10.2087C4.37533 33.9167 2.91699 32.375 2.91699 26.2084V23.125C2.91699 16.9584 4.37533 15.4167 10.2087 15.4167H24.792C30.6253 15.4167 32.0837 16.9584 32.0837 23.125V26.2084C32.0837 32.375 30.6253 33.9167 24.792 33.9167Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const toggleButton = value ? (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="pr-3 text-gray-400 hover:text-gray-600 transition-colors"
    >
      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  ) : null;

  return (
    <FormInput
      label={label}
      type={showPassword ? "text" : "password"}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      icon={passwordIcon}
      rightElement={toggleButton}
      error={error}
      required={required}
    />
  );
};

export default PasswordInput;
