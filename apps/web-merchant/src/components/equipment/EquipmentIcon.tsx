import { cn } from '@/lib/utils';
import { getEquipmentIcon } from '@/lib/equipment-icons';

interface EquipmentIconProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function EquipmentIcon({ type, size = 'md', className }: EquipmentIconProps) {
  const { icon: Icon, color, bgColor } = getEquipmentIcon(type);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center',
        sizeClasses[size],
        bgColor,
        className
      )}
    >
      <Icon className={cn(iconSizes[size], color)} />
    </div>
  );
}
