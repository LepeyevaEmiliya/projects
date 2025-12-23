import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', type: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    project_id: '',
    assignee_id: '',
    status: 'new',
    priority: 'medium',
    task_type: 'task',
    due_date: '',
    estimated_hours: ''
  });

  const queryClient = useQueryClient();

  // Задачи
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      try {
        const res = await api.get('/tasks');
        console.log('tasks response', res.data);
  
        return Array.isArray(res.data.data.tasks) ? res.data.data.tasks : [];
      } catch (err) {
        if (err.response?.status === 404) return [];
        throw err;
      }
    }
  });
  

  // Проекты
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      console.log('projects response', res.data);
  
      // Возвращаем массив внутри data
      return Array.isArray(res.data.data) ? res.data.data : [];
    },
  });


  // Фильтрация
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchQuery
      ? (task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         task.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    const matchesStatus = filters.status ? task.status === filters.status : true;
    const matchesPriority = filters.priority ? task.priority === filters.priority : true;
    const matchesType = filters.type ? task.task_type === filters.type : true;
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', newTaskData);
      queryClient.invalidateQueries(['tasks']);
      setShowNewTask(false);
      setNewTaskData({
        title: '',
        description: '',
        project_id: '',
        assignee_id: '',
        status: 'new',
        priority: 'medium',
        task_type: 'task',
        due_date: '',
        estimated_hours: ''
      });
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Error creating task');
    }
  };

  if (isLoading) return <div className="text-center py-12">Loading tasks...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tasks</h1>
          <p className="text-gray-600">Manage your assigned tasks</p>
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> New Task
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Total Tasks" value={stats.total} color="bg-blue-500" />
        <StatCard icon={<Clock className="w-6 h-6" />} label="In Progress" value={stats.inProgress} color="bg-yellow-500" />
        <StatCard icon={<AlertCircle className="w-6 h-6" />} label="In Review" value={stats.review} color="bg-orange-500" />
        <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Completed" value={stats.done} color="bg-green-500" />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${showFilters ? 'bg-green-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['status', 'priority', 'type'].map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <select
                  value={filters[field]}
                  onChange={(e) => setFilters({ ...filters, [field]: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All {field.charAt(0).toUpperCase() + field.slice(1)}s</option>
                  {field === 'status' && ['new','in_progress','review','done'].map(val => <option key={val} value={val}>{val.replace('_',' ')}</option>)}
                  {field === 'priority' && ['low','medium','high','critical'].map(val => <option key={val} value={val}>{val.charAt(0).toUpperCase() + val.slice(1)}</option>)}
                  {field === 'type' && ['task','bug','improvement','research'].map(val => <option key={val} value={val}>{val.charAt(0).toUpperCase() + val.slice(1)}</option>)}
                </select>
              </div>
            ))}
          </div>
          {(filters.status || filters.priority || filters.type) && (
            <button onClick={() => setFilters({ status:'',priority:'',type:'' })} className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium">
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">
            {searchQuery || filters.status || filters.priority || filters.type
              ? 'Try adjusting your filters'
              : 'You have no assigned tasks yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
      )}

      {/* New Task Modal */}
      {showNewTask && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
            <button onClick={() => setShowNewTask(false)} className="absolute top-4 right-4"><X /></button>
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <form className="space-y-4" onSubmit={handleCreateTask}>
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input type="text" required className="w-full border px-3 py-2 rounded-lg" value={newTaskData.title} onChange={e => setNewTaskData({...newTaskData, title:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea required className="w-full border px-3 py-2 rounded-lg" value={newTaskData.description} onChange={e => setNewTaskData({...newTaskData, description:e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Project</label>
                  <select
                  required
                  className="w-full border px-3 py-2 rounded-lg"
                  value={newTaskData.project_id}
                  onChange={e => setNewTaskData({...newTaskData, project_id:e.target.value, assignee_id:''})}
                >
                  <option value="">{projectsLoading ? 'Loading projects...' : 'Select project'}</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Assignee</label>
                  <AssigneeSelect projectId={newTaskData.project_id} value={newTaskData.assignee_id} onChange={val => setNewTaskData({...newTaskData, assignee_id: val})} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium">Status</label>
                  <select className="w-full border px-3 py-2 rounded-lg" value={newTaskData.status} onChange={e => setNewTaskData({...newTaskData, status:e.target.value})}>
                    {['new','in_progress','review','done'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Priority</label>
                  <select className="w-full border px-3 py-2 rounded-lg" value={newTaskData.priority} onChange={e => setNewTaskData({...newTaskData, priority:e.target.value})}>
                    {['low','medium','high','critical'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Type</label>
                  <select className="w-full border px-3 py-2 rounded-lg" value={newTaskData.task_type} onChange={e => setNewTaskData({...newTaskData, task_type:e.target.value})}>
                    {['task','bug','improvement','research'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Due Date</label>
                <input type="date" className="w-full border px-3 py-2 rounded-lg" value={newTaskData.due_date} onChange={e => setNewTaskData({...newTaskData, due_date:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium">Estimated Hours</label>
                <input type="number" step="0.1" className="w-full border px-3 py-2 rounded-lg" value={newTaskData.estimated_hours} onChange={e => setNewTaskData({...newTaskData, estimated_hours:e.target.value})} />
              </div>
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Create Task</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Статистика
function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Карточка задачи
function TaskCard({ task }) {
  const statusConfig = {
    new: { label: 'New', color: 'bg-gray-100 text-gray-800' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    review: { label: 'Review', color: 'bg-yellow-100 text-yellow-800' },
    done: { label: 'Done', color: 'bg-green-100 text-green-800' }
  };

  const priorityConfig = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
    critical: { label: 'Critical', color: 'bg-red-100 text-red-800' }
  };

  const typeIcons = {
    task: '📋',
    bug: '🐛',
    improvement: '✨',
    research: '🔍'
  };

  return (
    <Link
      to={`/tasks/${task.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-green-500 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="text-2xl mt-1">{typeIcons[task.task_type] || '📋'}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors">{task.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusConfig[task.status]?.color}`}>
              {statusConfig[task.status]?.label}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className={`px-2 py-1 rounded text-xs font-medium ${priorityConfig[task.priority]?.color}`}>
              {priorityConfig[task.priority]?.label}
            </span>
            <span className="text-gray-600">{task.project_name}</span>
            {task.assignee_name && <span className="text-gray-600">👤 {task.assignee_name}</span>}
            {task.due_date && (
              <span className={`text-gray-600 ${new Date(task.due_date) < new Date() && task.status !== 'done' ? 'text-red-600 font-medium' : ''}`}>
                📅 {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function AssigneeSelect({ projectId, value, onChange }) {
  const { data: members = [] } = useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await api.get(`/projects/${projectId}/members`);
      return Array.isArray(res.data.data) ? res.data.data : [];
    },
    enabled: !!projectId // запрос выполняется только если projectId задан
  });

  return (
    <select
      className="w-full border px-3 py-2 rounded-lg"
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={!projectId}
    >
      <option value="">Select assignee</option>
      {members.map(m => (
        <option key={m.user_id} value={m.user_id}>
          {m.name} ({m.role})
        </option>
      ))}
    </select>
  );
}

