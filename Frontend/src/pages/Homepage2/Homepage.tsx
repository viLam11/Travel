// src/pages/HomePage.tsx
import React, { useState } from 'react';
import Navigation from '../../components/layout/Navigation';
import Footer from '../../components/layout/Footer';
import HeroSection from '../../components/home/herosection/HeroSection';
import RegionSection from '../../components/home/RegionSection';
import PopularDestinations from '../../components/home/PopularDestinations';

const HomePage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <HeroSection />
      <RegionSection />
      <PopularDestinations />
      <Footer />
    </div>
  );
};

export default HomePage;
