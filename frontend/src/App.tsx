import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useDriveActor } from './hooks/useDriveActor';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import TopBar from './components/layout/TopBar';
import AuthGate from './components/auth/AuthGate';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import FileManager from './components/drive/FileManager';
import ConnectingState from './components/feedback/ConnectingState';
import ActorInitWarningBanner from './components/feedback/ActorInitWarningBanner';

export default function App() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  // Use resilient actor hook to handle initialization states
  const { isInitializing, isReady, initWarning, retry: retryActor } = useDriveActor();

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  // Show profile setup when authenticated, actor ready, profile loaded, and no profile exists
  const showProfileSetup =
    isAuthenticated && isReady && !profileLoading && profileFetched && userProfile === null;

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen flex flex-col bg-background">
        <TopBar />
        <main className="flex-1">
          {!isAuthenticated ? (
            <AuthGate />
          ) : isInitializing ? (
            <ConnectingState />
          ) : initWarning ? (
            <>
              <ActorInitWarningBanner message={initWarning} onRetry={retryActor} />
              <FileManager />
            </>
          ) : showProfileSetup ? (
            <ProfileSetupDialog open={showProfileSetup} />
          ) : profileLoading ? (
            <ConnectingState />
          ) : (
            <FileManager />
          )}
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
