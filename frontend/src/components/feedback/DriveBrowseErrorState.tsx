import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { normalizeError, isAuthError, isConnectionError } from '../../utils/errors';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface DriveBrowseErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

export default function DriveBrowseErrorState({ error, onRetry }: DriveBrowseErrorStateProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const errorMessage = normalizeError(error);
  const isAuth = isAuthError(error);
  const isConnection = isConnectionError(error);

  const handleSignOut = async () => {
    await clear();
    queryClient.clear();
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      queryClient.invalidateQueries();
    }
  };

  // Don't show this component for connection errors during initialization
  if (isConnection) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Alert variant="destructive" className="max-w-2xl">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Unable to load your drive</AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p>{errorMessage}</p>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            {isAuth && (
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out & Sign In Again
              </Button>
            )}
          </div>
          {isAuth && (
            <p className="text-sm text-muted-foreground">
              If you're seeing this after signing in, you may need to complete your profile setup or
              sign out and sign in again.
            </p>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
