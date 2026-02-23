import { describe, it, expect } from 'vitest';
import { iconMap, availableIcons } from '../tracking-types';

describe('tracking-types', () => {
  it('iconMap contains all expected icons', () => {
    const expectedIcons = [
      'droplets', 'brain', 'dumbbell', 'book-open',
      'coffee', 'sun', 'moon', 'heart', 'utensils',
    ];
    expectedIcons.forEach((name) => {
      expect(iconMap[name]).toBeDefined();
    });
  });

  it('availableIcons matches iconMap keys', () => {
    expect(availableIcons).toEqual(Object.keys(iconMap));
  });

  it('every iconMap entry is a renderable component', () => {
    availableIcons.forEach((name) => {
      const Icon = iconMap[name];
      // Lucide icons are ForwardRefExoticComponent (object with $$typeof)
      expect(Icon).toBeDefined();
      expect(typeof Icon === 'function' || typeof Icon === 'object').toBe(true);
    });
  });
});
