const mongoose = require('mongoose')

const workspaceTaskSchema = new mongoose.Schema(
  {
    connectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Connection', required: true },
    title:        { type: String, required: true, trim: true },
    assignedTo:   { type: String, default: 'Anyone' },
    done:         { type: Boolean, default: false },
    createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('WorkspaceTask', workspaceTaskSchema)
