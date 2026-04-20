import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, FileStack, MessageCircle, Search, Sparkles } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { analyticsAPI } from '../services/api';
import { AppShell } from '../components/AppShell';
import { StatCard } from '../components/StatCard';

interface DashboardData {
  totalForms: number;
  totalFeedback: number;
  recentForms: Array<{
    id: string;
    title: string;
    status: string;
    feedbackCount: number;
  }>;
}

const InstructorDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await analyticsAPI.getDashboard();
        setDashboard(response.dashboard);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const filteredForms =
    dashboard?.recentForms.filter((form) => form.title.toLowerCase().includes(searchTerm.toLowerCase())) ?? [];

  return (
    <AppShell
      title="Instructor workspace"
      subtitle="Launch new forms, monitor engagement, and review response momentum from one dashboard."
      badge="Instructor"
      actions={
        <Button asChild className="rounded-full">
          <Link to="/instructor/form/new">Create New Form</Link>
        </Button>
      }
    >
      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-[2rem] border border-border/70 bg-card/90">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
            <p className="text-sm text-muted-foreground">Loading your instructor dashboard...</p>
          </div>
        </div>
      ) : dashboard ? (
        <div className="space-y-8">
          <section className="grid gap-4 md:grid-cols-3">
            <StatCard label="Total forms" value={dashboard.totalForms} hint="Active form library" icon={FileStack} />
            <StatCard
              label="Total feedback"
              value={dashboard.totalFeedback}
              hint="Submitted responses collected"
              icon={MessageCircle}
            />
            <StatCard
              label="Recent activity"
              value={dashboard.recentForms.length}
              hint="Forms showing up in your latest list"
              icon={Sparkles}
            />
          </section>

          <Card className="border-border/70 bg-card/90">
            <CardHeader className="gap-4">
              <div>
                <CardTitle>Recent forms</CardTitle>
                <CardDescription>Review drafts, see response counts, and jump into analytics fast.</CardDescription>
              </div>
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search forms by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              {dashboard.recentForms.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/70 bg-background/70 p-10 text-center">
                  <p className="text-lg font-medium">No forms yet</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create your first form to start gathering structured course feedback.
                  </p>
                </div>
              ) : filteredForms.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/70 bg-background/70 p-10 text-center">
                  <p className="text-lg font-medium">No forms match that search</p>
                  <p className="mt-2 text-sm text-muted-foreground">Try a different keyword or clear the filter.</p>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {filteredForms.map((form) => (
                    <div
                      key={form.id}
                      className="rounded-3xl border border-border/70 bg-background/80 p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1"
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">{form.title}</h3>
                          <p className="mt-2 text-sm text-muted-foreground">{form.feedbackCount} responses collected</p>
                        </div>
                        <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-medium capitalize text-accent">
                          {form.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button asChild variant="outline" className="rounded-full">
                          <Link to={`/instructor/form/${form.id}/edit`}>Edit Form</Link>
                        </Button>
                        <Button asChild className="rounded-full">
                          <Link to={`/instructor/form/${form.id}/analytics`}>
                            <BarChart3 className="h-4 w-4" />
                            View Analytics
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-border/70 bg-card/90">
          <CardContent className="py-12 text-center text-muted-foreground">Failed to load dashboard data.</CardContent>
        </Card>
      )}
    </AppShell>
  );
};

export default InstructorDashboard;
