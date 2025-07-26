

import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: '#00F6FF'}} />
        <stop offset="100%" style={{stopColor: '#FF00E5'}} />
      </linearGradient>
      <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0, 246, 255, 0.3)" strokeWidth="2"/>
    <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(0, 246, 255, 0.2)" strokeWidth="1.5"/>
    <line x1="50" y1="5" x2="50" y2="25" stroke="rgba(0, 246, 255, 0.5)" strokeWidth="2"/>
    <line x1="50" y1="95" x2="50" y2="75" stroke="rgba(0, 246, 255, 0.5)" strokeWidth="2"/>
    <line x1="5" y1="50" x2="25" y2="50" stroke="rgba(0, 246, 255, 0.5)" strokeWidth="2"/>
    <line x1="95" y1="50" x2="75" y2="50" stroke="rgba(0, 246, 255, 0.5)" strokeWidth="2"/>
    <path
      d="M 50 20 L 75 70 L 50 60 L 25 70 Z"
      fill="url(#logo-gradient)"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinejoin="round"
      filter="url(#logo-glow)"
    />
  </svg>
);


export const ShipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 10.5h.008v.008h-.008v-.008z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.75a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

export const WalletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25-2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 3V9" />
  </svg>
);

export const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5l.415-.207a.75.75 0 011.085.67V10.5m0 0h6m-6 0a.75.75 0 001.085.67l.415-.207M8.25 10.5V7.5m0 3H6m2.25 0a.75.75 0 01.67-1.085l.415-.207M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
);

export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.57-1.023 1.53-1.802 2.7-2.223m-4.682 4.943a9 9 0 1011.162 0m-11.162 0c-1.168.42-2.13.998-2.7 2.223M12 12a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM19.5 12a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const TargetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>
);

export const ZapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

export const RadarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-2.469m-2.226-2.51l2.225-2.51m2.469-.568l2.469.569m0 0l2.225 2.51M13.684 16.6l5.432 5.432m0 0l-2.225-2.51m-5.432-5.432L6.316 21.672m0 0l-2.51-2.225.569-2.469m2.225-2.51l-2.225-2.51m-2.469.568L2.33 13.684m0 0L.105 8.252m0 0l2.225 2.51m5.432 5.432L10.9 2.33m0 0l2.51 2.225-.569 2.469m2.225 2.51l-2.225 2.51m2.469-.568l-2.469-.569m0 0L8.252.105m0 0L5.74 2.33l2.51 2.225.569-2.469m-2.225-2.51l2.225-2.51" />
    </svg>
);

export const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

export const ShipStatusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" />
    </svg>
);

export const DiamondIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <title>Gems</title>
      <defs>
          <radialGradient id="quantum-shard-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" style={{stopColor: 'rgb(199, 242, 255)', stopOpacity: 1}} />
              <stop offset="70%" style={{stopColor: 'rgb(0, 246, 255)', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: 'rgb(0, 180, 212)', stopOpacity: 1}} />
          </radialGradient>
      </defs>
      <path fill="url(#quantum-shard-gradient)" d="M12 2.162c-2.45.021-4.755.74-6.593 2.125-.42.316-.79.673-1.104 1.063L12 18.75l7.697-13.4C17.18 3.55 14.545 2.14 12 2.162z" />
      <path fill="url(#quantum-shard-gradient)" opacity="0.7" d="M4.303 5.35A10.45 10.45 0 0 0 2.25 10.5c0 1.95.538 3.789 1.47 5.333L12 18.75 4.303 5.35z" />
      <path fill="url(#quantum-shard-gradient)" opacity="0.7" d="M19.697 5.35L12 18.75l8.28-10.417A10.45 10.45 0 0 0 19.697 5.35z" />
      <path fill="url(#quantum-shard-gradient)" d="M12 18.75l-8.28-10.417a.75.75 0 0 1 .13-.974L12 2.162l8.15 5.197a.75.75 0 0 1 .13.974L12 18.75z" filter="url(#glow)" />
  </svg>
);


