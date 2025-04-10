import React from 'react';
import { resource } from '../../resource';

const Hero = () => {
  return (
    <div className="hero-section position-relative text-white text-center py-5" 
         style={{
           backgroundImage: `url(${resource.MarketAccessBG.src}`,
           backgroundSize: 'cover',
           backgroundPosition: 'bottom',
           minHeight: '300px'
         }}>
      <div className="dark-overlay position-absolute top-0 start-0 w-100 h-100"
           style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}></div>
      <div className="position-relative container py-5">
        <h1 className="display-3 fw-bold mb-4 mt-4">Market Access</h1>
      </div>
    </div>
  );
};

export default Hero;