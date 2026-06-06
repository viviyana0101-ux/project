const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    assignee: {
      type: String,
      required: [true, 'Assignee is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Frontend', 'Backend', 'AI/ML', 'Design', 'DevOps', 'General'],
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: ['High', 'Medium', 'Low'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    done: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Task', taskSchema)
