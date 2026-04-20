import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, FileText, Search, Sparkles } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { formsAPI } from '../services/api';
import { Form } from '../types';
import { AppShell } from '../components/AppShell';
import { StatCard } from '../components/StatCard';

const StudentDashboard: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await formsAPI.getAllForms();
        setForms(response.forms);
      } catch (error) {
        console.error('Failed to fetch forms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const filteredForms = forms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AppShell
      title="Student workspace"
      subtitle="See every active form in one place and submit thoughtful feedback without the clutter."
      badge="Student"
    >
      <div className="space-y-8">
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard label="Available forms" value={forms.length} hint="Ready for your response" icon={FileText} />
          <StatCard
            label="Search ready"
            value={filteredForms.length}
            hint="Forms visible with current filter"
            icon={Search}
          />
          <StatCard
            label="Response mode"
            value="Focused"
            hint="Clean submission flow with required-question guidance"
            icon={ClipboardCheck}
          />
        </section>

        <Card className="border-border/70 bg-card/90">
          <CardHeader className="gap-4">
            <div>
              <CardTitle>Available feedback forms</CardTitle>
              <CardDescription>Find the right form, review the details, and submit your response.</CardDescription>
            </div>
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search forms by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
                <p className="text-sm text-muted-foreground">Loading available forms...</p>
              </div>
            ) : forms.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/70 bg-background/70 p-10 text-center">
                <p className="text-lg font-medium">No forms are available yet</p>
                <p className="mt-2 text-sm text-muted-foreground">Check back later for new instructor feedback requests.</p>
              </div>
            ) : filteredForms.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/70 bg-background/70 p-10 text-center">
                <p className="text-lg font-medium">Nothing matches that search</p>
                <p className="mt-2 text-sm text-muted-foreground">Try a different term to find the form you need.</p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredForms.map((form) => (
                  <div
                    key={form._id}
                    className="rounded-3xl border border-border/70 bg-background/80 p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{form.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{form.description}</p>
                      </div>
                      <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                        {form.questions.length} questions
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="h-4 w-4 text-accent" />
                        {form.status}
                      </div>
                      <Button asChild className="rounded-full">
                        <Link to={`/student/form/${form._id}`}>Fill Form</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default StudentDashboard;
