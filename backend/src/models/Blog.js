const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Blog content is required']
    },
    coverImage: {
      url: {
        type: String,
        default: ''
      },
      publicId: {
        type: String,
        default: ''
      }
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author reference is required']
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Virtual 'id' mapping
blogSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

blogSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Blog', blogSchema);
