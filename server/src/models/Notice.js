import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a notice title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide the notice content'],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ['General', 'Mess', 'Maintenance', 'Urgent'],
        message: '{VALUE} is not a valid notice category',
      },
      default: 'General',
      index: true,
    },
    targetAudience: {
      type: String,
      enum: {
        values: ['All', 'Students', 'Hostel Block A', 'Hostel Block B'],
        message: '{VALUE} is not a valid target audience',
      },
      default: 'All',
      index: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notice must specify the author (User)'],
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
      default: null,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Sorting index: pinned notices first, followed by newest to oldest
noticeSchema.index({ isPinned: -1, createdAt: -1 });

const Notice = mongoose.model('Notice', noticeSchema);

export default Notice;
