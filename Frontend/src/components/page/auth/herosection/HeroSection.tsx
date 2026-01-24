import React from "react";
import { motion } from "framer-motion";
import AirplaneAnimation from "@/components/ui/Airplane/AirplaneAnimation";
import backgroundImage from "../../../../assets/login-bg.png";
import "./HeroSection.scss";

interface HeroSectionProps {
  title: string;
  subtitle: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle }) => {
  return (
    <div className="w-full h-[40vh] sm:h-[50vh] lg:h-screen relative bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 sm:opacity-100"
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

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-5"></div>
      
      <div className="relative z-10 h-full flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white text-center"
        >
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 lg:mb-5 tracking-wide text-[#EB662B] drop-shadow-lg"
            style={{ fontFamily: "'Great Vibes', cursive" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {title}
          </motion.h1>
          <motion.p 
            className="text-xs sm:text-sm md:text-base lg:text-lg opacity-90 max-w-xs sm:max-w-md leading-relaxed text-[#EB662B] px-2 sm:px-4 drop-shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </div>
      
      {/* Airplane Animation - Hidden on small mobile */}
      {/* <div className="hidden lg:block">
        <AirplaneAnimation />
      </div> */}

      {/* Floating Particles - Reduced on mobile */}
      <div className="particles-container">
        {[...Array(window.innerWidth < 640 ? 5 : 15)].map((_, i) => (
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