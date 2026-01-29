import React from 'react';
import { Platform } from '../types';
import { PLATFORMS } from '../constants';

interface PlatformNameProps {
  platform: Platform;
  className?: string;
  isOnBrandBg?: boolean;
}

export const PlatformName: React.FC<PlatformNameProps> = ({ platform, className = "", isOnBrandBg = false }) => {
  const config = PLATFORMS[platform];
  const name = config.name;
  const firstChar = name.charAt(0);
  const rest = name.slice(1);
  const brandColor = config.colors.default;

  // If on brand background, avoid coloring the letter with brand color (it would be invisible)
  if (isOnBrandBg) {
      return <span className={className}>{name}</span>;
  }

  return (
    <span className={className}>
      <span style={{ color: brandColor }}>{firstChar}</span>
      {rest}
    </span>
  );
};
