import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Please provide a room number'],
      uppercase: true,
      trim: true,
      index: true,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
      required: [true, 'Please specify the campus for this room'],
      index: true,
    },
    block: {
      type: String,
      required: [true, 'Please provide the block/wing name'],
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, 'Please provide the floor number'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide the room capacity'],
      default: 2,
      min: [1, 'Room capacity must be at least 1'],
    },
    currentOccupancy: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['available', 'full', 'maintenance'],
      default: 'available',
    },
    residents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Unique roomNumber per campus
roomSchema.index({ campus: 1, roomNumber: 1 }, { unique: true });

// Auto-update status based on current occupancy vs capacity
roomSchema.pre('save', function () {
  if (this.status !== 'maintenance') {
    if (this.residents && this.residents.length > 0) {
      this.currentOccupancy = this.residents.length;
    }
    this.status = this.currentOccupancy >= this.capacity ? 'full' : 'available';
  }
});

const Room = mongoose.model('Room', roomSchema);

export default Room;
