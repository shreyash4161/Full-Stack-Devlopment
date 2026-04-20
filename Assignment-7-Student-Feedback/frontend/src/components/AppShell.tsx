import { Link, useLocation } from 'react-router-dom';
import { BarChart3, FileText, LogOut, Moon, PlusCircle, Sparkles, Sun } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface AppShellProps {
  title: string;
  subtitle: string;
  badge?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const navigationByRole = {
  instructor: [
    { label: 'Overview', href: '/instructor', icon: Sparkles },
    { label: 'Create Form', href: '/instructor/form/new', icon: PlusCircle },
  ],
  student: [{ label: 'Available Forms', href: '/student', icon: FileText }],
} as const;

export function AppShell({ title, subtitle, badge, children, actions }: AppShellProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navItems = user ? navigationByRole[user.role] : [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(234,88,12,0.18),_transparent_28%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--muted)/0.45)_100%)] text-foreground">
      <div className="border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-lg shadow-accent/10">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">FeedbackIQ</h1>
                  {badge ? (
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-accent">
                      {badge}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{title}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {actions}
              <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <div className="hidden rounded-2xl border border-border/70 bg-card/80 px-4 py-2 text-right sm:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {navItems.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  location.pathname === item.href ||
                  (item.href !== `/${user?.role}` && location.pathname.startsWith(item.href));

                return (
                  <Button
                    key={item.href}
                    asChild
                    variant={active ? 'default' : 'ghost'}
                    className={cn(
                      'rounded-full px-4',
                      !active && 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Link to={item.href}>
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-xl shadow-black/5 backdrop-blur sm:p-8">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-accent/80">{badge || 'Workspace'}</p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{subtitle}</h2>
              <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                Collect sharper feedback, act on patterns faster, and keep the course loop organized in one place.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{user?.role}</span>
            </div>
          </div>
        </section>

        {children}
      </main>
    </div>
  );
}
