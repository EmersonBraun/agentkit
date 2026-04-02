import React, { useState } from 'react'

type Filter = 'all' | 'active' | 'completed'

interface Todo {
  id: number
  text: string
  completed: boolean
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Learn AgentKit', completed: true },
    { id: 2, text: 'Build something reactive', completed: false },
    { id: 3, text: 'Ship it', completed: false },
  ])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const addTodo = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setTodos(prev => [...prev, { id: Date.now(), text: trimmed, completed: false }])
    setInput('')
  }

  const toggleTodo = (id: number) => {
    setTodos(prev =>
      prev.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo)
    )
  }

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const filtered = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const activeCount = todos.filter(t => !t.completed).length

  const filterButtonStyle = (f: Filter): React.CSSProperties => ({
    padding: '4px 14px',
    borderRadius: '6px',
    border: '1px solid',
    borderColor: filter === f ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-300)',
    background: filter === f ? 'var(--ifm-color-primary)' : 'transparent',
    color: filter === f ? '#fff' : 'var(--ifm-color-emphasis-700)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: filter === f ? 600 : 400,
    transition: 'all 0.15s ease',
  })

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'inherit' }}>
      {/* Input row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          placeholder="What needs to be done?"
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--ifm-color-emphasis-300)',
            background: 'var(--ifm-background-color)',
            color: 'var(--ifm-font-color-base)',
            fontSize: '0.95rem',
            outline: 'none',
          }}
        />
        <button
          onClick={addTodo}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--ifm-color-primary)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          Add
        </button>
      </div>

      {/* Todo list */}
      <div style={{
        border: '1px solid var(--ifm-color-emphasis-200)',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '0.75rem',
      }}>
        {filtered.length === 0 ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--ifm-color-emphasis-500)',
            fontSize: '0.9rem',
          }}>
            No items to show
          </div>
        ) : (
          filtered.map((todo, index) => (
            <div
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderBottom: index < filtered.length - 1
                  ? '1px solid var(--ifm-color-emphasis-200)'
                  : 'none',
                background: 'var(--ifm-background-color)',
                transition: 'background 0.1s',
              }}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--ifm-color-primary)' }}
              />

              {/* Text */}
              <span style={{
                flex: 1,
                fontSize: '0.95rem',
                color: todo.completed ? 'var(--ifm-color-emphasis-500)' : 'var(--ifm-font-color-base)',
                textDecoration: todo.completed ? 'line-through' : 'none',
                transition: 'all 0.15s',
              }}>
                {todo.text}
              </span>

              {/* Delete button */}
              <button
                onClick={() => deleteTodo(todo.id)}
                aria-label="Delete"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ifm-color-emphasis-400)',
                  fontSize: '1.1rem',
                  lineHeight: 1,
                  padding: '2px 4px',
                  borderRadius: '4px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ifm-color-danger)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ifm-color-emphasis-400)')}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
          {activeCount} item{activeCount !== 1 ? 's' : ''} left
        </span>

        <div style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'active', 'completed'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={filterButtonStyle(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
