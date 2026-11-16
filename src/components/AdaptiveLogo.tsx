import React from 'react';
import { OFFICIAL_LOGOS } from '../lib/media';

interface AdaptiveLogoProps {
  /**
   * 'horizontal' -> Desktop header, nav, banners, B2B wide cards
   * 'vertical'   -> Footer stacked column, brand intro, vertical storytelling
   * 'auto'       -> Responsive: horizontal on compact/mobile/wide bars, vertical on md+ portrait cards
   */
  variant?: 'horizontal' | 'vertical' | 'auto';
  /**
   * 'light' -> Directly renders original forest-green artwork on Warm Ivory / White
   * 'dark'  -> Wraps untouched original artwork inside a crisp Warm Ivory architectural plaque
   */
  surface?: 'light' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<'horizontal' | 'vertical', Record<'xs' | 'sm' | 'md' | 'lg', string>> = {
  horizontal: {
    xs: 'h-7 w-auto max-w-[140px]',
    sm: 'h-8 sm:h-9 w-auto max-w-[180px]',
    md: 'h-10 sm:h-12 w-auto max-w-[230px]',
    lg: 'h-14 sm:h-16 w-auto max-w-[300px]',
  },
  vertical: {
    xs: 'h-14 w-auto max-w-[120px]',
    sm: 'h-20 w-auto max-w-[160px]',
    md: 'h-28 w-auto max-w-[210px]',
    lg: 'h-36 w-auto max-w-[260px]',
  },
};

export const AdaptiveLogo: React.FC<AdaptiveLogoProps> = ({
  variant = 'horizontal',
  surface = 'light',
  size = 'sm',
  className = '',
}) => {
  const wrapperClass =
    surface === 'dark'
      ? 'inline-flex items-center justify-center bg-[#F8F5EF] px-3.5 py-2 rounded-md border border-[#C6A667]/25'
      : 'inline-flex items-center justify-center';

  if (variant === 'auto') {
    return (
      <span className={`${wrapperClass} ${className}`}>
        <img
          src={OFFICIAL_LOGOS.horizontal}
          alt="ROAR COFFEE® — Igniting Courage. Defining Character."
          className={`md:hidden object-contain select-none ${SIZE_CLASSES.horizontal[size]}`}
          referrerPolicy="no-referrer"
        />
        <img
          src={OFFICIAL_LOGOS.vertical}
          alt="ROAR COFFEE® — Igniting Courage. Defining Character."
          className={`hidden md:block object-contain select-none ${SIZE_CLASSES.vertical[size]}`}
          referrerPolicy="no-referrer"
        />
      </span>
    );
  }

  const src = variant === 'vertical' ? OFFICIAL_LOGOS.vertical : OFFICIAL_LOGOS.horizontal;
  return (
    <span className={`${wrapperClass} ${className}`}>
      <img
        src={src}
        alt="ROAR COFFEE® — Igniting Courage. Defining Character."
        className={`object-contain select-none ${SIZE_CLASSES[variant][size]}`}
        referrerPolicy="no-referrer"
      />
    </span>
  );
};
