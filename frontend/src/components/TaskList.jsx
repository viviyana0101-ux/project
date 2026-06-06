import TaskItem from './TaskItem'
import './Tasklist.css'

function TaskList({ tasks, filter, setFilter, onDelete, onToggle, onEdit, total, active, completed }) {
  const filtered = tasks.filter(t => {
    if (filter === 'active')    return !t.done
    if (filter === 'completed') return t.done
    return true
  })

  return (
    <div className="card">
      <div className="card-title"><div className="icon">📋</div>Task List</div>
      <div className="filters-row">
        {[{key:'all',label:`All (${total})`},{key:'active',label:`Active (${active})`},{key:'completed',label:`Completed (${completed})`}].map(f => (
          <button key={f.key} className={`filter-btn${filter===f.key?' active':''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>{filter==='completed'?'No completed tasks yet.':filter==='active'?'No active tasks — add one above!':'No tasks yet. Add your first task!'}</p>
        </div>
      ) : (
        <div className="task-list">
          {filtered.map(task => (
            <TaskItem key={task._id || task.id} task={task} onDelete={onDelete} onToggle={onToggle} onEdit={onEdit}/>
          ))}
        </div>
      )}
    </div>
  )
}

export default TaskList