export const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m9.375 0H9.375" />
    </svg>
);

export const QrCodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5zM3.75 15a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5zM15 3.75a.75.75 0 00-.75.75v4.5a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75v-4.5a.75.75 0 00-.75-.75h-4.5zM13.5 15a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75zm-3.75-3.75a.75.75 0 00-.75.75v.75c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75v-.75a.75.75 0 00-.75-.75h-.75z" />
    </svg>
);

export const BtcIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.32 13.23c-.23.18-.5.28-.75.28h-1.6v2.24c0 .41-.34.75-.75.75s-.75-.34-.75-.75V15.5h-.72v2.24c0 .41-.34.75-.75.75s-.75-.34-.75-.75V15.5H8.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.76V11.5H8.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.76V8.25c0-.41.34-.75.75-.75s.75.34.75.75V10h.72V8.25c0-.41.34-.75.75-.75s.75.34.75.75V10h1.6c.25 0 .52.09.75.28.62.5 1 1.36 1 2.22s-.38 1.72-1 2.22zm-2.47-3.48v2.73h1.35c.34 0 .62-.28.62-.62 0-.6-.5-1.12-1.07-1.2v-.03c.42-.1.75-.51.75-.98 0-.62-.51-1.15-1.2-1.15h-.45z" />
    </svg>
);

export const SolanaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M6.333 17.567c.38-.21.72-.46.99-.78l.01-.01c.27-.32.49-.69.63-1.1l8.724-15.11c.14-.24.06-.55-.18-.69a.485.485 0 00-.55.06L7.234 14.857c-.14.24-.06.55.18.69.24.14.55.06.69-.18l7.263-12.58-7.264 12.58c-.14.24-.06.55.18.69.24.14.55.06.69-.18l.001-.001 5.968-10.336-7.264 12.582c-.14.24-.06.55.18.69.24.14.55.06.69-.18l4.672-8.092-7.263 12.58c-.14.24-.06.55.18.69.24.14.55.06.69-.18l3.378-5.85-7.265 12.582c-.14.24-.06.55.18.69.24.14.55.06.69-.18l2.08-3.605-4.81 8.33c-.14.24-.06.55.18.69.24.14.55.06.69-.18l3.48-6.028-1.748 3.028c-.14.24-.06.55.18.69.24.14.55.06.69-.18l.35-.606.35.606c.14.24.45.32.69.18.24-.14.32-.45.18-.69l-1.748-3.028 3.48 6.028c.14.24.45.32.69.18.24-.14.32-.45.18-.69l-4.81-8.33 2.08 3.605c.14.24.45.32.69.18.24-.14.32-.45.18-.69l-7.265-12.582 3.378 5.85c.14.24.45.32.69.18.24-.14.32-.45.18-.69L9.67 3.33l7.263 12.58c.14.24.45.32.69.18.24-.14.32-.45.18-.69l-5.968-10.336.001.001c.14-.24.45-.32.69-.18.24.14.32-.45.18-.69l-7.264-12.58c.24-.14.55-.06.69.18l.18.31 8.724 15.11c.14.41.36.78.63 1.1l.01.01c.27.32.61.57.99.78l-3.48-6.028c-.14-.24-.45-.32-.69-.18-.24.14-.32-.45-.18-.69l4.81 8.33c.14.24.45.32.69.18.24-.14.32-.45.18-.69l-2.08-3.605-3.378 5.85c-.14.24-.45.32-.69-.18-.24.14-.32-.45-.18-.69l7.264-12.582-4.672 8.092c-.14.24-.45.32.69-.18-.24.14.32-.45-.18-.69L19.49 1.44l-8.724 15.11c-.14.24-.45.32-.69.18-.24-.14-.32-.45-.18-.69l7.263-12.58-7.263 12.58c-.14.24-.45.32-.69.18-.24-.14.32-.45-.18-.69l.001-.001 5.968-10.336-7.264 12.582c-.14.24-.45.32-.69.18-.24-.14.32-.45-.18-.69l4.672-8.092L7.234 14.857c.14.24.06.55-.18.69-.24.14-.55.06-.69-.18l-1.39-2.408c-.14-.24.06-.55.18-.69a.485.485 0 01.55.06l.18.31z" />
    </svg>
);
export const UsdcIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 3.03c-3.14 0-5.733 2.126-6.61 5.01h3.337c.783-1.383 2.21-2.31 3.823-2.31.25 0 .48.03.71.06v-2.82c-.23-.02-.47-.04-.71-.04zm0 13.94c3.14 0 5.733-2.126 6.61-5.01h-3.337c-.783 1.383-2.21 2.31-3.823-2.31-.25 0-.48-.03-.71-.06v2.82c.23.02.47.04.71.04zm3.82-5.62c.483 0 .87-.387.87-.87v-3.03c0-.483-.387-.87-.87-.87h-7.64c-.483 0-.87.387.87.87v3.03c0 .483.387.87.87.87h7.64z" />
    </svg>
);

