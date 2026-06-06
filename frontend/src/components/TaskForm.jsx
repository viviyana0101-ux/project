import { useState, useEffect } from 'react'
import './TaskForm.css'

const CATEGORIES = ['Frontend', 'Backend', 'AI/ML', 'Design', 'DevOps', 'General']
const PRIORITIES  = ['High', 'Medium', 'Low']
const EMPTY_FORM  = { title: '', description: '', assignee: '', category: '', priority: '', deadline: '' }

function validate(form) {
  const errors = {}
  if (!form.title.trim()) errors.title = 'Task title is required.'
  else if (form.title.trim().length < 3) errors.title = 'Title must be at least 3 characters.'
  if (!form.assignee.trim()) errors.assignee = 'Assignee name is required.'
  if (!form.category) errors.category = 'Please select a category.'
  if (!form.priority) errors.priority = 'Please select a priority.'
  if (!form.deadline) {
    errors.deadline = 'Deadline is required.'
  } else {
    const today = new Date(); today.setHours(0,0,0,0)
    if (new Date(form.deadline) < today) errors.deadline = 'Deadline cannot be in the past.'
  }
  return errors
}

function TaskForm({ onAdd, editingTask, onUpdate, onCancelEdit }) {
  const [form, setForm]       = useState(EMPTY_FORM)
  const [errors, setErrors]   = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    if (editingTask) { setForm({...editingTask}); setErrors({}); setTouched({}) }
  }, [editingTask])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({...f, [name]: value}))
    if (touched[name]) {
      const errs = validate({...form, [name]: value})
      setErrors(prev => ({...prev, [name]: errs[name]}))
    }
  }

  function handleBlur(e) {
    const { name } = e.target
    setTouched(t => ({...t, [name]: true}))
    const errs = validate(form)
    setErrors(prev => ({...prev, [name]: errs[name]}))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const allTouched = Object.fromEntries(Object.keys(EMPTY_FORM).map(k => [k, true]))
    setTouched(allTouched)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    if (editingTask) {
      onUpdate({...form, id: editingTask.id, done: editingTask.done, createdAt: editingTask.createdAt})
    } else {
      onAdd({...form, id: Date.now(), done: false, createdAt: new Date().toISOString()})
    }
    setForm(EMPTY_FORM); setErrors({}); setTouched({})
  }

  function handleReset() {
    setForm(EMPTY_FORM); setErrors({}); setTouched({})
    if (onCancelEdit) onCancelEdit()
  }

  return (
    <div className="card">
      <div className="card-title">
        <div className="icon">{editingTask ? '✏️' : '➕'}</div>
        {editingTask ? 'Edit Task' : 'Add New Task'}
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-group full">
            <label className="form-label">Task Title *</label>
            <input className={`form-input${errors.title?' error':''}`} type="text" name="title" placeholder="e.g. Build Login API" value={form.title} onChange={handleChange} onBlur={handleBlur}/>
            {errors.title && <span className="error-msg">⚠ {errors.title}</span>}
          </div>
          <div className="form-group full">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" name="description" placeholder="Brief description..." value={form.description} onChange={handleChange}/>
          </div>
          <div className="form-group">
            <label className="form-label">Assignee *</label>
            <input className={`form-input${errors.assignee?' error':''}`} type="text" name="assignee" placeholder="Team member name" value={form.assignee} onChange={handleChange} onBlur={handleBlur}/>
            {errors.assignee && <span className="error-msg">⚠ {errors.assignee}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Deadline *</label>
            <input className={`form-input${errors.deadline?' error':''}`} type="date" name="deadline" value={form.deadline} onChange={handleChange} onBlur={handleBlur}/>
            {errors.deadline && <span className="error-msg">⚠ {errors.deadline}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className={`form-select${errors.category?' error':''}`} name="category" value={form.category} onChange={handleChange} onBlur={handleBlur}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <span className="error-msg">⚠ {errors.category}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Priority *</label>
            <select className={`form-select${errors.priority?' error':''}`} name="priority" value={form.priority} onChange={handleChange} onBlur={handleBlur}>
              <option value="">Select priority</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.priority && <span className="error-msg">⚠ {errors.priority}</span>}
          </div>
          <div className="form-actions full">
            <button type="submit" className="btn btn-primary">{editingTask ? '✓ Update Task' : '+ Add Task'}</button>
            <button type="button" className="btn btn-ghost" onClick={handleReset}>{editingTask ? 'Cancel' : 'Clear'}</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default TaskForm