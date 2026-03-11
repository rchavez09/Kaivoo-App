import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { AdapterProvider } from '@/lib/adapters';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import DataLoader from '@/components/DataLoader';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const Today = lazy(() => import('./pages/Today'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const Topics = lazy(() => import('./pages/Topics'));
const TopicPage = lazy(() => import('./pages/TopicPage'));
const Insights = lazy(() => import('./pages/Insights'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const RoutinesPage = lazy(() => import('./pages/RoutinesPage'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Auth = lazy(() => import('./pages/Auth'));
const SetupWizard = lazy(() => import('./pages/SetupWizard'));
const GuidedTour = lazy(() => import('./components/GuidedTour'));
const PurchaseSuccessPage = lazy(() => import('./pages/PurchaseSuccessPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/** Redirect to /setup if first-launch setup hasn't been completed. */
const SetupGuard = ({ children }: { children: React.ReactNode }) => {
  if (!localStorage.getItem('kaivoo-setup-complete')) {
    return <Navigate to="/setup" replace />;
  }
  return <>{children}</>;
};

const ProtectedPage = ({ children }: { children: React.ReactNode }) => {
  const showTour = localStorage.getItem('kaivoo-show-tour') === 'true';
  return (
    <ProtectedRoute>
      <SetupGuard>
        <DataLoader>
          <ErrorBoundary>{children}</ErrorBoundary>
          {showTour && (
            <Suspense fallback={null}>
              <GuidedTour />
            </Suspense>
          )}
        </DataLoader>
      </SetupGuard>
    </ProtectedRoute>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdapterProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedPage>
                        <Today />
                      </ProtectedPage>
                    }
                  />
                  <Route
                    path="/notes"
                    element={
                      <ProtectedPage>
                        <JournalPage />
                      </ProtectedPage>
                    }
                  />
                  <Route path="/journal" element={<Navigate to="/notes" replace />} />
                  <Route path="/tasks" element={<Navigate to="/projects" replace />} />
                  <Route
                    path="/projects"
                    element={
                      <ProtectedPage>
                        <Projects />
                      </ProtectedPage>
                    }
                  />
                  <Route
                    path="/projects/:projectId"
                    element={
                      <ProtectedPage>
                        <ProjectDetail />
                      </ProtectedPage>
                    }
                  />
                  <Route
                    path="/routines"
                    element={
                      <ProtectedPage>
                        <RoutinesPage />
                      </ProtectedPage>
                    }
                  />
                  <Route
                    path="/calendar"
                    element={
                      <ProtectedPage>
                        <CalendarPage />
                      </ProtectedPage>
                    }
                  />
                  <Route path="/vault" element={<Navigate to="/topics?tab=vault" replace />} />
                  <Route
                    path="/topics"
                    element={
                      <ProtectedPage>
                        <Topics />
                      </ProtectedPage>
                    }
                  />
                  <Route
                    path="/topics/:topicId"
                    element={
                      <ProtectedPage>
                        <TopicPage />
                      </ProtectedPage>
                    }
                  />
                  <Route
                    path="/topics/:topicId/pages/:pageId"
                    element={
                      <ProtectedPage>
                        <TopicPage />
                      </ProtectedPage>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedPage>
                        <ChatPage />
                      </ProtectedPage>
                    }
                  />
                  <Route
                    path="/insights"
                    element={
                      <ProtectedPage>
                        <Insights />
                      </ProtectedPage>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedPage>
                        <SettingsPage />
                      </ProtectedPage>
                    }
                  />
                  <Route
                    path="/setup"
                    element={
                      <ProtectedRoute>
                        <SetupWizard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/purchase/success" element={<PurchaseSuccessPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AdapterProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
