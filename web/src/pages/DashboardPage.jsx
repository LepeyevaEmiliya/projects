import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function DashboardPage() {    
    const { user } = useAuthStore();
    const token = useAuthStore(state => state.token);
    const queryClient = useQueryClient();

    const [showCreateModal, setShowCreateModal] = useState(false);

    // Fetch user projects
    const { data: projects = [], isLoading: projectsLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: () =>
          api.get('/projects').then(res => res.data.data),
        enabled: !!token,
        staleTime: 1000 * 60 * 5, 
        cacheTime: 1000 * 60 * 10
    });

    // Fetch user tasks
    const { data: tasks = [], isLoading: tasksLoading } = useQuery({
        queryKey: ['my-tasks'],
        queryFn: () =>
          api.get('/tasks/my-tasks').then(res => res.data.data),
        enabled: !!token,
    });

    const stats = {
        totalProjects: projects.length,
        totalTasks: tasks.length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'done').length,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">TaskFlow</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Добро пожаловать, {user?.name}! 👋
                    </h2>
                    <p className="text-gray-600">
                        Вот обзор ваших задач на сегодня
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Активных проектов" value={stats.totalProjects} color="bg-blue-500" />
                    <StatCard icon={<Clock className="w-6 h-6" />} label="Всего задач" value={stats.totalTasks} color="bg-yellow-500" />
                    <StatCard icon={<AlertCircle className="w-6 h-6" />} label="В работе" value={stats.inProgress} color="bg-orange-500" />
                    <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Завершено" value={stats.completed} color="bg-green-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Projects Section */}
                    <section className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Мои проекты</h3>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" /> Создать проект
                            </button>
                        </div>

                        {projectsLoading ? (
                            <div className="text-center py-8 text-gray-500">Загрузка проектов...</div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">У вас пока нет проектов</div>
                        ) : (
                            <div className="space-y-3">
                                {projects.slice(0, 5).map((project) => (
                                    <Link
                                        key={project.id}
                                        to={`/projects/${project.id}`}
                                        className="block p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
                                    >
                                        <h4 className="font-semibold text-gray-900 mb-1">{project.name}</h4>
                                        <p className="text-sm text-gray-600 line-clamp-2">{project.description || 'Нет описания'}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{project.role}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Tasks Section */}
                    <section className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Мои задачи</h3>
                            <Link to="/tasks" className="text-green-600 hover:text-green-700 text-sm font-medium">Смотреть все →</Link>
                        </div>
                        {tasksLoading ? (
                            <div className="text-center py-8 text-gray-500">Загрузка задач...</div>
                        ) : tasks.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">У вас нет назначенных задач</div>
                        ) : (
                            <div className="space-y-3">
                                {tasks.slice(0, 5).map((task) => (
                                    <Link
                                        key={task.id}
                                        to={`/tasks/${task.id}`}
                                        className="block p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
                                                <p className="text-xs text-gray-500">{task.project_name}</p>
                                            </div>
                                            <StatusBadge status={task.status} />
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            <PriorityBadge priority={task.priority} />
                                            {task.due_date && (
                                                <span className="text-xs text-gray-500">
                                                    До {new Date(task.due_date).toLocaleDateString('ru-RU')}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Create Project Modal */}
                {showCreateModal && (
                    <CreateProjectModal
                        onClose={() => setShowCreateModal(false)}
                        onCreated={() => queryClient.invalidateQueries(['projects'])}
                    />
                )}
            </main>
        </div>
    );
}

// --- CreateProjectModal ---
function CreateProjectModal({ onClose, onCreated }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        try {
            setIsLoading(true);
            await api.post('/projects', { name, description });
            toast.success('Проект создан');
            onCreated();
            onClose();
        } catch {
            toast.error('Не удалось создать проект');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Создать новый проект</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Название проекта *</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="E-Commerce Platform"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            placeholder="Опишите ваш проект..."
                        />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Отмена</button>
                        <button type="submit" className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Создать проект</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
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

function StatusBadge({ status }) {
    const statusConfig = {
        new: { label: 'Новая', color: 'bg-gray-100 text-gray-800' },
        in_progress: { label: 'В работе', color: 'bg-blue-100 text-blue-800' },
        review: { label: 'Проверка', color: 'bg-yellow-100 text-yellow-800' },
        done: { label: 'Готово', color: 'bg-green-100 text-green-800' }
    };

    const config = statusConfig[status] || statusConfig.new;

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
        </span>
    );
}

function PriorityBadge({ priority }) {
    const priorityConfig = {
        low: { label: 'Низкий', color: 'bg-gray-100 text-gray-800' },
        medium: { label: 'Средний', color: 'bg-blue-100 text-blue-800' },
        high: { label: 'Высокий', color: 'bg-orange-100 text-orange-800' },
        critical: { label: 'Критичный', color: 'bg-red-100 text-red-800' }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
        </span>
    );
}