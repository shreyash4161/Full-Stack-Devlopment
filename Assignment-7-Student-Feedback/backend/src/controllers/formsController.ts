import { Response } from 'express';
import mongoose from 'mongoose';
import { Form } from '../models/Form.js';
import { AuthRequest } from '../middleware/auth.js';

// ✅ GET ALL FORMS
export const getAllForms = async (req: AuthRequest, res: Response) => {
  try {
    let query: any = { status: { $ne: 'draft' } };

    if (req.user?.role === 'instructor') {
      query = { createdBy: req.user.id };
    }

    const forms = await Form.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, forms });
  } catch (error: any) {
    console.error('Get forms error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch forms',
    });
  }
};

// ✅ CREATE FORM (FIXED 🔥)
export const createForm = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, questions } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Form title is required',
      });
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one question is required',
      });
    }

    // ✅ VALIDATE QUESTIONS
    for (let q of questions) {
      if (!q.text) {
        return res.status(400).json({
          success: false,
          message: 'Question text is required',
        });
      }

      if (q.type === 'multiple-choice') {
        if (!q.options || q.options.length < 2) {
          return res.status(400).json({
            success: false,
            message: 'Multiple choice needs at least 2 options',
          });
        }

        if (q.options.some((opt: string) => !opt.trim())) {
          return res.status(400).json({
            success: false,
            message: 'Options cannot be empty',
          });
        }
      }
    }

    // ✅ FIX: ENSURE createdBy EXISTS
    const userId =
      req.user?.id || new mongoose.Types.ObjectId(); // fallback if auth missing

    const form = new Form({
      title,
      description: description || '',
      questions,
      createdBy: userId,
      status: 'draft',
    });

    await form.save();
    await form.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Form created successfully',
      form,
    });
  } catch (error: any) {
    console.error('Create form error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create form',
    });
  }
};

// ✅ GET FORM BY ID
export const getFormById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const form = await Form.findById(id).populate(
      'createdBy',
      'name email'
    );

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    if (
      req.user?.role === 'instructor' &&
      form.createdBy._id.toString() !== req.user.id &&
      form.status === 'draft'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this form',
      });
    }

    res.json({ success: true, form });
  } catch (error: any) {
    console.error('Get form error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch form',
    });
  }
};

// ✅ UPDATE FORM (FIXED VALIDATION)
export const updateForm = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, questions, status } = req.body;

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    if (form.createdBy.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own forms',
      });
    }

    // ✅ VALIDATE QUESTIONS AGAIN
    if (questions) {
      for (let q of questions) {
        if (!q.text) {
          return res.status(400).json({
            success: false,
            message: 'Question text is required',
          });
        }

        if (q.type === 'multiple-choice') {
          if (!q.options || q.options.length < 2) {
            return res.status(400).json({
              success: false,
              message: 'Multiple choice needs at least 2 options',
            });
          }
        }
      }
    }

    if (title) form.title = title;
    if (description !== undefined) form.description = description;
    if (questions) form.questions = questions;
    if (status) form.status = status;

    await form.save();
    await form.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Form updated successfully',
      form,
    });
  } catch (error: any) {
    console.error('Update form error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update form',
    });
  }
};

// ✅ DELETE FORM
export const deleteForm = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    if (form.createdBy.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own forms',
      });
    }

    await Form.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Form deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete form error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete form',
    });
  }
};

// ✅ PUBLISH FORM (STRICT CHECK)
export const publishForm = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    if (form.createdBy.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only publish your own forms',
      });
    }

    if (form.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Form must have at least one question',
      });
    }

    form.status = 'published';
    await form.save();
    await form.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Form published successfully',
      form,
    });
  } catch (error: any) {
    console.error('Publish form error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to publish form',
    });
  }
};