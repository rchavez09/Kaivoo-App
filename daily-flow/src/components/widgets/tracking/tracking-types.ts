import {
  Droplets, Brain, Dumbbell, BookOpen, Coffee,
  Sun, Moon, Heart, Utensils, Target, Flame,
  Footprints, Palette, BedDouble, Apple, Music,
  Leaf, Sparkles, Smartphone, Ban, Pencil, Eye,
} from 'lucide-react';

// Icon map for routine & habit icons
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
  target: Target,
  flame: Flame,
  footprints: Footprints,
  palette: Palette,
  'bed-double': BedDouble,
  apple: Apple,
  music: Music,
  leaf: Leaf,
  sparkles: Sparkles,
  smartphone: Smartphone,
  ban: Ban,
  pencil: Pencil,
  eye: Eye,
};

export const availableIcons = Object.keys(iconMap);
