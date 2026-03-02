/**
 * Hook for user preferences that apply across the app.
 * Uses the widget_settings backend for persistence.
 */
import { useWidgetSettings } from './useWidgetSettings';

export type WeekStartDay = 0 | 1; // 0 = Sunday, 1 = Monday

export interface UserPreferences {
  weekStartsOn: WeekStartDay;
}

const defaultPreferences: UserPreferences = {
  weekStartsOn: 1, // Default to Monday
};

export function useUserPreferences() {
  const { settings, loading, updateSettings } = useWidgetSettings<UserPreferences>(
    'user-preferences',
    defaultPreferences,
  );

  const setWeekStartsOn = (day: WeekStartDay) => {
    updateSettings({ weekStartsOn: day });
  };

  return {
    preferences: settings,
    loading,
    setWeekStartsOn,
    updatePreferences: updateSettings,
  };
}
