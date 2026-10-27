import mongoose from 'mongoose';

const messMenuSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      required: [true, 'Please provide the day of the week'],
      enum: {
        values: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        message: '{VALUE} is not a valid day of the week',
      },
    },
    mealType: {
      type: String,
      required: [true, 'Please provide the meal type'],
      enum: {
        values: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
        message: '{VALUE} is not a valid meal type',
      },
    },
    items: [
      {
        type: String,
        trim: true,
      },
    ],
    timings: {
      start: {
        type: String,
        trim: true,
        default: '',
      },
      end: {
        type: String,
        trim: true,
        default: '',
      },
    },
    expectedHeadcount: {
      type: Number,
      default: 0,
      min: [0, 'Expected headcount cannot be negative'],
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate meal entries for the same campus, day and meal type
messMenuSchema.index({ campus: 1, dayOfWeek: 1, mealType: 1 }, { unique: true });

const MessMenu = mongoose.model('MessMenu', messMenuSchema);

export default MessMenu;
