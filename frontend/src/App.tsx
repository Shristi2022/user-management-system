import { useState } from 'react';
import { 
  Users, UserPlus, FolderGit2, AlertCircle, CheckCircle2 
} from 'lucide-react';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import UserEdit from './components/UserEdit';

export default function App() {
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Trigger list refresh
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Show auto-dismiss notifications
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Handle Edit Action
  const handleEditSelect = (user: any) => {
    setEditingUser(user);
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to clean creation form
  const handleCreateSelect = () => {
    setEditingUser(null);
    setActiveTab('form');
  };

  // Handle CRUD Form Submission
  const handleFormSubmit = async (formData: any) => {
    setSubmitting(true);
    
    const isEditing = !!editingUser;
    const url = isEditing ? `/api/users/${editingUser.id}` : '/api/users';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (response.ok && resData.status === 'success') {
        showNotification(
          'success', 
          isEditing 
            ? `Successfully updated ${formData.fullName}'s profile!` 
            : `Successfully registered ${formData.fullName}!`
        );
        setEditingUser(null);
        handleRefresh();
        setActiveTab('list'); // Return to list view
      } else {
        showNotification('error', resData.message || 'Validation or processing error occurred.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      showNotification('error', 'Could not establish connection to the backend server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col p-4 md:p-8 selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Visual background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-100/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col z-10">
        
        {/* Floating Notification */}
        {notification && (
          <div 
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slideIn ${
              notification.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            )}
            <span className="text-xs font-semibold">{notification.message}</span>
          </div>
        )}

        {/* Top Header Panel */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 border border-purple-200 rounded-2xl text-purple-600">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
                Profile Management System
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage and organize user profiles efficiently</p>
            </div>
          </div>
        </header>

        {/* Dashboard Tabs & Action bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* Navigation Tabs */}
          <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm self-start">
            <button
              onClick={() => {
                setActiveTab('list');
                setEditingUser(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'list' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Profiles Directory
            </button>
            <button
              onClick={handleCreateSelect}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'form' && !editingUser
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Register Profile
            </button>
          </div>

          {/* Quick Stats or status */}
          {activeTab === 'form' && (
            <button
              onClick={() => {
                setActiveTab('list');
                setEditingUser(null);
              }}
              className="text-xs font-bold border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 px-4 py-2 rounded-xl transition-all cursor-pointer text-center shadow-sm"
            >
              ← Cancel and Return
            </button>
          )}
        </div>

        {/* Active Content Window */}
        <div className="flex-1">
          {activeTab === 'list' ? (
            <div className="space-y-6">
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleRefresh}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] font-mono text-slate-400 hover:text-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Reload DB
                </button>
              </div>

              <UserList 
                onEdit={handleEditSelect} 
                refreshTrigger={refreshTrigger}
                onRefresh={handleRefresh}
              />
            </div>
          ) : editingUser ? (
            <UserEdit
              userId={editingUser.id}
              onCancel={() => {
                setEditingUser(null);
                setActiveTab('list');
              }}
              onSuccess={() => {
                setEditingUser(null);
                handleRefresh();
                setActiveTab('list');
              }}
            />
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Register New User Record
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Provide the user information. Validated in real-time with Zod schemas.
                </p>
              </div>

              {/* Form mount (handles creation) */}
              <UserForm 
                key="create"
                onSubmitSuccess={handleFormSubmit}
                isSubmittingExternal={submitting}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-200 pt-6 pb-4 text-slate-450 text-[10px] text-center font-medium">
          Profile Management System
        </footer>

      </div>
    </div>
  );
}
