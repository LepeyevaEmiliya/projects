import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Users, Calendar, CheckCircle, Clock, AlertCircle, QrCode, Settings, Plus, BarChart3, Layout, X } from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);

  // React Query для загрузки проекта, задач и участников
  const { data, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      // Project
      const projectRes = await api.get(`/projects/${id}`);
      const project = projectRes.data.data;

      // Tasks
      let tasks = [];
      try {
        const tasksRes = await api.get(`/projects/${id}/tasks`);
        tasks = tasksRes.data.data.tasks;
        console.log("Tasks", tasksRes.data.data.tasks)
      } catch (err) {
        if (err.response?.status !== 404) throw err;
      }

      // Members
      let members = [];
      try {
        const membersRes = await api.get(`/projects/${id}/members`);
        members = membersRes.data.data;
      } catch (err) {
        if (err.response?.status !== 404) throw err;
      }

      // Считаем статусы
      const stats = {
        total: tasks.length,
        new: tasks.filter(t => t.status === 'new').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        review: tasks.filter(t => t.status === 'review').length,
        done: tasks.filter(t => t.status === 'done').length,
      };

      return { project, tasks, members, stats };
    },
    onError: (err) => {
      console.error('Failed to load project data', err);
    }
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layout },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'members', label: 'Team', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    project_id: id,
    assignee_id: '',
    status: 'new',
    priority: 'medium',
    task_type: 'task',
    due_date: '',
    estimated_hours: ''
  });

  const handleCreateTask = async (e) => {
      e.preventDefault();

      if (!newTaskData.title || !newTaskData.project_id) {
        alert('Please fill all required fields');
        return;
      }

      try {
        await api.post('/tasks', newTaskData);
        queryClient.invalidateQueries(['project', id]);
        setShowNewTask(false);
        setNewTaskData({
          title: '',
          description: '',
          project_id: id,
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

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (!data || !data.project) return <div className="text-center py-12">Project not found</div>;
  
  const { project, tasks, members, stats } = data;
  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link to="/projects" className="text-green-600 hover:text-green-700 font-medium mb-4 inline-block">
          ← Back to projects
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.role === 'owner' ? 'bg-purple-100 text-purple-700' : project.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                {project.role}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{members.length} members</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{completionRate}% complete</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {project.role === 'owner' && (
              <button onClick={() => setShowQRModal(true)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
                <QrCode className="w-5 h-5" />
                <span>QR Code</span>
              </button>
            )}
            <Link to={`/projects/${id}/kanban`} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
              <Layout className="w-5 h-5" />
              <span>Kanban</span>
            </Link>
            {(project.role === 'owner' || project.role === 'manager') && (
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Total Tasks" value={stats.total} color="bg-blue-500" />
        <StatCard icon={<AlertCircle className="w-6 h-6" />} label="New" value={stats.new} color="bg-gray-500" />
        <StatCard icon={<Clock className="w-6 h-6" />} label="In Progress" value={stats.inProgress} color="bg-yellow-500" />
        <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Completed" value={stats.done} color="bg-green-500" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${activeTab === tab.id ? 'border-green-600 text-green-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab project={project} stats={stats} onNewTask={() => setShowNewTask(true)}/>}
      {activeTab === 'tasks' && <TasksTab tasks={tasks} projectId={id} onNewTask={() => setShowNewTask(true)}/>}
      {activeTab === 'members' && <MembersTab members={members} project={project} />}
      {activeTab === 'analytics' && <AnalyticsTab stats={stats} tasks={tasks} />}

      {/* QR Modal */}
      {showQRModal && <QRModal onClose={() => setShowQRModal(false)} project={project} />}

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
                  <label className="block text-sm font-medium">Project name</label>
                  <input type="text" value={project.name} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Assignee</label>
                  <AssigneeSelect projectId={project.id} value={newTaskData.assignee_id} onChange={val => setNewTaskData({...newTaskData, assignee_id: val})} />
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


function StatCard({ icon, label, value, color }) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-4">
                <div className={`${color} text-white p-3 rounded-lg`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-gray-600 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
}

function OverviewTab({ project, stats, onNewTask }) {
    const completionRate = stats.total > 0 ? (stats.done / stats.total) * 100 : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {/* Progress */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Overall Completion</span>
                                <span className="font-medium text-gray-900">{Math.round(completionRate)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-green-600 h-3 rounded-full transition-all"
                                    style={{ width: `${completionRate}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">New Tasks</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">In Review</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.review}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Completed</p>
                                <p className="text-2xl font-bold text-green-600">{stats.done}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                    <button
                        onClick={onNewTask}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors w-full"
                        >
                        <Plus className="w-5 h-5" /> New Task
                    </button>
                        <Link
                            to={`/projects/${project.id}/kanban`}
                            className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Layout className="w-5 h-5" />
                            <span>View Kanban</span>
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Info</h3>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-gray-600">Owner</p>
                            <p className="font-medium text-gray-900">{project.owner_name}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Created</p>
                            <p className="font-medium text-gray-900">
                                {new Date(project.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600">Members</p>
                            <p className="font-medium text-gray-900">{project.member_count} people</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TasksTab({ tasks, projectId, onNewTask }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                    Project Tasks ({tasks.length})
                </h3>
                    <button
                        onClick={onNewTask}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                        >
                        <Plus className="w-5 h-5" /> New Task
                    </button>
            </div>

            {tasks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                    <p className="text-gray-600 mb-6">Create your first task to get started</p>
                    <button
                        onClick={onNewTask}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" /> Create Task
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            )}
        </div>
    );
}

function TaskCard({ task }) {
    const statusColors = {
        new: 'bg-gray-100 text-gray-800',
        in_progress: 'bg-blue-100 text-blue-800',
        review: 'bg-yellow-100 text-yellow-800',
        done: 'bg-green-100 text-green-800'
    };

    return (
        <Link
            to={`/tasks/${task.id}`}
            className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-green-500 transition-all"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex items-center gap-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status]}`}>
                            {task.status.replace('_', ' ')}
                        </span>
                        {task.assignee_name && (
                            <span className="text-gray-600">👤 {task.assignee_name}</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

function MembersTab({ members, project }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                    Team Members ({members.length})
                </h3>
                {(project.role === 'owner' || project.role === 'manager') && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors">
                        <Plus className="w-5 h-5" />
                        <span>Invite Member</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member) => (
                    <div
                        key={member.id}
                        className="bg-white rounded-lg border border-gray-200 p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-lg">
                                    {member.name.charAt(0)}
                                </span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{member.name}</h4>
                                <p className="text-sm text-gray-600">{member.email}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${member.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                                    member.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {member.role}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AnalyticsTab({ stats, tasks }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h3>
                    <div className="space-y-3">
                        <ProgressBar label="New" value={stats.new} total={stats.total} color="bg-gray-500" />
                        <ProgressBar label="In Progress" value={stats.inProgress} total={stats.total} color="bg-blue-500" />
                        <ProgressBar label="Review" value={stats.review} total={stats.total} color="bg-yellow-500" />
                        <ProgressBar label="Done" value={stats.done} total={stats.total} color="bg-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Distribution</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Tasks</span>
                            <span className="font-semibold">{stats.total}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Completion Rate</span>
                            <span className="font-semibold text-green-600">
                                {stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Active Tasks</span>
                            <span className="font-semibold">{stats.inProgress + stats.review}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProgressBar({ label, value, total, color }) {
    const percentage = total > 0 ? (value / total) * 100 : 0;

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium">{value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`${color} h-2 rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

function ActivityItem({ icon, text, time }) {
    return (
        <div className="flex items-start gap-3">
            <div className="text-2xl">{icon}</div>
            <div className="flex-1">
                <p className="text-sm text-gray-900">{text}</p>
                <p className="text-xs text-gray-500">{time}</p>
            </div>
        </div>
    );
}

function QRModal({ onClose, project }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
        const generateQR = async () => {
            const qrData = JSON.stringify({
                type: 'project_invite',
                project_id: project.id,
                project_name: project.name
            });

            try {
                const url = await QRCode.toDataURL(qrData, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                setQrCodeUrl(url);
            } catch (err) {
                console.error('Failed to generate QR code', err);
            }
        };

        generateQR();
    }, [project.id, project.name]);


  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Project QR Code</h2>
                  <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                      <X className="w-6 h-6" />
                  </button>
              </div>

              <div className="text-center">
                  <div className="bg-gray-100 p-8 rounded-lg mb-4 flex items-center justify-center">
                      {qrCodeUrl ? (
                          <img 
                              src={qrCodeUrl} 
                              alt="Project QR Code" 
                              className="w-64 h-64"
                          />
                      ) : (
                          <div className="w-64 h-64 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                          </div>
                      )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                      Scan this code with the mobile app to join the project
                  </p>
                  <p className="text-xs text-gray-500">
                      Project: {project.name}
                  </p>
              </div>
          </div>
      </div>
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
  