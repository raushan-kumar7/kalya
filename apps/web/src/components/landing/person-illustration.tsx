'use client';

import * as React from 'react';

export interface PersonIllustrationProps {
  isSmiling?: boolean;
  activeFeature?: 'track' | 'budget' | 'split' | 'goals' | 'wealth' | 'statements';
  className?: string;
}

/**
 * Flat vector illustration of a friendly young professional holding a phone.
 * Styled in Kalya brand colors: forest green (#0d3e26), gold (#b8912e), warm off-white (#f9f8f6).
 * Features calm vs smiling states and contextual feature props.
 * SVG size is ~12 KB, highly performant and responsive.
 */
export function PersonIllustration({
  isSmiling = false,
  activeFeature = 'track',
  className = '',
}: PersonIllustrationProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 280 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-70 max-h-80 drop-shadow-sm select-none"
        aria-label="Illustration of a person using Kalya on their phone."
      >
        <defs>
          {/* Subtle brand glow behind head */}
          <radialGradient id="headGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#b8912e" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#b8912e" stopOpacity="0" />
          </radialGradient>

          {/* Skin tones */}
          <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5d0a9" />
            <stop offset="100%" stopColor="#e5b88c" />
          </linearGradient>

          {/* Hair tone */}
          <linearGradient id="hair" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2c221e" />
            <stop offset="100%" stopColor="#1a1412" />
          </linearGradient>

          {/* Shirt / Blazer in Brand Forest Green */}
          <linearGradient id="blazer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#165b38" />
            <stop offset="100%" stopColor="#0d3e26" />
          </linearGradient>

          {/* Inner Shirt in Crisp Off-white */}
          <linearGradient id="innerShirt" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f0eee9" />
          </linearGradient>

          {/* Gold Accent for phone & badge */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2c163" />
            <stop offset="100%" stopColor="#b8912e" />
          </linearGradient>

          {/* Shadow */}
          <ellipse
            id="baseShadow"
            cx="140"
            cy="305"
            rx="75"
            ry="10"
            fill="#0d3e26"
            fillOpacity="0.08"
          />
        </defs>

        {/* Base ground shadow */}
        <use href="#baseShadow" />

        {/* Aura glow */}
        <circle cx="140" cy="110" r="85" fill="url(#headGlow)" />

        {/* Torso / Blazer */}
        <path d="M75 310 C75 250 95 210 140 210 C185 210 205 250 205 310 Z" fill="url(#blazer)" />

        {/* Inner Shirt Collar (V-neck) */}
        <path d="M125 210 L140 248 L155 210 Z" fill="url(#innerShirt)" />
        {/* Subtle Collar lapels */}
        <path d="M110 210 L130 252 L122 254 L102 210 Z" fill="#0a3019" />
        <path d="M170 210 L150 252 L158 254 L178 210 Z" fill="#0a3019" />

        {/* Neck */}
        <path d="M127 175 C127 195 130 212 140 212 C150 212 153 195 153 175 Z" fill="url(#skin)" />
        {/* Neck shadow */}
        <path
          d="M128 185 C135 192 145 192 152 185 L153 192 C145 200 135 200 127 192 Z"
          fill="#d4a377"
          opacity="0.6"
        />

        {/* Head / Face */}
        <path
          d="M112 135 C112 95 168 95 168 135 C168 168 152 188 140 188 C128 188 112 168 112 135 Z"
          fill="url(#skin)"
        />

        {/* Ears */}
        <circle cx="111" cy="138" r="7" fill="url(#skin)" />
        <circle cx="169" cy="138" r="7" fill="url(#skin)" />

        {/* Modern Haircut */}
        <path
          d="M108 126 C106 100 120 78 142 78 C164 78 174 92 172 118 C168 110 162 108 155 108 C145 108 135 116 122 116 C115 116 111 120 108 126 Z"
          fill="url(#hair)"
        />
        {/* Sideburns */}
        <path d="M111 126 L111 138 L114 135 Z" fill="url(#hair)" />
        <path d="M169 126 L169 138 L166 135 Z" fill="url(#hair)" />

        {/* Eyebrows */}
        <path
          d="M122 124 Q128 121 134 123"
          stroke="#1a1412"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M146 123 Q152 121 158 124"
          stroke="#1a1412"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Eyes: Calm vs Smiling */}
        {isSmiling ? (
          <>
            {/* Happy squint arcs */}
            <path
              d="M123 133 Q128 129 133 133"
              stroke="#1a1412"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M147 133 Q152 129 157 133"
              stroke="#1a1412"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Soft pink cheek blush */}
            <ellipse cx="120" cy="144" rx="4.5" ry="2.5" fill="#e27f6e" fillOpacity="0.45" />
            <ellipse cx="160" cy="144" rx="4.5" ry="2.5" fill="#e27f6e" fillOpacity="0.45" />
          </>
        ) : (
          <>
            {/* Calm attentive eyes */}
            <circle cx="128" cy="133" r="2.8" fill="#1a1412" />
            <circle cx="152" cy="133" r="2.8" fill="#1a1412" />
            <circle cx="129" cy="132" r="0.8" fill="#ffffff" />
            <circle cx="153" cy="132" r="0.8" fill="#ffffff" />
          </>
        )}

        {/* Nose */}
        <path
          d="M139 132 L137 146 L143 146"
          stroke="#d4a377"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Mouth: Calm vs Warm Smile */}
        {isSmiling ? (
          <path
            d="M131 156 Q140 167 149 156"
            stroke="#964032"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="#ffffff"
          />
        ) : (
          <path
            d="M134 158 Q140 161 146 158"
            stroke="#964032"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Arms holding the smartphone */}
        {/* Left arm */}
        <path
          d="M85 285 C85 245 105 240 128 260 L124 278 C108 262 98 268 98 295 Z"
          fill="url(#blazer)"
        />
        {/* Right arm */}
        <path
          d="M195 285 C195 245 175 240 152 260 L156 278 C172 262 182 268 182 295 Z"
          fill="url(#blazer)"
        />

        {/* Hands */}
        <path
          d="M123 256 C121 248 129 242 136 248 L138 272 C132 274 124 268 123 256 Z"
          fill="url(#skin)"
        />
        <path
          d="M157 256 C159 248 151 242 144 248 L142 272 C148 274 156 268 157 256 Z"
          fill="url(#skin)"
        />

        {/* Smartphone */}
        <g transform="translate(122, 230)">
          {/* Phone Body */}
          <rect
            x="0"
            y="0"
            width="36"
            height="62"
            rx="6"
            fill="#16241d"
            stroke="#b8912e"
            strokeWidth="1.5"
          />
          {/* Screen */}
          <rect x="2.5" y="3" width="31" height="56" rx="4" fill="#0d3e26" />
          {/* Screen mini UI elements */}
          {/* Mini Header */}
          <rect x="6" y="8" width="14" height="2.5" rx="1" fill="#b8912e" />
          <circle cx="28" cy="9" r="1.5" fill="#4fbd84" />
          {/* Mini 50/30/20 graph bars */}
          <rect x="6" y="16" width="24" height="3" rx="1.5" fill="#1e7a4c" />
          <rect x="6" y="22" width="18" height="3" rx="1.5" fill="#b8912e" />
          <rect x="6" y="28" width="22" height="3" rx="1.5" fill="#4fbd84" />
          {/* Green pulse ring */}
          <circle cx="18" cy="42" r="6" fill="#3fa873" fillOpacity="0.25" />
          <circle cx="18" cy="42" r="3" fill="#3fa873" />
        </g>

        {/* Dynamic Contextual Feature Prop */}
        {activeFeature === 'wealth' && (
          <g className="transition-all duration-300 transform animate-bounce">
            {/* Gold Bullion Prop beside person */}
            <g transform="translate(195, 120)">
              <rect
                x="0"
                y="5"
                width="38"
                height="20"
                rx="3"
                fill="url(#goldGrad)"
                stroke="#8a6a16"
                strokeWidth="1"
              />
              <path d="M4 8 L34 8" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
              <text
                x="7"
                y="18"
                fill="#16241d"
                fontSize="7"
                fontWeight="bold"
                fontFamily="monospace"
              >
                999.9 AU
              </text>
            </g>
          </g>
        )}

        {activeFeature === 'split' && (
          <g className="transition-all duration-300">
            {/* Split Receipt / UPI Badge Prop */}
            <g transform="translate(50, 125)">
              <rect
                x="0"
                y="0"
                width="36"
                height="42"
                rx="3"
                fill="#ffffff"
                stroke="#b8912e"
                strokeWidth="1"
              />
              <path
                d="M6 8 H30 M6 14 H24 M6 20 H28 M6 28 H30"
                stroke="#0d3e26"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle cx="28" cy="34" r="3" fill="#1e7a4c" />
              <text x="6" y="36" fill="#1e7a4c" fontSize="6.5" fontWeight="bold">
                UPI ₹
              </text>
            </g>
          </g>
        )}

        {activeFeature === 'goals' && (
          <g className="transition-all duration-300">
            {/* Bullseye Target Prop */}
            <g transform="translate(195, 125)">
              <circle cx="18" cy="18" r="16" fill="#f7e5e0" stroke="#b00020" strokeWidth="1.5" />
              <circle cx="18" cy="18" r="11" fill="#ffffff" stroke="#b00020" strokeWidth="1.5" />
              <circle cx="18" cy="18" r="5" fill="#b00020" />
            </g>
          </g>
        )}

        {activeFeature === 'budget' && (
          <g className="transition-all duration-300">
            {/* 50/30/20 Badge Prop */}
            <g transform="translate(50, 125)">
              <circle cx="18" cy="18" r="18" fill="#e4eee8" stroke="#0d3e26" strokeWidth="1.5" />
              <text x="6" y="16" fill="#0d3e26" fontSize="7" fontWeight="bold">
                50/30
              </text>
              <text x="12" y="25" fill="#b8912e" fontSize="7" fontWeight="bold">
                /20
              </text>
            </g>
          </g>
        )}

        {activeFeature === 'track' && (
          <g className="transition-all duration-300">
            {/* Rupee Payment Card Prop */}
            <g transform="translate(50, 130)">
              <rect
                x="0"
                y="0"
                width="38"
                height="26"
                rx="4"
                fill="#0d3e26"
                stroke="#b8912e"
                strokeWidth="1"
              />
              <rect x="5" y="6" width="8" height="6" rx="1.5" fill="#b8912e" />
              <text x="17" y="12" fill="#ffffff" fontSize="6" fontWeight="bold">
                ₹ RUPEE
              </text>
            </g>
          </g>
        )}

        {activeFeature === 'statements' && (
          <g className="transition-all duration-300">
            {/* Branded Statement Document Prop */}
            <g transform="translate(195, 125)">
              <rect
                x="0"
                y="0"
                width="34"
                height="42"
                rx="3"
                fill="#ffffff"
                stroke="#0d3e26"
                strokeWidth="1"
              />
              <rect x="4" y="6" width="16" height="3" rx="1" fill="#0d3e26" />
              <path
                d="M4 14 H30 M4 20 H26 M4 26 H22"
                stroke="#6a7279"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <rect x="4" y="32" width="14" height="5" rx="1.5" fill="#b8912e" />
              <text x="6" y="36" fill="#ffffff" fontSize="4.5" fontWeight="bold">
                PDF
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
