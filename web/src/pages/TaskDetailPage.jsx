import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  User,
  Clock,
  AlertCircle,
  MessageSquare,
  Edit,
  Trash2,
  Send
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [newComment, setNewComment] = useState('');

  const statusConfig = {
    new: { label: 'New', color: 'bg-gray-100 text-gray-800' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    review: { label: 'Review', color: 'bg-yellow-100 text-yellow-800' },
    done: { label: 'Done', color: 'bg-green-100 text-green-800' }
  };

  const priorityConfig = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical'
  };

  const typeConfig = {
    task: '📋 Task',
    bug: '🐛 Bug',
    improvement: '✨ Improvement',
    research: '🔍 Research'
  };

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const res = await api.get(`/tasks/${id}`);
      return res.data.data;
    },
    onSuccess: (task) => {
      setEditForm({
        title: task.title || '',
        description: task.description || ''
      });
    }
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['taskComments', id],
    queryFn: async () => {
      const res = await api.get(`/tasks/${id}/comments`);
      return res.data.data;
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: (payload) => api.patch(`/tasks/${id}`, payload),
    onSuccess: (res) => {
      queryClient.setQueryData(['task', id], res.data.data);
      setIsEditing(false);
    }
  });

  const changeStatusMutation = useMutation({
    mutationFn: (status) =>
      api.patch(`/tasks/${id}/status`, { status }),
    onSuccess: (res) => {
      queryClient.setQueryData(['task', id], (old) => ({
        ...old,
        status: res.data.data.status,
        updated_at: res.data.data.updated_at
      }));
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: (text) =>
      api.post(`/tasks/${id}/comments`, { text }),
    onSuccess: (res) => {
      queryClient.setQueryData(['taskComments', id], (old = []) => [
        res.data.data,
        ...old
      ]);
      setNewComment('');
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: () => api.delete(`/tasks/${id}`),
    onSuccess: () => navigate('/tasks')
  });

  const handleSave = () => {
    updateTaskMutation.mutate(editForm);
  };

  const handleStatusChange = (status) => {
    if (status !== task.status) {
      changeStatusMutation.mutate(status);
    }
  };

  if (taskLoading || commentsLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!task) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Task not found</h2>
        <Link to="/tasks" className="text-green-600">← Back</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm">
        <Link to="/tasks" className="text-green-600">Tasks</Link> / {task.title}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN */}
        <div className="lg:col-span-2 space-y-6">
          {/* TASK */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex justify-between">
              <div>
                {isEditing ? (
                  <input
                    className="text-xl font-bold border-b w-full"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                  />
                ) : (
                  <h1 className="text-xl font-bold">{task.title}</h1>
                )}

                <div className="mt-2 flex gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded ${statusConfig[task.status]?.color}`}>
                    {statusConfig[task.status]?.label}
                  </span>
                  <span className="px-3 py-1 rounded bg-gray-100">
                    {priorityConfig[task.priority]}
                  </span>
                  <span className="px-3 py-1 rounded bg-gray-100">
                    {typeConfig[task.task_type]}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setIsEditing(!isEditing)}>
                  <Edit />
                </button>
                <button onClick={() => deleteTaskMutation.mutate()}>
                  <Trash2 className="text-red-600" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              {isEditing ? (
                <textarea
                  rows={4}
                  className="w-full border rounded p-2"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              ) : (
                <p>{task.description || 'No description'}</p>
              )}
            </div>

            {isEditing && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="border px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* STATUS */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-3">Change status</h3>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(statusConfig).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-4 py-2 rounded ${
                    task.status === s
                      ? statusConfig[s].color
                      : 'bg-gray-100'
                  }`}
                >
                  {statusConfig[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* COMMENTS */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex gap-2">
              <MessageSquare /> Comments ({comments.length})
            </h3>

            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="border rounded p-3">
                  <div className="text-sm font-medium">{c.user_name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(c.created_at).toLocaleString()}
                  </div>
                  <p className="mt-2">{c.text}</p>
                </div>
              ))}
            </div>

            <textarea
              className="w-full border rounded p-2 mt-4"
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />

            <div className="flex justify-end mt-2">
              <button
                disabled={!newComment.trim()}
                onClick={() => addCommentMutation.mutate(newComment)}
                className="bg-green-600 text-white px-4 py-2 rounded flex gap-2"
              >
                <Send /> Comment
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <Sidebar task={task} />
      </div>
    </div>
  );
}

/* ================= SIDEBAR ================= */

function Sidebar({ task }) {
  return (
    <div className="bg-white border rounded-lg p-6 space-y-4">
      <h3 className="font-semibold">Details</h3>

      <div>
        <AlertCircle className="inline w-4 h-4 mr-1" />
        <Link to={`/projects/${task.project_id}`} className="text-green-600">
          {task.project_name}
        </Link>
      </div>

      <div>
        <User className="inline w-4 h-4 mr-1" />
        {task.assignee_name || 'Unassigned'}
      </div>

      {task.due_date && (
        <div>
          <Calendar className="inline w-4 h-4 mr-1" />
          {new Date(task.due_date).toLocaleDateString()}
        </div>
      )}

      <div>
        <Clock className="inline w-4 h-4 mr-1" />
        Created by {task.created_by_name}
      </div>
    </div>
  );
}
