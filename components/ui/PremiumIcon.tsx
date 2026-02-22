import React from 'react';

interface PremiumIconProps {
  icon: string;
  className?: string;
  size?: number;
}

export function PremiumIcon({ icon, className = "", size = 24 }: PremiumIconProps) {
  const getIcon = () => {
    switch (icon) {
      // Property Icons
      case 'mansion':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'building':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="2" x2="9" y2="22" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="2" x2="15" y2="22" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'villa':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 2l10 9h-3v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8H2l10-9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M7 20v-6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        );
      
      // Location Icons
      case 'location':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'map':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2 1,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <line x1="8" y1="2" x2="8" y2="18" stroke="currentColor" strokeWidth="2"/>
            <line x1="16" y1="6" x2="16" y2="22" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      
      // Money/Investment Icons
      case 'money':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'investment':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 20v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'chart':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2"/>
            <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      
      // AI/Tech Icons
      case 'ai':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="20" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="4" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="6" x2="12" y2="9" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="15" x2="12" y2="18" stroke="currentColor" strokeWidth="2"/>
            <line x1="6" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'brain':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M9.5 2A2.5 2.5 0 0 0 7 4.5c0 1.38.5 2.5 1.5 3.19A8 8 0 0 0 8.5 12a8 8 0 0 0 0 4.31c-1 .69-1.5 1.81-1.5 3.19A2.5 2.5 0 0 0 9.5 22c1.38 0 2.5-.5 3.19-1.5A8 8 0 0 0 16 20.5a8 8 0 0 0 4.31 0c.69 1 1.81 1.5 3.19 1.5a2.5 2.5 0 0 0 0-5c-1.38 0-2.5.5-3.19 1.5A8 8 0 0 0 16 3.5a8 8 0 0 0-4.31 0c-.69-1-1.81-1.5-3.19-1.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        );
      
      // Search/Filter Icons
      case 'search':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'filter':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        );
      
      // Quality/Premium Icons
      case 'diamond':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M6 3h12l4 6-10 13L2 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M6 3l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M12 9l4 6-4 7-4-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        );
      case 'crown':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        );
      
      // Utility Icons
      case 'trending':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <polyline points="17,6 23,6 23,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        );
      case 'analytics':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        );
      
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
    }
  };

  return getIcon();
}
