import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { User, Bell, Palette, Database, ChevronLeft } from 'lucide-react';
import AISettingsCard from '@/components/AISettingsCard';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import DataSettings from '@/components/settings/DataSettings';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SettingsSection = 'main' | 'profile' | 'notifications' | 'appearance' | 'data';

const settingsSections = [
  { id: 'profile' as const, icon: User, label: 'Profile', description: 'Manage your account settings' },
  { id: 'notifications' as const, icon: Bell, label: 'Notifications', description: 'Configure alerts and reminders' },
  { id: 'appearance' as const, icon: Palette, label: 'Appearance', description: 'Customize your experience' },
  { id: 'data' as const, icon: Database, label: 'Data', description: 'Export and backup options' },
];

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('main');

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'data':
        return <DataSettings />;
      default:
        return null;
    }
  };

  const activeSectionData = settingsSections.find(s => s.id === activeSection);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-8">
        {activeSection === 'main' ? (
          <>
            <header className="mb-8">
              <h1 className="text-2xl font-semibold text-foreground mb-1">Settings</h1>
              <p className="text-sm text-muted-foreground">Customize your Kaivoo experience</p>
            </header>

            <div className="space-y-6">
              {/* AI Settings */}
              <section>
                <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">AI Features</h2>
                <AISettingsCard />
              </section>

              {/* General Settings */}
              <section>
                <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">General</h2>
                <div className="space-y-2">
                  {settingsSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className="widget-card flex items-center gap-4 cursor-pointer hover:bg-secondary/30 transition-colors p-4 w-full text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-foreground">{section.label}</h3>
                          <p className="text-xs text-muted-foreground">{section.description}</p>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
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
                className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                {activeSectionData && (
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <activeSectionData.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-semibold text-foreground">{activeSectionData?.label}</h1>
                  <p className="text-sm text-muted-foreground">{activeSectionData?.description}</p>
                </div>
              </div>
            </header>

            <div className="widget-card p-6">
              {renderContent()}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
