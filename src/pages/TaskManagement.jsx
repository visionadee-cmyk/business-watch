import React, { useState } from 'react';
import { CheckSquare, Plus, Calendar, Clock, Flag, Trash2, Edit2, Filter } from 'lucide-react';

const mockTasks = [
  { id: 1, title: 'Submit IT tender bid', tender: 'IT Equipment Supply', dueDate: '2026-04-05', priority: 'High', status: 'Pending', assigned: 'Ahmed' },
  { id: 2, title: 'Review contract terms', tender: 'Office Renovation', dueDate: '2026-03-28', priority: 'Medium', status: 'In Progress', assigned: 'Fathimath' },
  { id: 3, title: 'Prepare price quotation', tender: 'Medical Supplies', dueDate: '2026-03-25', priority: 'High', status: 'Completed', assigned: 'Ahmed' },
  { id: 4, title: 'Follow up on invoice payment', tender: 'Maintenance Contract', dueDate: '2026-03-30', priority: 'Low', status: 'Pending', assigned: 'Fathimath' },
  { id: 5, title: 'Update supplier database', tender: 'General', dueDate: '2026-04-01', priority: 'Low', status: 'Pending', assigned: 'Ahmed' },
];

export default function TaskManagement() {
  const [tasks, setTasks] = useState(mockTasks);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    highPriority: tasks.filter(t => t.priority === 'High').length,
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => 
    filter === 'completed' ? t.status === 'Completed' :
    filter === 'pending' ? t.status === 'Pending' :
    filter === 'high' ? t.priority === 'High' :
    true
  );

  const toggleStatus = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const statuses = ['Pending', 'In Progress', 'Completed'];
        const currentIndex = statuses.indexOf(t.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-amber-600 bg-amber-50';
      case 'Low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': return <CheckSquare className="w-5 h-5 text-emerald-600" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-amber-600" />;
      default: return <div className="w-5 h-5 rounded border-2 border-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-500 mt-1">Track tasks and to-dos for tenders</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 text-center">
          <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Tasks</p>
        </div>
        <div className="card bg-gradient-to-br from-amber-50 to-amber-100 text-center">
          <p className="text-3xl font-bold text-amber-700">{stats.pending}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 text-center">
          <p className="text-3xl font-bold text-blue-700">{stats.inProgress}</p>
          <p className="text-sm text-gray-600">In Progress</p>
        </div>
        <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 text-center">
          <p className="text-3xl font-bold text-emerald-700">{stats.completed}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 text-center">
          <p className="text-3xl font-bold text-red-700">{stats.highPriority}</p>
          <p className="text-sm text-gray-600">High Priority</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <div className="flex gap-2">
          {['all', 'pending', 'completed', 'high'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div key={task.id} className={`flex items-center gap-4 p-4 rounded-lg border ${task.status === 'Completed' ? 'bg-gray-50' : 'bg-white'}`}>
              <button onClick={() => toggleStatus(task.id)} className="flex-shrink-0">
                {getStatusIcon(task.status)}
              </button>
              
              <div className="flex-1">
                <h4 className={`font-medium ${task.status === 'Completed' ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span>{task.tender}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due {task.dueDate}
                  </span>
                  <span>•</span>
                  <span>Assigned: {task.assigned}</span>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                <Flag className="w-3 h-3 inline mr-1" />
                {task.priority}
              </span>

              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add New Task</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Task title" className="input w-full" />
              <select className="input w-full">
                <option>Select Tender</option>
                <option>IT Equipment Supply</option>
                <option>Office Renovation</option>
                <option>Medical Supplies</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="input w-full" />
                <select className="input w-full">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <select className="input w-full">
                <option>Assign to...</option>
                <option>Ahmed</option>
                <option>Fathimath</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowAdd(false)} className="btn btn-primary flex-1">Add Task</button>
                <button onClick={() => setShowAdd(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
