import React from "react";

interface FormInputProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
  required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  icon,
  rightElement,
  error,
  required = false,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-orange-500 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className={`flex items-center border rounded-lg transition-all focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}>
        {icon && (
          <div className="pl-3 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="flex-1 px-3 py-3 outline-none text-gray-700"
          placeholder={placeholder}
        />
        
        {rightElement}
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormInput;