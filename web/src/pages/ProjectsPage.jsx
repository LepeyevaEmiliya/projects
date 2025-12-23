import { Link } from 'react-router-dom';
import { Plus, Search, Folder, Users, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

export function filterProjects(projects, query) {
    if (!query) return projects;
    return projects.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
    );
}

export default function ProjectsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const queryClient = useQueryClient();

    // Fetch projects через React Query
    const { data: projects = [], isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await api.get('/projects');
            return res.data.data; // убедитесь, что API возвращает объект с data
        },
        onError: () => {
            toast.error('Failed to load projects');
        }
    });

    const filteredProjects = filterProjects(projects, searchQuery);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
                    <p className="text-gray-600">Manage your projects and teams</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Project</span>
                </button>
            </div>

            {/* Actions/Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                    <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchQuery ? 'No projects found' : 'No projects yet'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {searchQuery
                            ? 'Try adjusting your search query'
                            : 'Create your first project to get started'
                        }
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create Project</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}

            {/* Create Project Modal */}
            {showCreateModal && (
                <CreateProjectModal 
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => queryClient.invalidateQueries(['projects'])}
                />
            )}
        </div>
    );
}

function ProjectCard({ project }) {
    return (
        <Link
            to={`/projects/${project.id}`}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-green-500 transition-all group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                        {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {project.description || 'No description'}
                    </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ml-2
                    ${project.role === 'owner' ? 'bg-purple-100 text-purple-700' : ''}
                    ${project.role === 'manager' ? 'bg-blue-100 text-blue-700' : ''}
                    ${project.role === 'participant' ? 'bg-gray-100 text-gray-700' : ''}
                `}>
                    {project.role}
                </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{project.member_count} members</span>
                </div>
                <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Owner */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                            {project.owner_name?.charAt(0) || '?'}
                        </span>
                    </div>
                    <span className="text-sm text-gray-600">
                        Owner: {project.owner_name || 'Unknown'}
                    </span>
                </div>
            </div>
        </Link>
    );
}

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
            toast.success('Project created');
            onCreated();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to create project');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Name *
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            placeholder="Describe your project..."
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            {isLoading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