// Added Icons
export const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9 9 0 119 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 18.75h-15V15.75c0-1.023.422-1.95 1.106-2.634l3.14-3.141a2.25 2.25 0 013.182 0l3.14 3.141c.684.684 1.106 1.612 1.106 2.634v3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75V11.25m4.5 4.5V11.25m-9 4.5V11.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a2.25 2.25 0 012.25 2.25H9.75a2.25 2.25 0 012.25-2.25z" />
  </svg>
);

export const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

export const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

export const DecoyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
    </svg>
);

export const VolleyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
  </svg>
);

export const EMPIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

export const ChevronUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </svg>
);

export const TargetReticuleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="3" strokeDasharray="10 5" opacity="0.7" />
    <path d="M50 5V25M50 95V75M5 50H25M95 50H75" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="3" />
  </svg>
);


// RANK ICONS
export const CadetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 15l-4-4h8z"/></svg>
);
export const EnsignIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 15l-4-4h8zM12 9l-4-4h8z"/></svg>
);
export const LieutenantIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 15l-4-4h8zM12 9l-4-4h8zM12 3l-4-4h8z" transform="translate(0, 4)"/></svg>
);
export const CommanderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="2"/></svg>
);
export const CaptainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2l2.5 7h-5zM12 22l-2.5-7h5zM2 12l7-2.5v5zM22 12l-7-2.5v5z"/></svg>
);
export const CommodoreIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2l3 6h-6zM12 22l-3-6h6zM4 12l6 3v-6zM20 12l-6 3v-6z"/></svg>
);
export const RearAdmiralIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 5.5l6 6-6 6-6-6z"/></svg>
);
export const ViceAdmiralIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 5.5l6 6-6 6-6-6zM12 17.5l6 6-6-6-6 6z" transform="translate(0, -6)"/></svg>
);
export const AdmiralIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2l6 6-6 6-6-6zM12 14l6 6-6 6-6-6z"/></svg>
);
export const GrandAdmiralIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2l6 6-6 6-6-6zM12 14l6 6-6 6-6-6zM2 12h20M12 2v20"/></svg>
);

// Missing Icons for ProvablyFairView and PresaleView
export const ShieldCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

export const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const CodeBracketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
);

export const DocumentTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

export const RANK_ICONS: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  cadet: CadetIcon,
  ensign: EnsignIcon,
  lieutenant: LieutenantIcon,
  commander: CommanderIcon,
  captain: CaptainIcon,
  commodore: CommodoreIcon,
  rear_admiral: RearAdmiralIcon,
  vice_admiral: ViceAdmiralIcon,
  admiral: AdmiralIcon,
  grand_admiral: GrandAdmiralIcon,
};

export const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);