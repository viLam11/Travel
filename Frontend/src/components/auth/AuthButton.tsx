import React from "react";
import { motion } from "framer-motion";

interface AuthButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
}) => {
  const baseClasses = "font-semibold py-2.5 sm:py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md cursor-pointer text-sm sm:text-base";
  const variantClasses = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white disabled:bg-orange-300",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:bg-gray-100"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          <span className="text-sm sm:text-base">Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default AuthButton;