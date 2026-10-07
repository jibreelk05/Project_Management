import { useCallback, useEffect, useState } from 'react';
import { FolderPlus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectModal from '../components/projects/ProjectModal';
import ProjectMembersModal from '../components/projects/ProjectMembersModal';
import DeleteConfirmModal from '../components/projects/DeleteConfirmModal';
import { useAuth } from '../hooks/useAuth';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../services/projectService';

const STATUS_FILTERS = ['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const toIso = (value) => (value ? new Date(value).toISOString() : undefined);

export default function Projects() {
  const { user } = useAuth();
  const canManage = user?.role === 'PROJECT_MANAGER' || user?.role === 'ADMIN';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [managingProject, setManagingProject] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { limit: 100 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await getProjects(params);
      setProjects(res.data?.projects || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load projects.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  // Debounced fetch on search/status change
  useEffect(() => {
    const timer = setTimeout(fetchProjects, 300);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  const openModal = (project = null) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = async (form) => {
    if (!form.name || !form.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    const payload = {
      name: form.name,
      description: form.description || undefined,
      status: form.status,
      startDate: toIso(form.startDate),
      endDate: toIso(form.endDate),
    };
    try {
      setSubmitting(true);
      if (editingProject) {
        const response = await updateProject(editingProject._id, payload);
        toast.success('Project updated successfully');
        setProjects((prev) =>
          prev.map((p) => (p._id === editingProject._id ? response.data.project : p))
        );
      } else {
        const response = await createProject(payload);
        toast.success('Project created successfully');
        setProjects((prev) => [response.data.project, ...prev]);
      }
      closeModal();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save project.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteProject(deleteTarget._id);
      toast.success('Project deleted successfully');
      setProjects((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete project.';
      setError(errorMsg);
      toast.error(errorMsg);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const openMembersModal = (project) => {
    setManagingProject(project);
    setMembersModalOpen(true);
  };

  const closeMembersModal = () => {
    setMembersModalOpen(false);
    setManagingProject(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="mt-1 text-gray-500">Manage and track your projects.</p>
        </div>
        {canManage && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <FolderPlus size={18} />
            Add Project
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-64 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {STATUS_FILTERS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mt-4 flex items-start justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            onClick={() => { setError(''); fetchProjects(); }}
            className="ml-3 rounded-md px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-slate-200 bg-white p-5">
              <div className="h-5 w-3/4 rounded bg-slate-100"></div>
              <div className="mt-3 h-4 w-full rounded bg-slate-100"></div>
              <div className="mt-2 h-4 w-5/6 rounded bg-slate-100"></div>
              <div className="mt-4 flex gap-2">
                <div className="h-6 w-16 rounded bg-slate-100"></div>
                <div className="h-6 w-16 rounded bg-slate-100"></div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
            <FolderPlus size={20} className="text-slate-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-700">No projects found</p>
          <p className="mt-1 text-sm text-slate-500">
            {search || statusFilter !== 'ALL'
              ? 'Try adjusting your search or filters.'
              : 'Get started by creating your first project.'}
          </p>
          {canManage && !search && statusFilter === 'ALL' && (
            <button
              onClick={() => openModal()}
              className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Add Project
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              canManage={canManage}
              onEdit={openModal}
              onDelete={setDeleteTarget}
              onManageMembers={openMembersModal}
            />
          ))}
        </div>
      )}

      <ProjectModal
        open={modalOpen}
        initialData={editingProject}
        submitting={submitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <ProjectMembersModal
        open={membersModalOpen}
        project={managingProject}
        onClose={closeMembersModal}
        onUpdate={fetchProjects}
      />

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        projectName={deleteTarget?.name}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}