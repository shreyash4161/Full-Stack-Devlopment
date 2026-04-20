import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { analyticsAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AnalyticsData {
  formTitle: string;
  totalResponses: number;
  questionAnalytics: Array<{
    questionId: string;
    questionText: string;
    questionType: string;
    totalResponses: number;
    averageRating?: number;
    optionDistribution?: Record<string, number>;
    responses?: any[];
  }>;
  feedbackList: Array<{
    id: string;
    studentName: string;
    studentEmail: string;
    submittedAt: string;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Analytics: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchAnalytics = async () => {
        try {
          const response = await analyticsAPI.getFormAnalytics(id);
          setAnalytics(response.analytics);
        } catch (error) {
          console.error('Failed to fetch analytics:', error);
          alert('Failed to load analytics');
        } finally {
          setLoading(false);
        }
      };
      fetchAnalytics();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="bg-card border-b border-border p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">FeedbackIQ</h1>
              <p className="text-sm text-muted-foreground">Analytics</p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/instructor')}>
              Back to Dashboard
            </Button>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">Failed to load analytics data</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">FeedbackIQ</h1>
            <p className="text-sm text-muted-foreground">Analytics - {analytics.formTitle}</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/instructor')}>
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Response Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.totalResponses} Total Responses</p>
          </CardContent>
        </Card>

        {/* Question Analytics */}
        {analytics.questionAnalytics.map((question, index) => (
          <Card key={question.questionId}>
            <CardHeader>
              <CardTitle className="text-lg">
                Q{index + 1}: {question.questionText}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Type: {question.questionType} • Responses: {question.totalResponses}
              </p>
            </CardHeader>
            <CardContent>
              {question.questionType === 'rating' && question.averageRating && (
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">
                      {question.averageRating} <span className="text-lg text-muted-foreground">/ 5.0</span>
                    </p>
                  </div>
                </div>
              )}

              {question.questionType === 'multiple-choice' && question.optionDistribution && (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(question.optionDistribution).map(([option, count]) => ({
                        name: option,
                        value: count as number,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(question.optionDistribution).map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {(question.questionType === 'text' || question.questionType === 'textarea') && question.responses && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {question.responses.map((response, idx) => (
                    <p key={idx} className="p-3 bg-muted rounded text-sm">
                      {response}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Feedback List */}
        <Card>
          <CardHeader>
            <CardTitle>Student Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-muted-foreground">
                    <th className="text-left py-2">Student Name</th>
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.feedbackList.map((feedback) => (
                    <tr key={feedback.id} className="border-b hover:bg-muted">
                      <td className="py-3">{feedback.studentName}</td>
                      <td className="py-3">{feedback.studentEmail}</td>
                      <td className="py-3">{new Date(feedback.submittedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;
