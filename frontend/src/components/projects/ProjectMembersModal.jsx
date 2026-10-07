import { useEffect, useState } from 'react';
import { X, UserPlus, UserMinus } from 'lucide-react';
import { getUsers, assignMemberToProject, removeMemberFromProject } from '../../services/teamService';

export default function ProjectMembersModal({ open, project, onClose, onUpdate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionInProgress, setActionInProgress] = useState(null);

  useEffect(() => {
    if (open && project) {
      fetchUsers();
    }
  }, [open, project]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getUsers();
      setUsers(res.data?.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (userId) => {
    try {
      setActionInProgress(userId);
      setError('');
      const response = await assignMemberToProject(project._id, userId);

      // Update local project state with returned project data
      if (response.data?.project) {
        const updatedProject = response.data.project;
        project.teamMembers = updatedProject.teamMembers;
      }

      onUpdate?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign member.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRemove = async (userId) => {
    try {
      setActionInProgress(userId);
      setError('');
      const response = await removeMemberFromProject(project._id, userId);

      // Update local project state with returned project data
      if (response.data?.project) {
        const updatedProject = response.data.project;
        project.teamMembers = updatedProject.teamMembers;
      }

      onUpdate?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member.');
    } finally {
      setActionInProgress(null);
    }
  };

  const isMember = (userId) =>
    project?.teamMembers?.some((m) => m._id === userId || m === userId) ||
    project?.members?.some((m) => m._id === userId || m === userId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Manage Team Members</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-1 text-sm text-gray-500">Project: {project?.name}</p>

        {error && <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        {loading ? (
          <p className="mt-6 text-sm text-gray-500">Loading team members…</p>
        ) : (
          <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
            {users.map((u) => {
              const assigned = isMember(u._id);
              const isPending = actionInProgress === u._id;
              return (
                <div
                  key={u._id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">
                      {u.email} · {u.role}
                    </p>
                  </div>
                  {assigned ? (
                    <button
                      onClick={() => handleRemove(u._id)}
                      disabled={isPending}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      <UserMinus size={14} />
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAssign(u._id)}
                      disabled={isPending}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-50"
                    >
                      <UserPlus size={14} />
                      Assign
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
