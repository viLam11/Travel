import React from "react";
import { motion } from "framer-motion";
import AirplaneAnimation from "@/components/ui/Airplane/airplane/AirplaneAnimation";
import backgroundImage from "../../assets/login-bg.png";
import "./HeroSection.scss";

interface HeroSectionProps {
  title: string;
  subtitle: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle }) => {
  return (
    <div className="w-full lg:w-2/3 relative bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />
      
      {/* Fog Effect Layers */}
      <div className="fog-container">
        <div className="fog fog-1"></div>
        <div className="fog fog-2"></div>
        <div className="fog fog-3"></div>
        <div className="fog fog-4"></div>
        <div className="fog fog-5"></div>
      </div>

      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-5"></div>
      
      <div className="relative z-10 h-full flex flex-col items-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute bottom-15 text-white text-center"
        >
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 tracking-wide text-[#EB662B] drop-shadow-lg color-eb662b"
            style={{ fontFamily: "'Great Vibes', cursive" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {title}
          </motion.h1>
          <motion.p 
            className="text-base sm:text-lg opacity-90 max-w-md leading-relaxed text-[#EB662B] px-4 drop-shadow-md color-eb662b"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </div>
      
      {/* Airplane Animation - hidden on mobile for performance */}
      <div className="hidden sm:block">
        <AirplaneAnimation />
      </div>

      {/* Floating Particles */}
      <div className="particles-container">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{ 
              opacity: 0,
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 50
            }}
            animate={{ 
              opacity: [0, 0.6, 0],
              x: Math.random() * window.innerWidth,
              y: -50
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;