import React from 'react';

interface HospitalLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const HospitalLogo: React.FC<HospitalLogoProps> = ({
  className = '',
  size = 48,
  showText = false,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Emblem of Sangkhlaburi Hospital SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-xs"
        aria-label="ตราสัญลักษณ์โรงพยาบาลสังขละบุรี"
      >
        {/* Outer Ring */}
        <circle cx="100" cy="100" r="97" stroke="#0D6938" strokeWidth="4" fill="#FFFFFF" />
        <circle cx="100" cy="100" r="92" stroke="#0D6938" strokeWidth="1.5" fill="#FFFFFF" />
        <circle cx="100" cy="100" r="89" stroke="#0D6938" strokeWidth="1" fill="#FFFFFF" />

        {/* Text Curved Path or Emulated Circular Banner */}
        {/* Deep Green Inner Center Circle */}
        <circle cx="100" cy="100" r="67" fill="#0D6938" />
        <circle cx="100" cy="100" r="67" stroke="#094A27" strokeWidth="2" />
        <circle cx="100" cy="100" r="64" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 2" />

        {/* Circular text paths */}
        <defs>
          <path id="circlePathTop" d="M 28 100 A 72 72 0 1 1 172 100" fill="none" />
          <path id="circlePathBottom" d="M 174 100 A 74 74 0 0 1 26 100" fill="none" />
        </defs>

        <text fill="#0D6938" fontSize="13" fontWeight="700" letterSpacing="2">
          <textPath href="#circlePathTop" startOffset="50%" textAnchor="middle">
            โรงพยาบาลสังขละบุรี
          </textPath>
        </text>

        <text fill="#0D6938" fontSize="10.5" fontWeight="700" letterSpacing="1.8">
          <textPath href="#circlePathBottom" startOffset="50%" textAnchor="middle">
            SANGKHLABURI HOSPITAL
          </textPath>
        </text>

        {/* Traditional Thai Kranok Motifs on Sides */}
        {/* Left ornament */}
        <g transform="translate(20, 100) scale(0.6)">
          <path d="M-8 0 Q-2 -12 8 -6 Q0 0 8 6 Q-2 12 -8 0 Z" fill="#0D6938" />
          <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
        </g>
        {/* Right ornament */}
        <g transform="translate(180, 100) scale(0.6)">
          <path d="M8 0 Q2 -12 -8 -6 Q0 0 -8 6 Q2 12 8 0 Z" fill="#0D6938" />
          <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
        </g>

        {/* Inside Emblem: Caduceus / Flaming Torch with Twin Serpents and Wings */}
        <g id="CaduceusEmblem" transform="translate(100, 102) scale(0.85)">
          {/* Flame of the Torch */}
          <path
            d="M0 -58 C-5 -50 -10 -42 -4 -32 C-2 -29 -5 -24 0 -22 C5 -24 2 -29 4 -32 C10 -42 5 -50 0 -58 Z"
            fill="#FFFFFF"
          />
          <path
            d="M0 -52 C-3 -46 -6 -40 -2 -34 C-1 -32 -3 -28 0 -26 C3 -28 1 -32 2 -34 C6 -40 3 -46 0 -52 Z"
            fill="#0D6938"
            opacity="0.3"
          />

          {/* Torch Crown */}
          <path d="M-7 -22 L7 -22 L5 -16 L-5 -16 Z" fill="#FFFFFF" />
          <rect x="-4" y="-16" width="8" height="66" rx="2" fill="#FFFFFF" />
          <circle cx="0" cy="50" r="4" fill="#FFFFFF" />

          {/* Wings */}
          {/* Left Wing */}
          <path
            d="M-4 -20 C-18 -32 -42 -28 -56 -10 C-46 -1 -30 2 -4 -8 Z"
            fill="#FFFFFF"
            stroke="#094A27"
            strokeWidth="0.8"
          />
          <path
            d="M-8 -12 C-20 -18 -38 -15 -48 -2 C-38 3 -22 2 -6 -4 Z"
            fill="#FFFFFF"
            stroke="#094A27"
            strokeWidth="0.5"
          />
          {/* Right Wing */}
          <path
            d="M4 -20 C18 -32 42 -28 56 -10 C46 -1 30 2 4 -8 Z"
            fill="#FFFFFF"
            stroke="#094A27"
            strokeWidth="0.8"
          />
          <path
            d="M8 -12 C20 -18 38 -15 48 -2 C38 3 22 2 6 -4 Z"
            fill="#FFFFFF"
            stroke="#094A27"
            strokeWidth="0.5"
          />

          {/* Twin Entwined Serpents (Asclepius / Caduceus) */}
          {/* Left Serpent */}
          <path
            d="M-22 -8 C-20 -16 -4 -16 -2 -6 C0 4 -20 10 -20 20 C-20 30 -2 36 -2 46"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Right Serpent */}
          <path
            d="M22 -8 C20 -16 4 -16 2 -6 C0 4 20 10 20 20 C20 30 2 36 2 46"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Serpent Heads */}
          <path d="M-24 -9 C-27 -12 -23 -16 -19 -14 L-22 -8 Z" fill="#FFFFFF" />
          <path d="M24 -9 C27 -12 23 -16 19 -14 L22 -8 Z" fill="#FFFFFF" />
          {/* Serpent Scales detailing */}
          <circle cx="-10" cy="6" r="1.5" fill="#0D6938" />
          <circle cx="10" cy="6" r="1.5" fill="#0D6938" />
          <circle cx="-10" cy="30" r="1.5" fill="#0D6938" />
          <circle cx="10" cy="30" r="1.5" fill="#0D6938" />
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-semibold text-base sm:text-lg leading-tight tracking-tight text-slate-900 dark:text-white">
            โรงพยาบาลสังขละบุรี
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Sangkhlaburi Hospital · SKB Management System
          </span>
        </div>
      )}
    </div>
  );
};
