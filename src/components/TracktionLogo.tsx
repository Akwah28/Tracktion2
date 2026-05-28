import React from 'react';

interface TracktionLogoProps {
  className?: string;
  size?: number | string;
}

export const TracktionLogo: React.FC<TracktionLogoProps> = ({ 
  className = '', 
  size = 36 
}) => {
  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Replicating the precise indigo-to-purple premium gradient from the user screenshot */}
          <linearGradient id="tracktion-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8A51FC" />  {/* Vibrant Purple */}
            <stop offset="100%" stopColor="#532AF1" /> {/* Royal Indigo */}
          </linearGradient>
          
          {/* Subtle inside top highlight to give it the 3D depth */}
          <linearGradient id="logo-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* 1. Main Background Squircle */}
        <rect
          x="2"
          y="2"
          width="96"
          height="96"
          rx="30"
          fill="url(#tracktion-logo-gradient)"
        />

        {/* 2. Top-down reflection highlight for modern 3D depth */}
        <rect
          x="2"
          y="2"
          width="96"
          height="48"
          rx="30"
          fill="url(#logo-highlight)"
          className="pointer-events-none"
        />

        {/* 3. Sleek Concentric Rings representing Actionable Consistency */}
        {/* Outer Ring */}
        <circle
          cx="50"
          cy="50"
          r="26"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.95"
        />

        {/* Middle Ring */}
        <circle
          cx="50"
          cy="50"
          r="15"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.95"
        />

        {/* Center Target Dot */}
        <circle
          cx="50"
          cy="50"
          r="6"
          fill="white"
          opacity="1"
        />
      </svg>
    </div>
  );
};
