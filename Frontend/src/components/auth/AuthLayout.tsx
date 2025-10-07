import React from "react";
import { motion } from "framer-motion";
import HeroSection from "../auth/herosection/HeroSection";

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
      {/* Hero Section - Full width on mobile, 2/3 on desktop */}
      <div className="w-full lg:w-5/9">
        <HeroSection title={heroTitle} subtitle={heroSubtitle} />
      </div>
      
      {/* Form Section - Full width on mobile, 1/3 on desktop */}
      <div className="w-full lg:w-4/9 bg-white flex items-center justify-center py-8 sm:py-12 lg:py-0 lg:min-h-screen">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md px-4 sm:px-6 lg:px-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;