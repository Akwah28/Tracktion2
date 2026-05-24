import React from 'react';
import * as Lucide from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = '', size = 20 }) => {
  // Safe guard fallback if icon doesn't exist
  const IconComponent = (Lucide as any)[name];

  if (!IconComponent) {
    // Return a default icon like Flame if missing
    return <Lucide.Flame className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
};

export default DynamicIcon;
