import React from 'react';

export default function CommoditiesHeroVideo() {
  return (
    <div className="w-full relative overflow-hidden bg-black" style={{ height: 280 }}>
      <video
        src="/commodities-hero.mov"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
