import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import UserForm from './UserForm';

interface UserEditProps {
  userId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function UserEdit({ userId, onCancel, onSuccess }: UserEditProps) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch single user by ID on mount
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/users/${userId}`);
        const resData = await response.json();

        if (response.ok && resData.status === 'success') {
          setUser(resData.data);
        } else {
          setError(resData.message || 'Failed to retrieve the profile data.');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Could not connect to the database server.');
      } finally {
        setUser(null); // Clear previous user state if error occurs, just in case
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Display notification alerts
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Submit PUT request to update single record
  const handleFormSubmit = async (formData: any) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (response.ok && resData.status === 'success') {
        showNotification('success', 'Profile updated successfully!');
        // Allow a brief delay for user to read success notification, then invoke callback
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        showNotification('error', resData.message || 'Could not update profile.');
      }
    } catch (err) {
      console.error('Update submit error:', err);
      showNotification('error', 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Floating alert */}
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

      {/* Navigation action header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <button 
            onClick={onCancel}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors font-bold mb-2 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Directory
          </button>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Edit User Profile
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Modify current user attributes. Data validations are strictly applied on update.
          </p>
        </div>
      </div>

      {/* States Window */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center space-y-4 shadow-sm animate-pulse">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Retrieving profile information...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-12 flex flex-col items-center justify-center space-y-4 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 animate-bounce" />
          <h3 className="text-lg font-bold text-red-800">Error Fetching Profile</h3>
          <p className="text-xs text-red-600 max-w-sm">{error}</p>
          <button
            onClick={onCancel}
            className="bg-red-100 hover:bg-red-200/50 text-red-700 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Return to List
          </button>
        </div>
      ) : (
        /* Form mount with populated data */
        user && (
          <UserForm 
            initialData={user}
            onSubmitSuccess={handleFormSubmit}
            isSubmittingExternal={submitting}
          />
        )
      )}
    </div>
  );
}
