// src/pages/HomePage.jsx
import React from 'react';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/home/HeroSection';
import RegionSection from '../components/home/RegionSection';
import PopularDestinations from '../components/home/PopularDestinations';

const HomePage = ({ isLoggedIn }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation isLoggedIn={isLoggedIn} />
      <HeroSection />
      <RegionSection />
      <PopularDestinations />
      <Footer />
    </div>
  );
};

export default HomePage;