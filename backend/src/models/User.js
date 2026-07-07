const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    refreshTokenHash: {
      type: String,
      default: null
    },
    resetTokenHash: {
      type: String,
      default: null
    },
    resetTokenExpiry: {
      type: Date,
      default: null
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Virtual property 'id' to map MongoDB '_id' to 'id' for the frontend
userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    delete ret.refreshTokenHash;
    delete ret.resetTokenHash;
    delete ret.resetTokenExpiry;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
