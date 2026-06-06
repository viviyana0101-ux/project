const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: [
        'Frontend Developer',
        'Backend Developer',
        'ML / AI Engineer',
        'UI/UX Designer',
        'Project Manager',
        'Presenter / Strategist',
        'DevOps Engineer',
        'Full Stack Developer',
        '',
      ],
      default: '',
    },
    skills:   { type: [String], default: [] },
    github:   { type: String, default: '', trim: true },
    avatar:   { type: String, default: '' },
    bio:      { type: String, default: '' },
    isSeeded: { type: Boolean, default: false },
  },
  { timestamps: true }
)

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password)
}

module.exports = mongoose.model('User', userSchema)
