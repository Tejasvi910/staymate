import mongoose from 'mongoose';

const activeStaffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Staff member name is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Staff designation is required'],
      trim: true,
      default: 'Hostel Caretaker',
    },
    shift: {
      type: String,
      enum: ['Morning (6 AM - 2 PM)', 'Day (2 PM - 10 PM)', 'Night (10 PM - 6 AM)', 'General (9 AM - 5 PM)'],
      default: 'Day (2 PM - 10 PM)',
    },
    contact: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: true, timestamps: true }
);

const campusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a campus name'],
      unique: true,
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide the campus address'],
      trim: true,
    },
    blocks: [
      {
        type: String,
        trim: true,
      },
    ],
    warden: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    activeStaff: [activeStaffSchema],
    totalRooms: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Campus = mongoose.model('Campus', campusSchema);

export default Campus;
