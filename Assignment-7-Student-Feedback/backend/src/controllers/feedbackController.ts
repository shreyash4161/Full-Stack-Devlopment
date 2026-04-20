import { Response } from 'express';
import { Feedback } from '../models/Feedback.js';
import { Form } from '../models/Form.js';
import { AuthRequest } from '../middleware/auth.js';

export const submitFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { formId, answers } = req.body;

    if (!formId || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Form ID and answers are required',
      });
    }

    // Check if form exists
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    // Check if form is published
    if (form.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'This form is not open for submissions',
      });
    }

    // Check if student already submitted
    const existingFeedback = await Feedback.findOne({
      formId,
      studentId: req.user?.id,
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this form',
      });
    }

    const feedback = new Feedback({
      formId,
      studentId: req.user?.id,
      answers,
    });

    await feedback.save();
    await feedback.populate([
      { path: 'formId', select: 'title' },
      { path: 'studentId', select: 'name email' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback,
    });
  } catch (error: any) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit feedback',
    });
  }
};

export const getFeedbackByFormId = async (req: AuthRequest, res: Response) => {
  try {
    const { formId } = req.params;
    const { page = 1, limit = 10, search } = req.query;

    // Check if form exists
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    // Check if user is the form creator (instructor)
    if (form.createdBy.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the form creator can view feedback',
      });
    }

    const skipAmount = (Number(page) - 1) * Number(limit);
    const feedbackQuery: any = { formId };

    if (search) {
      feedbackQuery['answers.answer'] = { $regex: search, $options: 'i' };
    }

    const feedback = await Feedback.find(feedbackQuery)
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(Number(limit));

    const total = await Feedback.countDocuments(feedbackQuery);

    res.json({
      success: true,
      feedback,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch feedback',
    });
  }
};

export const deleteFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { feedbackId } = req.params;

    const feedback = await Feedback.findById(feedbackId).populate('formId');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    // Check if user is the form creator
    if ((feedback.formId as any).createdBy.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete feedback for your own forms',
      });
    }

    await Feedback.findByIdAndDelete(feedbackId);

    res.json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete feedback',
    });
  }
};
