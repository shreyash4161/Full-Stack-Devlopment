import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
  questionId: string;
  answer: string | number;
}

export interface IFeedback extends Document {
  formId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  submittedAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>(
  {
    questionId: {
      type: String,
      required: [true, 'Question ID is required'],
    },
    answer: {
      type: Schema.Types.Mixed,
      required: [true, 'Answer is required'],
    },
  },
  { _id: false }
);

const feedbackSchema = new Schema<IFeedback>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: 'Form',
      required: [true, 'Form ID is required'],
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Index for quick lookups
feedbackSchema.index({ formId: 1, studentId: 1 });
feedbackSchema.index({ formId: 1, createdAt: -1 });

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);
