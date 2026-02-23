import {
  Droplets, Brain, Dumbbell, BookOpen, Coffee,
  Sun, Moon, Heart, Utensils,
} from 'lucide-react';

// Icon map for routine icons
export const iconMap: Record<string, React.ElementType> = {
  droplets: Droplets,
  brain: Brain,
  dumbbell: Dumbbell,
  'book-open': BookOpen,
  coffee: Coffee,
  sun: Sun,
  moon: Moon,
  heart: Heart,
  utensils: Utensils,
};

export const availableIcons = Object.keys(iconMap);
