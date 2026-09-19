import React, { useState } from 'react';
import { OGOO_AVATAR_PRIMARY, OGOO_AVATAR_FALLBACK } from '../constants/ogoo';
import { Sparkles, Bot } from 'lucide-react';

export interface OgooAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  hasPulse?: boolean;
  isThinking?: boolean;
  showOnlineDot?: boolean;
  showSparkleBadge?: boolean;
  alt?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const SIZE_MAP = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

export const OgooAvatar: React.FC<OgooAvatarProps> = ({
  size = 'md',
  className = '',
  hasPulse = false,
  isThinking = false,
  showOnlineDot = false,
  showSparkleBadge = false,
  alt = 'Ogoo AI Agent',
  onClick
}) => {
  const [imgSrc, setImgSrc] = useState<string>(OGOO_AVATAR_PRIMARY);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (imgSrc === OGOO_AVATAR_PRIMARY) {
      setImgSrc(OGOO_AVATAR_FALLBACK);
    } else {
      setHasError(true);
    }
  };

  const dimensionClass = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div 
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative inline-flex items-center justify-center shrink-0 ${dimensionClass} ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''} ${className}`}
    >
      {/* Active Pulse Ring */}
      {hasPulse && (
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
      )}

      {/* Thinking Glow */}
      {isThinking && (
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary-light via-sky-400 to-primary animate-spin blur-xs opacity-75" />
      )}

      {/* Avatar Container */}
      <div className="relative w-full h-full rounded-full overflow-hidden bg-white shadow-xs border border-primary/20 flex items-center justify-center">
        {!hasError ? (
          <img
            src={imgSrc}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={handleError}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white">
            <Bot className="w-1/2 h-1/2" />
          </div>
        )}
      </div>

      {/* Online indicator dot */}
      {showOnlineDot && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full shadow-xs" />
      )}

      {/* Proactive Research Sparkle Badge */}
      {showSparkleBadge && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center shadow-xs border border-white">
          <Sparkles className="w-2.5 h-2.5" />
        </span>
      )}
    </div>
  );
};
