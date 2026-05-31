import { useState, useEffect } from 'react';
import { 
  Mail, Briefcase, Trash2, Edit2, Phone, Calendar, 
  Tag, Users, Loader2, AlertCircle 
} from 'lucide-react';


interface UserRecord {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  occupation: string;
  skills: string[];
  notes?: string;
  profileImage?: string;
  createdAt: string;
}

interface UserListProps {
  onEdit: (user: UserRecord) => void;
  refreshTrigger: number;
  onRefresh: () => void;
}

export default function UserList({ onEdit, refreshTrigger, onRefresh }: UserListProps) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch users from backend GET /api/users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/users');
        const resData = await response.json();
        
        if (response.ok && resData.status === 'success') {
          setUsers(resData.data || []);
        } else {
          setError(resData.message || 'Failed to fetch user profiles.');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Could not connect to the server. Please check if the API is active.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [refreshTrigger]);

  // Handle DELETE request to /api/users/:id
  const handleDeleteUser = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}'s profile?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Update local state instantly for optimal UX
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
        onRefresh();
      } else {
        alert(data.message || 'Failed to delete user profile.');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('An error occurred while attempting to delete this profile.');
    } finally {
      setDeletingId(null);
    }
  };

  // Helper to format dates beautifully
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  // Loading Skeleton State (highly premium aesthetic)
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="w-full bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-3 w-full">
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
            <div className="flex gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-slate-100" />
              <div className="w-10 h-10 rounded-xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error Alert State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3 shadow-sm animate-fadeIn">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <h3 className="text-lg font-bold text-red-800">Database Connection Failed</h3>
        <p className="text-xs text-red-600 max-w-sm">{error}</p>
        <button 
          onClick={onRefresh}
          className="mt-2 text-xs bg-red-100 border border-red-250 text-red-700 hover:bg-red-200/60 px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Empty Registry State
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm animate-fadeIn">
        <div className="p-4 rounded-full bg-slate-50 border border-slate-100 text-slate-400">
          <Users className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">No Profiles Registered</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-xs">
            Start by creating a new profile using the registration form.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop/Tablet Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-2 font-mono">
        <span>Displaying {users.length} active record{users.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Grid of Users (Desktop Table-like rendering mapped to Cards for Mobile responsiveness) */}
      <div className="grid grid-cols-1 gap-4">
        {users.map((user) => {
          // Fallback initials for missing profile photo
          const initials = user.fullName
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

          return (
            <div 
              key={user.id} 
              className="w-full bg-white border border-slate-200 hover:border-purple-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 transition-all duration-300 group hover:shadow-md"
            >
              
              {/* Profile Image & Status */}
              <div className="relative shrink-0 self-center md:self-start mt-1">
                <div className="w-16 h-16 rounded-full border border-slate-250 bg-white flex items-center justify-center overflow-hidden shadow-inner">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.fullName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 flex items-center justify-center text-lg font-bold font-mono">
                      {initials}
                    </div>
                  )}
                </div>
              </div>

              {/* Core Attributes */}
              <div className="flex-1 w-full space-y-3">
                {/* Name and Occupation */}
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-purple-600 transition-colors">
                    {user.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-semibold">
                    <Briefcase className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    {user.occupation}
                  </p>
                </div>

                {/* Grid contact columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {user.phoneNumber}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    DoB: {formatDate(user.dateOfBirth)}
                  </span>
                </div>

                {/* Display Skills as tags */}
                {user.skills && user.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {user.skills.map((skill, i) => (
                      <span 
                        key={i} 
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] text-slate-600 font-semibold"
                      >
                        <Tag className="w-2.5 h-2.5 text-purple-600 shrink-0" />
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons Panel */}
              <div className="flex md:flex-col gap-2 w-full md:w-auto shrink-0 border-t border-slate-100 md:border-none pt-4 md:pt-0 mt-2 md:mt-0 justify-end">
                {/* Edit profile */}
                <button
                  onClick={() => onEdit(user)}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  <Edit2 className="w-3.5 h-3.5 text-purple-600" />
                  Edit
                </button>

                {/* Delete profile */}
                <button
                  onClick={() => handleDeleteUser(user.id, user.fullName)}
                  disabled={deletingId === user.id}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-355 text-red-650 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {deletingId === user.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  )}
                  Delete
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
