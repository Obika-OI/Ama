import React, { useEffect, useRef } from 'react';

interface AdSenseBannerProps {
  isPremium?: boolean;
  slotId?: string;
  adClient?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  isPremium = false,
  slotId,
  adClient = 'ca-pub-5528750606185925',
  format = 'auto',
  className = ''
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  // Never display ads for premium subscribers
  if (isPremium) {
    return null;
  }

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      // Benign catch when running in development sandbox or with ad blockers
    }
  }, []);

  if (!slotId) {
    return null;
  }

  return (
    <div className={`w-full overflow-hidden my-4 text-center ${className}`}>
      <div ref={adRef} className="w-full flex justify-center items-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={adClient}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
