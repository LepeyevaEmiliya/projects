import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Calendar, Settings, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore(); // предполагаем, что есть метод обновления пользователя
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Личные данные
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Пароль
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Настройки
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);

  /* ====== Функции ====== */

  const handleSaveProfile = async () => {
    if (!name || !email) {
      toast.error('Fill all fields');
      return;
    }

    try {
      setLoading(true);
      const res = await api.patch('/auth/profile', { name, email });
      updateUser(res.data);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/change-password', {
        oldPassword: currentPassword,
        newPassword
      });
      toast.success(res.data.message);
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-white font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>

            <div className="space-y-3 border-t border-gray-200 pt-4 mt-4">
              <Stat label="Projects" value="3" />
              <Stat label="Tasks" value="12" />
              <Stat label="Completed" value="8" />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" /> Personal Information
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="space-y-4">
              <Input label="Full Name" value={name} onChange={setName} disabled={!isEditing} />
              <Input label="Email" value={email} onChange={setEmail} icon={<Mail className="w-5 h-5 text-gray-400" />} disabled={!isEditing} />
              <Input label="Member Since" value="January 2024" icon={<Calendar className="w-5 h-5 text-gray-400" />} disabled />

              {isEditing && (
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5" /> Security
            </h3>

            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                Change Password
              </button>
            ) : (
              <div className="space-y-4">
                <PasswordInput label="Current Password" value={currentPassword} onChange={setCurrentPassword} />
                <PasswordInput label="New Password" value={newPassword} onChange={setNewPassword} />
                <PasswordInput label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} />

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPasswordForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5" /> Preferences
            </h3>

            <Toggle label="Email Notifications" value={emailNotifications} onChange={setEmailNotifications} />
            <Toggle label="Task Reminders" value={taskReminders} onChange={setTaskReminders} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Helpers ===== */

function Stat({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function Input({ label, value, onChange, disabled, icon }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${icon ? 'pl-10' : ''} disabled:bg-gray-50`}
        />
      </div>
    </div>
  );
}

function PasswordInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type="password"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="font-medium text-gray-900">{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={e => onChange(e.target.checked)}
        className="h-5 w-5 rounded border-gray-300 focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}
