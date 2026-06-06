const express = require('express')
const router  = express.Router()
const User    = require('../models/User')

router.get('/', async (req, res, next) => {
  try {
    const { role, skill, search } = req.query
    const query = {}

    if (role && role !== 'All Roles') {
      query.role = role
    }
    if (skill) {
      query.skills = { $in: [new RegExp(skill, 'i')] }
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { skills: { $in: [new RegExp(search, 'i')] } },
        { role: new RegExp(search, 'i') },
      ]
    }

    const users = await User.find(query, '-password').sort({ createdAt: -1 })
    res.status(200).json({ success: true, users })
  } catch (err) {
    next(err)
  }
})

module.exports = router
