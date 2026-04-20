import { LucideIcon } from 'lucide-react';

import { Card, CardContent } from './ui/card';

interface StatCardProps {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
}

export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-border/70 bg-card/90">
      <CardContent className="flex items-start justify-between p-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-2xl bg-accent/10 p-3 text-accent">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
