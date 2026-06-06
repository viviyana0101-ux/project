const express = require('express')
const router  = express.Router()
const Task    = require('../models/Task')
const { protect } = require('../middleware/auth')

router.get('/', protect, async (req, res, next) => {
  try {
    const { userId } = req.query
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required.' })
    }
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 })
    res.status(200).json({ success: true, tasks })
  } catch (err) {
    next(err)
  }
})

router.post('/', protect, async (req, res, next) => {
  try {
    const { title, description, assignee, category, priority, deadline, userId } = req.body
    if (!title || !assignee || !category || !priority || !deadline || !userId) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' })
    }
    const task = await Task.create({ title, description, assignee, category, priority, deadline, userId })
    req.app.get('io').emit('task:created', { task })
    res.status(201).json({ success: true, message: 'Task created.', task })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', protect, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' })
    req.app.get('io').emit('task:updated', { task })
    res.status(200).json({ success: true, message: 'Task updated.', task })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/toggle', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' })
    task.done = !task.done
    await task.save()
    req.app.get('io').emit('task:toggled', { task })
    res.status(200).json({ success: true, message: 'Task toggled.', task })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' })
    req.app.get('io').emit('task:deleted', { id: req.params.id })
    res.status(200).json({ success: true, message: 'Task deleted.' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
