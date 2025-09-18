import mongoose, { Document, Schema } from 'mongoose';

export interface IChapter {
  title: string;
  content: string;
  order: number;
  readTime?: number;
}

export interface ITutorial extends Document {
  title: string;
  description?: string;
  content?: string; // Keep for backward compatibility
  chapters?: IChapter[];
  githubUrl: string;
  author?: string;
  category?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  readTime?: number;
  totalChapters?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema = new Schema<IChapter>({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  order: { 
    type: Number, 
    required: true 
  },
  readTime: { 
    type: Number,
    min: 1 
  }
});

const TutorialSchema = new Schema<ITutorial>({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String,
    trim: true 
  },
  content: { 
    type: String,
    required: false
  },
  chapters: [ChapterSchema],
  githubUrl: { 
    type: String, 
    required: true,
    unique: true 
  },
  author: { 
    type: String,
    trim: true 
  },
  category: { 
    type: String,
    trim: true 
  },
  difficulty: { 
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  readTime: { 
    type: Number,
    min: 1 
  },
  totalChapters: { 
    type: Number,
    min: 0,
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Clear any existing model to avoid caching issues
if (mongoose.models.Tutorial) {
  delete mongoose.models.Tutorial;
}

export default mongoose.model<ITutorial>('Tutorial', TutorialSchema);