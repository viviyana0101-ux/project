import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { io } from 'socket.io-client'
import './Workspace.css'

const API = 'https://project-1-ih77.onrender.com/api'

function Workspace() {
  const { connectionId } = useParams()
  const { user, token }  = useAuth()
  const navigate         = useNavigate()

  const [connection, setConnection]   = useState(null)
  const [messages, setMessages]       = useState([])
  const [tasks, setTasks]             = useState([])
  const [chatInput, setChatInput]     = useState('')
  const [taskInput, setTaskInput]     = useState('')
  const [taskAssign, setTaskAssign]   = useState('Anyone')
  const [loading, setLoading]         = useState(true)
  const [sending, setSending]         = useState(false)
  const [activeTab, setActiveTab]     = useState('chat')
  const socketRef  = useRef(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (!user || !token) return
    loadAll()

    const socket = io('https://project-1-ih77.onrender.com')
    socketRef.current = socket
    socket.emit('join:user', user.id)
    socket.emit('join:workspace', connectionId)

    socket.on('message:new', ({ message }) => {
      setMessages(prev => {
        const exists = prev.find(m => m._id === message._id)
        return exists ? prev : [...prev, message]
      })
    })
    socket.on('wtask:new', ({ task }) => {
      setTasks(prev => {
        const exists = prev.find(t => t._id === task._id)
        return exists ? prev : [task, ...prev]
      })
    })
    socket.on('wtask:updated', ({ task }) => {
      setTasks(prev => prev.map(t => t._id === task._id ? task : t))
    })
    socket.on('wtask:deleted', ({ id }) => {
      setTasks(prev => prev.filter(t => t._id !== id))
    })

    return () => {
      socket.emit('leave:workspace', connectionId)
      socket.disconnect()
    }
  }, [connectionId, user, token])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadAll() {
    try {
      const [connRes, msgRes, taskRes] = await Promise.all([
        fetch(`${API}/connections`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/connections/${connectionId}/messages`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/connections/${connectionId}/tasks`,   { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const [connData, msgData, taskData] = await Promise.all([connRes.json(), msgRes.json(), taskRes.json()])

      if (connData.success) {
        const found = connData.connections.find(c => c._id === connectionId)
        if (!found || found.status !== 'accepted') { navigate('/connections'); return }
        setConnection(found)
      }
      if (msgData.success)  setMessages(msgData.messages)
      if (taskData.success) setTasks(taskData.tasks)
    } catch {}
    setLoading(false)
  }

  function getOther() {
    if (!connection || !user) return null
    const sid = connection.sender?._id?.toString() || connection.sender?.toString()
    return sid === user.id ? connection.receiver : connection.sender
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!chatInput.trim() || sending) return
    setSending(true)
    try {
      await fetch(`${API}/connections/${connectionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: chatInput.trim() }),
      })
      setChatInput('')
    } catch {}
    setSending(false)
  }

  async function addTask(e) {
    e.preventDefault()
    if (!taskInput.trim()) return
    try {
      await fetch(`${API}/connections/${connectionId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: taskInput.trim(), assignedTo: taskAssign }),
      })
      setTaskInput('')
      setTaskAssign('Anyone')
    } catch {}
  }

  async function toggleTask(taskId) {
    try {
      await fetch(`${API}/connections/${connectionId}/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {}
  }

  async function deleteTask(taskId) {
    try {
      await fetch(`${API}/connections/${connectionId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {}
  }

  const other = getOther()
  const done  = tasks.filter(t => t.done).length

  if (loading) {
    return (
      <div className="page-wrap">
        <Navbar />
        <div className="loading-state" style={{margin:'60px auto'}}>Loading workspace...</div>
      </div>
    )
  }

  return (
    <div className="workspace-page">
      <Navbar />

      <div className="workspace-layout">
        <aside className="workspace-sidebar">
          <button className="ws-back-btn" onClick={() => navigate('/connections')}>← Back</button>

          <div className="ws-partner">
            <img src={other?.avatar} alt={other?.name} className="ws-partner-avatar" />
            <h3>{other?.name}</h3>
            <span className="ws-partner-role">{other?.role || 'No role set'}</span>
          </div>

          <div className="ws-stats">
            <div className="ws-stat">
              <strong>{tasks.length}</strong>
              <span>Tasks</span>
            </div>
            <div className="ws-stat">
              <strong>{done}</strong>
              <span>Done</span>
            </div>
            <div className="ws-stat">
              <strong>{messages.length}</strong>
              <span>Messages</span>
            </div>
          </div>

          <div className="ws-skills">
            <p className="ws-skills-label">Their Skills</p>
            <div className="ws-skills-list">
              {other?.skills?.map(s => <span key={s} className="skill-pill">{s}</span>)}
            </div>
          </div>

          {other?.github && (
            <a
              href={other.github.startsWith('http') ? other.github : `https://${other.github}`}
              target="_blank" rel="noopener"
              className="ws-github-btn"
            >
              ⬡ GitHub
            </a>
          )}
        </aside>

        <main className="workspace-main">
          <div className="ws-tabs">
            <button className={`ws-tab${activeTab==='chat'?' active':''}`} onClick={() => setActiveTab('chat')}>
              💬 Chat ({messages.length})
            </button>
            <button className={`ws-tab${activeTab==='tasks'?' active':''}`} onClick={() => setActiveTab('tasks')}>
              ✅ Tasks ({tasks.length})
            </button>
          </div>

          {activeTab === 'chat' && (
            <div className="ws-chat-panel">
              <div className="ws-messages">
                {messages.length === 0 && (
                  <div className="ws-empty">👋 No messages yet. Say hello to {other?.name}!</div>
                )}
                {messages.map(msg => {
                  const isMe = (msg.sender?._id?.toString() || msg.sender?.toString()) === user?.id
                  return (
                    <div key={msg._id} className={`ws-msg${isMe?' ws-msg-me':' ws-msg-them'}`}>
                      {!isMe && <img src={msg.sender?.avatar} alt={msg.sender?.name} className="ws-msg-avatar" />}
                      <div className="ws-msg-bubble">
                        {!isMe && <span className="ws-msg-name">{msg.sender?.name}</span>}
                        <p>{msg.text}</p>
                        <span className="ws-msg-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {isMe && <img src={user?.avatar} alt={user?.name} className="ws-msg-avatar" />}
                    </div>
                  )
                })}
                <div ref={chatEndRef} />
              </div>

              <form className="ws-chat-form" onSubmit={sendMessage}>
                <input
                  className="ws-chat-input"
                  type="text"
                  placeholder={`Message ${other?.name}...`}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" className="btn btn-primary ws-send-btn" disabled={sending || !chatInput.trim()}>
                  {sending ? '...' : '➤'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="ws-tasks-panel">
              <form className="ws-task-form" onSubmit={addTask}>
                <input
                  className="ws-task-input"
                  type="text"
                  placeholder="Add a shared task..."
                  value={taskInput}
                  onChange={e => setTaskInput(e.target.value)}
                />
                <select
                  className="ws-task-assign"
                  value={taskAssign}
                  onChange={e => setTaskAssign(e.target.value)}
                >
                  <option value="Anyone">Anyone</option>
                  <option value={user?.name}>{user?.name} (Me)</option>
                  <option value={other?.name}>{other?.name}</option>
                </select>
                <button type="submit" className="btn btn-primary" disabled={!taskInput.trim()}>Add</button>
              </form>

              <div className="ws-task-progress">
                <div className="ws-progress-bar">
                  <div
                    className="ws-progress-fill"
                    style={{ width: tasks.length ? `${(done/tasks.length)*100}%` : '0%' }}
                  />
                </div>
                <span>{done}/{tasks.length} complete</span>
              </div>

              <div className="ws-task-list">
                {tasks.length === 0 && (
                  <div className="ws-empty">No tasks yet. Add your first shared task above!</div>
                )}
                {tasks.map(task => (
                  <div key={task._id} className={`ws-task-item${task.done?' done':''}`}>
                    <button className="ws-task-check" onClick={() => toggleTask(task._id)}>
                      {task.done ? '✓' : '○'}
                    </button>
                    <div className="ws-task-body">
                      <span className="ws-task-title">{task.title}</span>
                      <span className="ws-task-assign-label">→ {task.assignedTo}</span>
                    </div>
                    <button className="ws-task-del" onClick={() => deleteTask(task._id)} title="Delete">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Workspace
