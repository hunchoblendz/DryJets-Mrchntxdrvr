import {
  Waves,
  Wind,
  Shirt,
  Flame,
  ArrowRightCircle,
  Zap,
  Droplets,
  Package,
  Thermometer,
  CircleDot,
  type LucideIcon,
} from 'lucide-react';

export type EquipmentType =
  | 'WASHER'
  | 'DRYER'
  | 'PRESSER'
  | 'STEAM_BOILER'
  | 'WATER_HEATER'
  | 'CONVEYOR'
  | 'IRONING_STATION'
  | 'CHEMICAL_DISPENSER'
  | 'AIR_COMPRESSOR'
  | 'FOLDING_TABLE'
  | 'VACUUM_PUMP'
  | 'OTHER';

interface EquipmentIconConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  label: string;
}

export const EQUIPMENT_ICONS: Record<EquipmentType, EquipmentIconConfig> = {
  WASHER: {
    icon: Waves,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    label: 'Washing Machine',
  },
  DRYER: {
    icon: Wind,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-950',
    label: 'Dryer',
  },
  PRESSER: {
    icon: Shirt,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
    label: 'Presser',
  },
  STEAM_BOILER: {
    icon: Flame,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-950',
    label: 'Steam Boiler',
  },
  WATER_HEATER: {
    icon: Thermometer,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100 dark:bg-rose-950',
    label: 'Water Heater',
  },
  CONVEYOR: {
    icon: ArrowRightCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-950',
    label: 'Conveyor System',
  },
  IRONING_STATION: {
    icon: Zap,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-950',
    label: 'Ironing Station',
  },
  CHEMICAL_DISPENSER: {
    icon: Droplets,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100 dark:bg-cyan-950',
    label: 'Chemical Dispenser',
  },
  AIR_COMPRESSOR: {
    icon: Wind,
    color: 'text-sky-600',
    bgColor: 'bg-sky-100 dark:bg-sky-950',
    label: 'Air Compressor',
  },
  FOLDING_TABLE: {
    icon: Package,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 dark:bg-indigo-950',
    label: 'Folding Table',
  },
  VACUUM_PUMP: {
    icon: CircleDot,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100 dark:bg-teal-950',
    label: 'Vacuum Pump',
  },
  OTHER: {
    icon: CircleDot,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100 dark:bg-gray-950',
    label: 'Equipment',
  },
};

export function getEquipmentIcon(type: string): EquipmentIconConfig {
  const normalizedType = type.toUpperCase() as EquipmentType;
  return EQUIPMENT_ICONS[normalizedType] || EQUIPMENT_ICONS.OTHER;
}

export function getEquipmentColor(type: string): string {
  return getEquipmentIcon(type).color;
}

export function getEquipmentBgColor(type: string): string {
  return getEquipmentIcon(type).bgColor;
}

export function getEquipmentLabel(type: string): string {
  return getEquipmentIcon(type).label;
}
