const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination ID is required']
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
      unique: true // A booking can only be reviewed once
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    text: {
      type: String,
      required: [true, 'Review message is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Virtual property 'id' to map MongoDB '_id' to 'id' for the frontend
reviewSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
reviewSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Review', reviewSchema);
