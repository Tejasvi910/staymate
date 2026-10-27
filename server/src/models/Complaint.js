import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Complaint must belong to a student'],
      index: true,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a complaint title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed complaint description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a complaint category'],
      enum: {
        values: [
          'Plumbing',
          'Electrical',
          'Carpentry',
          'Cleanliness',
          'Mess',
          'Internet/WiFi',
          'Other',
        ],
        message: '{VALUE} is not a valid category',
      },
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    adminRemarks: {
      type: String,
      trim: true,
      default: '',
    },
    aiAnalysis: {
      suggestedCategory: {
        type: String,
        default: null,
      },
      urgencyScore: {
        type: Number,
        min: 1,
        max: 10,
        default: null,
      },
      summary: {
        type: String,
        default: null,
      },
      actionRecommendation: {
        type: String,
        default: null,
      },
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying a student's active complaints
complaintSchema.index({ student: 1, status: 1 });

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
