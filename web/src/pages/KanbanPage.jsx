import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';

export default function KanbanPage() {
    const { id } = useParams();
    const token = useAuthStore(state => state.token);

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '', priority: '', type: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [draggedTask, setDraggedTask] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectRes, tasksRes] = await Promise.all([
                    api.get(`/projects/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    api.get(`/projects/${id}/tasks`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
    
                setProject(projectRes.data.data);
                setTasks(tasksRes.data.data?.tasks || []);
            } catch (err) {
                console.error('Failed to load kanban data', err);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchData();
    }, [id, token]);

    const columns = [
        { id: 'new', title: 'New', color: 'border-gray-300' },
        { id: 'in_progress', title: 'In Progress', color: 'border-blue-500' },
        { id: 'review', title: 'Review', color: 'border-yellow-500' },
        { id: 'done', title: 'Done', color: 'border-green-500' }
    ];

    // Обработчик перемещения задачи
    const handleTaskMove = async (taskId, newStatus) => {
        const taskToUpdate = tasks.find(t => t.id === taskId);
        if (!taskToUpdate || taskToUpdate.status === newStatus) return;

        const oldStatus = taskToUpdate.status;

        // Обновление UI
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, status: newStatus } : task
            )
        );

        try {
            const response = await api.patch(
                `/tasks/${taskId}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId 
                        ? { 
                            ...task, 
                            status: response.data.data.status,
                            updated_at: response.data.data.updated_at 
                          }
                        : task
                )
            );
        } catch (err) {
            console.error('Failed to update task status', err);
            
            // Откатываем изменения в случае ошибки
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId ? { ...task, status: oldStatus } : task
                )
            );
            
            alert('Failed to update task status. Please try again.');
        }
    };

    // Фильтрация
    const filteredTasks = tasks.filter(task => {
        const matchesStatus = filters.status ? task.status === filters.status : true;
        const matchesPriority = filters.priority ? task.priority === filters.priority : true;
        const matchesType = filters.type ? task.task_type === filters.type : true;
        return matchesStatus && matchesPriority && matchesType;
    });

    if (isLoading) {
        return (
            <div className="p-6 text-center text-gray-500">
                Loading kanban board...
            </div>
        );
    }

    return (
        <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {project?.name} — Kanban Board
                </h1>
                <p className="text-gray-600">
                    Drag and drop tasks between columns to update status
                </p>
            </div>

            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-4 h-full min-w-max">
                    {columns.map(column => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            tasks={filteredTasks.filter(t => t.status === column.id)}
                            onTaskMove={handleTaskMove}
                            draggedTask={draggedTask}
                            setDraggedTask={setDraggedTask}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function KanbanColumn({ column, tasks, onTaskMove, draggedTask, setDraggedTask }) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        
        if (draggedTask && draggedTask.status !== column.id) {
            onTaskMove(draggedTask.id, column.id);
        }
        setDraggedTask(null);
    };

    return (
        <div 
            className={`flex-1 min-w-[300px] max-w-[350px] flex flex-col rounded-lg p-4 transition-colors ${
                isDragOver ? 'bg-green-50 border-2 border-green-400' : 'bg-gray-50 border-2 border-transparent'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className={`flex items-center justify-between mb-4 pb-3 border-b-2 ${column.color}`}>
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="bg-gray-200 text-gray-700 text-sm font-medium px-2 py-1 rounded">
                    {tasks.length}
                </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
                {tasks.map((task) => (
                    <KanbanCard 
                        key={task.id} 
                        task={task}
                        setDraggedTask={setDraggedTask}
                        isDragging={draggedTask?.id === task.id}
                    />
                ))}
                {tasks.length === 0 && (
                    <div className={`text-center text-sm py-8 rounded-lg border-2 border-dashed transition-colors ${
                        isDragOver ? 'border-green-400 text-green-600 bg-green-50' : 'border-gray-300 text-gray-400'
                    }`}>
                        {isDragOver ? 'Drop here' : 'No tasks'}
                    </div>
                )}
            </div>
        </div>
    );
}

function KanbanCard({ task, setDraggedTask, isDragging }) {
    const priorityColors = {
        low: 'bg-gray-100 text-gray-700',
        medium: 'bg-blue-100 text-blue-700',
        high: 'bg-orange-100 text-orange-700',
        critical: 'bg-red-100 text-red-700'
    };

    const handleDragStart = (e) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setDraggedTask(null);
    };

    return (
        <div 
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-move ${
                isDragging ? 'opacity-50 rotate-2 scale-95' : 'opacity-100'
            }`}
        >
            <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>

            <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded font-medium ${priorityColors[task.priority]}`}>
                    {task.priority}
                </span>
                {task.assignee_name && (
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                            {task.assignee_name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}