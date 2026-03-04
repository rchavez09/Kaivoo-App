import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { User, Bell, Palette, Database, Keyboard, Bot, Key, ChevronLeft } from 'lucide-react';
import AISettingsCard from '@/components/AISettingsCard';
import AIProviderSettings from '@/components/settings/AIProviderSettings';
import LicenseSettings from '@/components/settings/LicenseSettings';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import DataSettings from '@/components/settings/DataSettings';
import KeyboardShortcutsSettings from '@/components/settings/KeyboardShortcutsSettings';
import { Button } from '@/components/ui/button';

type SettingsSection = 'main' | 'profile' | 'notifications' | 'appearance' | 'shortcuts' | 'data' | 'ai-provider' | 'license';

const settingsSections = [
  { id: 'ai-provider' as const, icon: Bot, label: 'AI Provider', description: 'Configure your AI model and API key' },
  { id: 'license' as const, icon: Key, label: 'License', description: 'Activate your Kaivoo license' },
  { id: 'profile' as const, icon: User, label: 'Profile', description: 'Manage your account settings' },
  { id: 'notifications' as const, icon: Bell, label: 'Notifications', description: 'Configure alerts and reminders' },
  { id: 'appearance' as const, icon: Palette, label: 'Appearance', description: 'Customize your experience' },
  {
    id: 'shortcuts' as const,
    icon: Keyboard,
    label: 'Keyboard Shortcuts',
    description: 'Customize keyboard shortcuts',
  },
  { id: 'data' as const, icon: Database, label: 'Data', description: 'Export and backup options' },
];

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('main');

  const renderContent = () => {
    switch (activeSection) {
      case 'ai-provider':
        return <AIProviderSettings />;
      case 'license':
        return <LicenseSettings />;
      case 'profile':
        return <ProfileSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'shortcuts':
        return <KeyboardShortcutsSettings />;
      case 'data':
        return <DataSettings />;
      default:
        return null;
    }
  };

  const activeSectionData = settingsSections.find((s) => s.id === activeSection);

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-6 py-8">
        {activeSection === 'main' ? (
          <>
            <header className="mb-8">
              <h1 className="mb-1 text-2xl font-semibold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">Customize your Kaivoo experience</p>
            </header>

            <div className="space-y-6">
              {/* AI Settings */}
              <section>
                <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">AI Features</h2>
                <AISettingsCard />
              </section>

              {/* General Settings */}
              <section>
                <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">General</h2>
                <div className="space-y-2">
                  {settingsSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className="widget-card flex w-full cursor-pointer items-center gap-4 p-4 text-left transition-colors hover:bg-secondary/30"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-foreground">{section.label}</h3>
                          <p className="text-xs text-muted-foreground">{section.description}</p>
                        </div>
                        <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </>
        ) : (
          <>
            <header className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveSection('main')}
                className="-ml-2 mb-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                {activeSectionData && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <activeSectionData.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-semibold text-foreground">{activeSectionData?.label}</h1>
                  <p className="text-sm text-muted-foreground">{activeSectionData?.description}</p>
                </div>
              </div>
            </header>

            <div className="widget-card p-6">{renderContent()}</div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
