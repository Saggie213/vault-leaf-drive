import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Leaf, Shield, Zap, Lock } from 'lucide-react';

export default function AuthGate() {
  const { login, loginStatus } = useInternetIdentity();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10">
            <Leaf className="w-12 h-12 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to VaultLeaf Drive</h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Your secure, decentralized cloud storage solution. Store, organize, and access your files from anywhere.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
          <div className="p-6 rounded-lg border bg-card space-y-2">
            <Shield className="w-8 h-8 text-primary mx-auto" />
            <h3 className="font-semibold">Secure Storage</h3>
            <p className="text-sm text-muted-foreground">End-to-end encrypted file storage on the blockchain</p>
          </div>
          <div className="p-6 rounded-lg border bg-card space-y-2">
            <Zap className="w-8 h-8 text-primary mx-auto" />
            <h3 className="font-semibold">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">Quick uploads and instant access to your files</p>
          </div>
          <div className="p-6 rounded-lg border bg-card space-y-2">
            <Lock className="w-8 h-8 text-primary mx-auto" />
            <h3 className="font-semibold">Private by Default</h3>
            <p className="text-sm text-muted-foreground">Your files are yours alone, fully private</p>
          </div>
        </div>

        <div className="pt-4">
          <Button size="lg" onClick={handleLogin} disabled={loginStatus === 'logging-in'} className="px-8">
            {loginStatus === 'logging-in' ? 'Connecting...' : 'Get Started'}
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Sign in securely with Internet Identity
          </p>
        </div>
      </div>
    </div>
  );
}
