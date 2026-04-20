import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, ClipboardList, Moon, ShieldCheck, Sparkles, Sun, Users } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerRole, setRegisterRole] = useState<'instructor' | 'student'>('student');

  const stats = useMemo(
    () => [
      { label: 'Feedback loops', value: 'Fast and structured' },
      { label: 'Views supported', value: 'Instructor and student' },
      { label: 'Insights', value: 'Submission analytics' },
    ],
    [],
  );

  useEffect(() => {
    if (user) {
      navigate(user.role === 'instructor' ? '/instructor' : '/student', { replace: true });
    }
  }, [navigate, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loggedInUser = await login(loginEmail, loginPassword);
      navigate(loggedInUser.role === 'instructor' ? '/instructor' : '/student', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const registeredUser = await register(registerEmail, registerPassword, registerName, registerRole);
      navigate(registeredUser.role === 'instructor' ? '/instructor' : '/student', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(234,88,12,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_24%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--muted)/0.5)_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl justify-end pb-4">
        <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section className="space-y-8 rounded-[2rem] border border-border/70 bg-card/70 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Feedback Intelligence Platform
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Turn classroom feedback into clear action.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              FeedbackIQ helps instructors launch feedback forms quickly, helps students respond with less friction,
              and gives both sides a cleaner loop from collection to insight.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-border/70 bg-background/75 p-5">
              <ClipboardList className="mb-4 h-6 w-6 text-accent" />
              <h2 className="font-semibold">Build better forms</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Create structured question sets for courses, workshops, and internal reviews.
              </p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/75 p-5">
              <Users className="mb-4 h-6 w-6 text-accent" />
              <h2 className="font-semibold">Guide every role</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Separate instructor and student journeys keep each dashboard focused and easy to use.
              </p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/75 p-5">
              <BarChart3 className="mb-4 h-6 w-6 text-accent" />
              <h2 className="font-semibold">Read the signal</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Spot submission trends, response quality, and form performance from one analytics view.
              </p>
            </div>
          </div>
        </section>

        <Card className="border-border/70 bg-card/85 shadow-2xl shadow-black/10 backdrop-blur-xl">
          <CardHeader className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Secure role-based access
            </div>
            <CardTitle className="text-3xl tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-sm leading-6">
              Sign in to continue your workflow or create a new account in under a minute.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-full">
                <TabsTrigger value="login" className="rounded-full">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-full">
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6 space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                    <span>{isLoading ? 'Logging in...' : 'Continue to dashboard'}</span>
                    {!isLoading ? <ArrowRight className="h-4 w-4" /> : null}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Students and instructors are routed to their own dashboard automatically.
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-6 space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <Input
                      type="password"
                      placeholder="At least 6 characters"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">I am a</label>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                        <input
                          type="radio"
                          name="role"
                          value="instructor"
                          checked={registerRole === 'instructor'}
                          onChange={(e) => setRegisterRole(e.target.value as 'instructor')}
                          disabled={isLoading}
                        />
                        <span className="text-sm">Instructor</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                        <input
                          type="radio"
                          name="role"
                          value="student"
                          checked={registerRole === 'student'}
                          onChange={(e) => setRegisterRole(e.target.value as 'student')}
                          disabled={isLoading}
                        />
                        <span className="text-sm">Student</span>
                      </label>
                    </div>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Register'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
