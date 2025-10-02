import React from "react";
import { motion } from "framer-motion";
import HeroSection from "../layout/HeroSection";
interface AuthLayoutProps {
  heroTitle: string;
  heroSubtitle: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  heroTitle,
  heroSubtitle,
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Hero Section */}
      <HeroSection title={heroTitle} subtitle={heroSubtitle} />
      
      {/* Form Section */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center relative min-h-screen lg:min-h-auto">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md px-6 sm:px-10"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;