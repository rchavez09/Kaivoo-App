import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import DataLoader from "@/components/DataLoader";
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const Today = lazy(() => import("./pages/Today"));
const Tasks = lazy(() => import("./pages/Tasks"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const Topics = lazy(() => import("./pages/Topics"));
const TopicPage = lazy(() => import("./pages/TopicPage"));
const Insights = lazy(() => import("./pages/Insights"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const JournalPage = lazy(() => import("./pages/JournalPage"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

const ProtectedWithData = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <DataLoader>{children}</DataLoader>
  </ProtectedRoute>
);

const ProtectedPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedWithData>
    <ErrorBoundary>{children}</ErrorBoundary>
  </ProtectedWithData>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<ProtectedPage><Today /></ProtectedPage>} />
                <Route path="/journal" element={<ProtectedPage><JournalPage /></ProtectedPage>} />
                <Route path="/tasks" element={<ProtectedPage><Tasks /></ProtectedPage>} />
                <Route path="/calendar" element={<ProtectedPage><CalendarPage /></ProtectedPage>} />
                <Route path="/topics" element={<ProtectedPage><Topics /></ProtectedPage>} />
                <Route path="/topics/:topicId" element={<ProtectedPage><TopicPage /></ProtectedPage>} />
                <Route path="/topics/:topicId/pages/:pageId" element={<ProtectedPage><TopicPage /></ProtectedPage>} />
                <Route path="/insights" element={<ProtectedPage><Insights /></ProtectedPage>} />
                <Route path="/settings" element={<ProtectedPage><SettingsPage /></ProtectedPage>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
