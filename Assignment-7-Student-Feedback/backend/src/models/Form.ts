import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  _id?: string;
  text: string;
  type: 'text' | 'textarea' | 'rating' | 'multiple-choice';
  options?: string[];
  required: boolean;
}

export interface IForm extends Document {
  title: string;
  description: string;
  questions: IQuestion[];
  createdBy: mongoose.Types.ObjectId;
  status: 'draft' | 'published' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    text: {
      type: String,
      required: [true, 'Question text is required'],
    },
    type: {
      type: String,
      enum: ['text', 'textarea', 'rating', 'multiple-choice'],
      default: 'text',
    },
    options: {
      type: [String],
      default: undefined,
    },
    required: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const formSchema = new Schema<IForm>(
  {
    title: {
      type: String,
      required: [true, 'Form title is required'],
    },
    description: {
      type: String,
      default: '',
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

export const Form = mongoose.model<IForm>('Form', formSchema);
