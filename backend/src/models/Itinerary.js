const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema(
  {
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination ID reference is required']
    },
    day: {
      type: Number,
      required: [true, 'Day is required']
    },
    activity: {
      type: String,
      required: [true, 'Activity description is required'],
      trim: true
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Virtual property 'id' to map MongoDB '_id' to 'id' for the frontend
itinerarySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
itinerarySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
