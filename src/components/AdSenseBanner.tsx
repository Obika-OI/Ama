import React, { useEffect, useRef } from 'react';
import { Crown, Sparkles, Megaphone } from 'lucide-react';

interface AdSenseBannerProps {
  isPremium?: boolean;
  onOpenSubscriptionModal?: () => void;
  slotId?: string;
  adClient?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  isPremium = false,
  onOpenSubscriptionModal,
  slotId = '1234567890',
  adClient = 'ca-pub-5528750606185925',
  format = 'auto',
  className = ''
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  // If user is on Ama Premium / Pro, NEVER display ads!
  if (isPremium) {
    return null;
  }

  useEffect(() => {
    // Attempt to load Google AdSense if available in production environment
    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || [];
        // Only push if there is an unfulfilled adsbygoogle tag
        if ((window as any).adsbygoogle) {
          adsbygoogle.push({});
        }
      }
    } catch (e) {
      // Benign catch in preview sandbox or when ad blocker is active
    }
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 p-3 sm:p-4 text-center transition-all ${className}`}
    >
      {/* Ad Tag Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200/60 text-[10px] font-bold uppercase tracking-wider text-gray-600">
        <div className="flex items-center gap-1.5">
          <Megaphone className="w-3 h-3 text-gray-500" />
          <span>Sponsored Advertisement</span>
        </div>
        {onOpenSubscriptionModal && (
          <button
            type="button"
            onClick={onOpenSubscriptionModal}
            className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 hover:text-amber-800 transition-colors bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-full cursor-pointer border-none"
          >
            <Crown className="w-2.5 h-2.5" />
            <span>Remove Ads with Pro</span>
          </button>
        )}
      </div>

      {/* Official Google AdSense Tag Container */}
      <div ref={adRef} className="w-full flex items-center justify-center min-h-[60px] sm:min-h-[80px]">
        {/* Real AdSense <ins> element */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '60px' }}
          data-ad-client={adClient}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />

        {/* Clean, Non-Intrusive Freemium Sponsor Fallback when live ads are loading or in sandbox */}
        <div className="w-full py-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 text-lg">
              🍼
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">
                Support Free Infant Care Tools
              </p>
              <p className="text-[11px] text-gray-500 font-medium">
                AdSense helps keep daily meal logging & growth trackers free for all families.
              </p>
            </div>
          </div>
          {onOpenSubscriptionModal && (
            <button
              type="button"
              onClick={onOpenSubscriptionModal}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs cursor-pointer border-none shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Go Ad-Free</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
