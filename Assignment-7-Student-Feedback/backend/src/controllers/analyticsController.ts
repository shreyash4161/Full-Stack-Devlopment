import { Response } from 'express';
import { Feedback } from '../models/Feedback.js';
import { Form } from '../models/Form.js';
import { AuthRequest } from '../middleware/auth.js';

export const getFormAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { formId } = req.params;

    // Check if form exists
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    // Check if user is the form creator
    if (form.createdBy.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the form creator can view analytics',
      });
    }

    // Get all feedback for the form
    const feedbackList = await Feedback.find({ formId }).populate('studentId', 'name email');

    const totalResponses = feedbackList.length;
    const responseRate = totalResponses; // Can be enhanced with total students count

    // Analyze answers by question
    const questionAnalytics: any = {};

    form.questions.forEach((question) => {
      const questionId = question._id?.toString();
      if (questionId) {
        questionAnalytics[questionId] = {
          questionText: question.text,
          questionType: question.type,
          totalResponses: 0,
          responses: [],
        };
      }
    });

    // Process feedback answers
    feedbackList.forEach((feedback) => {
      feedback.answers.forEach((answer) => {
        if (questionAnalytics[answer.questionId]) {
          questionAnalytics[answer.questionId].totalResponses++;
          questionAnalytics[answer.questionId].responses.push(answer.answer);
        }
      });
    });

    // Generate summary statistics
    const summaryStats = Object.entries(questionAnalytics).map(([questionId, data]: any) => {
      let stats: any = {
        questionId,
        questionText: data.questionText,
        questionType: data.questionType,
        totalResponses: data.totalResponses,
      };

      if (data.questionType === 'rating') {
        const ratings = data.responses.filter((r: any) => typeof r === 'number');
        if (ratings.length > 0) {
          stats.averageRating = (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(2);
        }
      } else if (data.questionType === 'multiple-choice') {
        const optionCounts: any = {};
        data.responses.forEach((response: any) => {
          optionCounts[response] = (optionCounts[response] || 0) + 1;
        });
        stats.optionDistribution = optionCounts;
      } else {
        stats.responses = data.responses;
      }

      return stats;
    });

    res.json({
      success: true,
      analytics: {
        formTitle: form.title,
        totalResponses,
        questionAnalytics: summaryStats,
        feedbackList: feedbackList.map((f) => ({
          id: f._id,
          studentName: (f.studentId as any).name,
          studentEmail: (f.studentId as any).email,
          submittedAt: f.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch analytics',
    });
  }
};

export const getInstructorDashboard = async (req: AuthRequest, res: Response) => {
  try {
    // Get all forms created by instructor
    const forms = await Form.find({ createdBy: req.user?.id }).sort({ createdAt: -1 });

    // Get feedback count for each form
    const formsWithStats = await Promise.all(
      forms.map(async (form) => {
        const feedbackCount = await Feedback.countDocuments({ formId: form._id });
        return {
          id: form._id,
          title: form.title,
          status: form.status,
          createdAt: form.createdAt,
          feedbackCount,
        };
      })
    );

    // Total statistics
    const totalForms = forms.length;
    const totalFeedback = await Feedback.countDocuments({
      formId: { $in: forms.map((f) => f._id) },
    });

    res.json({
      success: true,
      dashboard: {
        totalForms,
        totalFeedback,
        recentForms: formsWithStats.slice(0, 5),
        allForms: formsWithStats,
      },
    });
  } catch (error: any) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard data',
    });
  }
};
