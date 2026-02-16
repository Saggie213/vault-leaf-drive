import { Loader2 } from 'lucide-react';

export default function ConnectingState() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Connecting to your drive...</p>
            <p className="text-sm text-muted-foreground">
              Please wait while we establish a secure connection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
