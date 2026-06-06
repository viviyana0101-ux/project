const express = require('express')
const router  = express.Router()
const jwt     = require('jsonwebtoken')
const User    = require('../models/User')

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function safeUser(user) {
  return {
    id:     user._id,
    name:   user.name,
    email:  user.email,
    role:   user.role,
    skills: user.skills,
    github: user.github,
    avatar: user.avatar,
    bio:    user.bio,
  }
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, skills, github, bio } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' })
    }

    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    const user   = await User.create({ name, email, password, role, skills, github, avatar, bio })
    const token  = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: safeUser(user),
    })
  } catch (err) {
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    const match = await user.matchPassword(password)
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser(user),
    })
  } catch (err) {
    next(err)
  }
})

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find({}, '-password')
    res.status(200).json({ success: true, users })
  } catch (err) {
    next(err)
  }
})

router.put('/users/:id', async (req, res, next) => {
  try {
    const { name, role, skills, github, bio } = req.body
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, skills, github, bio },
      { new: true, runValidators: true }
    ).select('-password')

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    res.status(200).json({ success: true, message: 'Profile updated.', user: updated })
  } catch (err) {
    next(err)
  }
})

module.exports = router
