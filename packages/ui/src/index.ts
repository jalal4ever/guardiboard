import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const severityColors = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-blue-500 text-white',
  info: 'bg-gray-500 text-white',
} as const;

export const severityTextColors = {
  critical: 'text-red-600',
  high: 'text-orange-500',
  medium: 'text-yellow-600',
  low: 'text-blue-600',
  info: 'text-gray-600',
} as const;

export const statusColors = {
  active: 'bg-green-500 text-white',
  suspended: 'bg-red-500 text-white',
  pending: 'bg-yellow-500 text-white',
  collecting: 'bg-blue-500 text-white',
  error: 'bg-red-500 text-white',
  disabled: 'bg-gray-500 text-white',
  open: 'bg-yellow-500 text-white',
  in_progress: 'bg-blue-500 text-white',
  resolved: 'bg-green-500 text-white',
  accepted_risk: 'bg-gray-500 text-white',
} as const;

export const scopeColors = {
  hybrid: 'bg-sky-600 text-white',
  ad: 'bg-blue-600 text-white',
  m365: 'bg-teal-500 text-white',
} as const;
