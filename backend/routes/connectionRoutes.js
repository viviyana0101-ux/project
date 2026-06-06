const express        = require('express')
const router         = express.Router()
const Connection     = require('../models/Connection')
const Message        = require('../models/Message')
const WorkspaceTask  = require('../models/WorkspaceTask')
const { protect }    = require('../middleware/auth')

router.post('/request', protect, async (req, res, next) => {
  try {
    const { receiverId } = req.body
    if (!receiverId) return res.status(400).json({ success: false, message: 'receiverId required.' })
    if (receiverId === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'Cannot connect with yourself.' })

    const existing = await Connection.findOne({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId,   receiver: req.user._id },
      ],
    })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Connection request already exists.', connection: existing })
    }

    const conn = await Connection.create({ sender: req.user._id, receiver: receiverId })
    await conn.populate(['sender', 'receiver'], '-password')

    const io = req.app.get('io')
    io.to(`user:${receiverId}`).emit('connection:request', { connection: conn })

    res.status(201).json({ success: true, message: 'Request sent.', connection: conn })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const { status } = req.body
    if (!['accepted','rejected'].includes(status))
      return res.status(400).json({ success: false, message: 'status must be accepted or rejected.' })

    const conn = await Connection.findById(req.params.id).populate(['sender','receiver'], '-password')
    if (!conn) return res.status(404).json({ success: false, message: 'Connection not found.' })

    if (conn.receiver._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Only the receiver can respond.' })

    conn.status = status
    await conn.save()

    const io = req.app.get('io')
    io.to(`user:${conn.sender._id.toString()}`).emit('connection:updated', { connection: conn })
    io.to(`user:${conn.receiver._id.toString()}`).emit('connection:updated', { connection: conn })

    res.status(200).json({ success: true, message: `Request ${status}.`, connection: conn })
  } catch (err) {
    next(err)
  }
})

router.get('/', protect, async (req, res, next) => {
  try {
    const connections = await Connection.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender',   '-password')
      .populate('receiver', '-password')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, connections })
  } catch (err) {
    next(err)
  }
})

router.get('/:id/messages', protect, async (req, res, next) => {
  try {
    const conn = await Connection.findById(req.params.id)
    if (!conn) return res.status(404).json({ success: false, message: 'Connection not found.' })

    const uid = req.user._id.toString()
    if (conn.sender.toString() !== uid && conn.receiver.toString() !== uid)
      return res.status(403).json({ success: false, message: 'Access denied.' })

    const messages = await Message.find({ connectionId: req.params.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
    res.status(200).json({ success: true, messages })
  } catch (err) {
    next(err)
  }
})

router.post('/:id/messages', protect, async (req, res, next) => {
  try {
    const { text } = req.body
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'Message text required.' })

    const conn = await Connection.findById(req.params.id)
    if (!conn || conn.status !== 'accepted')
      return res.status(403).json({ success: false, message: 'No active workspace.' })

    const uid = req.user._id.toString()
    if (conn.sender.toString() !== uid && conn.receiver.toString() !== uid)
      return res.status(403).json({ success: false, message: 'Access denied.' })

    const msg = await Message.create({ connectionId: req.params.id, sender: req.user._id, text: text.trim() })
    await msg.populate('sender', 'name avatar')

    const io = req.app.get('io')
    io.to(`workspace:${req.params.id}`).emit('message:new', { message: msg })

    res.status(201).json({ success: true, message: msg })
  } catch (err) {
    next(err)
  }
})

router.get('/:id/tasks', protect, async (req, res, next) => {
  try {
    const tasks = await WorkspaceTask.find({ connectionId: req.params.id }).sort({ createdAt: -1 })
    res.status(200).json({ success: true, tasks })
  } catch (err) {
    next(err)
  }
})

router.post('/:id/tasks', protect, async (req, res, next) => {
  try {
    const { title, assignedTo } = req.body
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title required.' })

    const task = await WorkspaceTask.create({
      connectionId: req.params.id,
      title: title.trim(),
      assignedTo: assignedTo || 'Anyone',
      createdBy: req.user._id,
    })

    const io = req.app.get('io')
    io.to(`workspace:${req.params.id}`).emit('wtask:new', { task })

    res.status(201).json({ success: true, task })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/tasks/:taskId/toggle', protect, async (req, res, next) => {
  try {
    const task = await WorkspaceTask.findById(req.params.taskId)
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' })
    task.done = !task.done
    await task.save()

    const io = req.app.get('io')
    io.to(`workspace:${req.params.id}`).emit('wtask:updated', { task })

    res.status(200).json({ success: true, task })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id/tasks/:taskId', protect, async (req, res, next) => {
  try {
    await WorkspaceTask.findByIdAndDelete(req.params.taskId)
    const io = req.app.get('io')
    io.to(`workspace:${req.params.id}`).emit('wtask:deleted', { id: req.params.taskId })
    res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router
