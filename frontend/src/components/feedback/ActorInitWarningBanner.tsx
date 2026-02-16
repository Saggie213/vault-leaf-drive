import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ActorInitWarningBannerProps {
  message: string;
  onRetry: () => void;
}

/**
 * Non-blocking banner for recoverable actor initialization issues
 */
export default function ActorInitWarningBanner({ message, onRetry }: ActorInitWarningBannerProps) {
  return (
    <div className="container mx-auto px-4 py-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Connection Issue</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>{message}</p>
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
