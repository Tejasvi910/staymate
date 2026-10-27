import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['manager', 'warden', 'accountant', 'student', 'admin'],
      default: 'student',
      index: true,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
      default: null,
      index: true,
    },
    rollNumber: {
      type: String,
      trim: true,
      uppercase: true,
      required: function () {
        return this.role === 'student';
      },
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
    // Student Fee Details
    totalFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    paidFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    feeStatus: {
      type: String,
      enum: ['Paid', 'Partial', 'Pending'],
      default: 'Pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-update feeStatus based on totalFee vs paidFee
userSchema.pre('save', function (next) {
  if (this.role === 'student') {
    if (this.totalFee > 0) {
      if (this.paidFee >= this.totalFee) {
        this.feeStatus = 'Paid';
      } else if (this.paidFee > 0) {
        this.feeStatus = 'Partial';
      } else {
        this.feeStatus = 'Pending';
      }
    } else {
      this.feeStatus = 'Paid';
    }
  }
  next();
});

// Hash password before saving to database
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with stored hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
