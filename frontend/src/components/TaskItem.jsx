import './TaskItem.css'

function TaskItem({ task, onDelete, onToggle, onEdit }) {
  const id = task._id || task.id
  return (
    <div className={`task-item${task.done?' done':''}`}>
      <button className={`task-check${task.done?' checked':''}`} onClick={() => onToggle(id)} title="Toggle complete">
        {task.done ? '✓' : ''}
      </button>
      <div className="task-body">
        <div className="task-top">
          <span className="task-title">{task.title}</span>
          <span className={`priority-tag priority-${task.priority?.toLowerCase()}`}>{task.priority}</span>
          <span className="category-tag">{task.category}</span>
        </div>
        {task.description && <p className="task-desc">{task.description}</p>}
        <div className="task-meta">
          <span>👤 {task.assignee}</span>
          <span>📅 {new Date(task.deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
          <span>🕐 Added {new Date(task.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
        </div>
      </div>
      <div className="task-actions">
        <button className="icon-btn edit" onClick={() => onEdit(task)} title="Edit">✏</button>
        <button className="icon-btn delete" onClick={() => onDelete(id)} title="Delete">🗑</button>
      </div>
    </div>
  )
}

export default TaskItem
