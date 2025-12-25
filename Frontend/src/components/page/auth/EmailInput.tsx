import React from "react";
import FormInput from "./FormInput";

interface EmailInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

const EmailInput: React.FC<EmailInputProps> = (props) => {
  const emailIcon = (
    <svg width="20" height="16" viewBox="0 0 43 34" fill="none">
      <path
        d="M30.0595 29.1517H12.484C7.21139 29.1517 3.69629 27.0739 3.69629 22.2255V12.5289C3.69629 7.68052 7.21139 5.60266 12.484 5.60266H30.0595C35.3322 5.60266 38.8473 7.68052 38.8473 12.5289V22.2255C38.8473 27.0739 35.3322 29.1517 30.0595 29.1517Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M30.0599 13.2214L24.5587 16.6845C22.7485 17.8204 19.7782 17.8204 17.9679 16.6845L12.4844 13.2214"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <FormInput
      {...props}
      type="email"
      icon={emailIcon}
    />
  );
};

export default EmailInput;
