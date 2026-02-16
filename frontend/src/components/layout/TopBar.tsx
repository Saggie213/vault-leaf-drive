import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Leaf, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQueryClient } from '@tanstack/react-query';

export default function TopBar() {
  const { identity, clear, login, loginStatus } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">VaultLeaf Drive</h1>
            <p className="text-xs text-muted-foreground">Secure cloud storage</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated && userProfile && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {getInitials(userProfile.username)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{userProfile.username}</span>
            </div>
          )}

          <Button onClick={handleAuth} disabled={disabled} variant={isAuthenticated ? 'outline' : 'default'}>
            {loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
          </Button>
        </div>
      </div>
    </header>
  );
}
