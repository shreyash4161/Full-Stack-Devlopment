import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { formsAPI, feedbackAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Form, Question, Answer } from '../types';

const FormSubmission: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchForm = async () => {
        try {
          const response = await formsAPI.getFormById(id);
          setForm(response.form);
          // Initialize answers object
          const initAnswers: Record<string, any> = {};
          response.form.questions.forEach((q: Question) => {
            initAnswers[q._id || ''] = '';
          });
          setAnswers(initAnswers);
        } catch (error) {
          console.error('Failed to fetch form:', error);
          alert('Failed to load form');
        } finally {
          setLoading(false);
        }
      };
      fetchForm();
    }
  }, [id]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (form) {
      for (const question of form.questions) {
        if (question.required && !answers[question._id || '']) {
          alert(`Please answer: ${question.text}`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      if (form) {
        const feedbackAnswers: Answer[] = form.questions.map((q) => ({
          questionId: q._id || '',
          answer: answers[q._id || ''],
        }));

        await feedbackAPI.submitFeedback(id || '', feedbackAnswers);
        setSubmitted(true);
      }
    } catch (error: any) {
      console.error('Failed to submit feedback:', error);
      alert(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="bg-card border-b border-border p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">FeedbackIQ</h1>
              <p className="text-sm text-muted-foreground">Feedback Submitted</p>
            </div>
          </div>
        </nav>

        <main className="max-w-2xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-green-600">Thank You!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-lg">Your feedback has been submitted successfully.</p>
              <p className="text-muted-foreground">We appreciate your response.</p>
              <Button onClick={() => navigate('/student')}>Return to Dashboard</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="bg-card border-b border-border p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">FeedbackIQ</h1>
              <p className="text-sm text-muted-foreground">Submit Feedback</p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/student')}>
              Back to Dashboard
            </Button>
          </div>
        </nav>

        <main className="max-w-2xl mx-auto p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">Form not found</p>
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
            <p className="text-sm text-muted-foreground">Submit Feedback</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/student')}>
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>{form.title}</CardTitle>
            {form.description && (
              <p className="text-sm text-muted-foreground mt-2">{form.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {form.questions.map((question, index) => (
              <div key={question._id} className="space-y-2">
                <Label>
                  {index + 1}. {question.text}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </Label>

                {question.type === 'text' && (
                  <Input
                    type="text"
                    placeholder="Your answer"
                    value={answers[question._id || '']}
                    onChange={(e) => handleAnswerChange(question._id || '', e.target.value)}
                    disabled={submitting}
                  />
                )}

                {question.type === 'textarea' && (
                  <textarea
                    placeholder="Your answer"
                    value={answers[question._id || '']}
                    onChange={(e) => handleAnswerChange(question._id || '', e.target.value)}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-24"
                  />
                )}

                {question.type === 'rating' && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleAnswerChange(question._id || '', rating)}
                        disabled={submitting}
                        className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                          answers[question._id || ''] === rating
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === 'multiple-choice' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={question._id}
                          value={option}
                          checked={answers[question._id || ''] === option}
                          onChange={(e) => handleAnswerChange(question._id || '', e.target.value)}
                          disabled={submitting}
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-3 justify-end pt-6">
              <Button variant="outline" onClick={() => navigate('/student')} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FormSubmission;
