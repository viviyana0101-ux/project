import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import { io } from 'socket.io-client'
import './Dashboard.css'

const API = 'http://localhost:5000/api'

function Dashboard() {
  const { user, token, authHeaders } = useAuth()
  const [tasks, setTasks]             = useState([])
  const [filter, setFilter]           = useState('all')
  const [editingTask, setEditingTask] = useState(null)
  const [toast, setToast]             = useState(null)
  const [loading, setLoading]         = useState(true)
  const socketRef                     = useRef(null)

  useEffect(() => {
    if (!user) return
    fetch(`${API}/tasks?userId=${user.id}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { if (data.success) setTasks(data.tasks) })
      .catch(() => showToast('⚠ Could not load tasks.'))
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    const socket = io('http://localhost:5000')
    socketRef.current = socket

    socket.on('task:created', ({ task }) => {
      if (task.userId === user?.id) {
        setTasks(prev => {
          const exists = prev.find(t => t._id === task._id)
          return exists ? prev : [task, ...prev]
        })
      }
    })
    socket.on('task:updated', ({ task }) => {
      if (task.userId === user?.id) {
        setTasks(prev => prev.map(t => t._id === task._id ? task : t))
      }
    })
    socket.on('task:toggled', ({ task }) => {
      if (task.userId === user?.id) {
        setTasks(prev => prev.map(t => t._id === task._id ? task : t))
      }
    })
    socket.on('task:deleted', ({ id }) => {
      setTasks(prev => prev.filter(t => t._id !== id))
    })

    return () => socket.disconnect()
  }, [user])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function handleAdd(task) {
    try {
      const res  = await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...task, userId: user.id }),
      })
      const data = await res.json()
      if (data.success) { setTasks(prev => [data.task, ...prev]); showToast('✓ Task added!') }
      else showToast(`⚠ ${data.message}`)
    } catch { showToast('⚠ Server error.') }
  }

  async function handleUpdate(updated) {
    try {
      const res  = await fetch(`${API}/tasks/${updated._id || updated.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updated),
      })
      const data = await res.json()
      if (data.success) {
        setTasks(prev => prev.map(t => t._id === data.task._id ? data.task : t))
        setEditingTask(null)
        showToast('✓ Task updated!')
      } else showToast(`⚠ ${data.message}`)
    } catch { showToast('⚠ Server error.') }
  }

  async function handleDelete(id) {
    try {
      const res  = await fetch(`${API}/tasks/${id}`, { method: 'DELETE', headers: authHeaders() })
      const data = await res.json()
      if (data.success) { setTasks(prev => prev.filter(t => t._id !== id)); showToast('🗑 Task deleted.') }
      else showToast(`⚠ ${data.message}`)
    } catch { showToast('⚠ Server error.') }
  }

  async function handleToggle(id) {
    try {
      const res  = await fetch(`${API}/tasks/${id}/toggle`, { method: 'PATCH', headers: authHeaders() })
      const data = await res.json()
      if (data.success) setTasks(prev => prev.map(t => t._id === id ? data.task : t))
    } catch { showToast('⚠ Server error.') }
  }

  const total     = tasks.length
  const completed = tasks.filter(t => t.done).length
  const active    = total - completed
  const high      = tasks.filter(t => t.priority === 'High' && !t.done).length

  return (
    <div className="page-wrap">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div className="section-label">Project Dashboard</div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-sub">Manage and track your TeamUp AI project tasks. Updates sync in real-time.</p>
        </div>

        <div className="stats-row">
          <div className="stat-chip"><span className="dot dot-blue"></span><strong>{total}</strong><span>Total</span></div>
          <div className="stat-chip"><span className="dot dot-yellow"></span><strong>{active}</strong><span>Active</span></div>
          <div className="stat-chip"><span className="dot dot-green"></span><strong>{completed}</strong><span>Completed</span></div>
          <div className="stat-chip"><span className="dot dot-red"></span><strong>{high}</strong><span>High Priority</span></div>
        </div>

        {loading ? (
          <div className="loading-state">Loading tasks...</div>
        ) : (
          <>
            <TaskForm onAdd={handleAdd} editingTask={editingTask} onUpdate={handleUpdate} onCancelEdit={() => setEditingTask(null)}/>
            <TaskList tasks={tasks} filter={filter} setFilter={setFilter} onDelete={handleDelete} onToggle={handleToggle} onEdit={setEditingTask} total={total} active={active} completed={completed}/>
          </>
        )}
      </main>
      <Footer />
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default Dashboard
