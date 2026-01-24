// src/pages/HomePage.tsx
import React, { useState } from 'react';
import Navigation from '../../../components/common/layout/NavigationUser';
import Footer from '../../../components/common/layout/Footer';
import HeroSection from '../../../components/page/home/herosection/HeroSection';
import RegionSection from '../../../components/page/home/RegionSection';
import PopularDestinations from '../../../components/page/home/PopularDestinations';
interface HomePageProps {
  onNavigateToDestinations?: () => void;
}
const HomePage: React.FC<HomePageProps> = ({ onNavigateToDestinations }) => {

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <RegionSection />
      <PopularDestinations />
      <Footer />
    </div>
  );
};

export default HomePage;
