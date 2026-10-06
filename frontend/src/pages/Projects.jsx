import { useCallback, useEffect, useState } from 'react';
import { FolderPlus, Search } from 'lucide-react';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectModal from '../components/projects/ProjectModal';
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
      setError(err.response?.data?.message || 'Failed to load projects.');
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
        await updateProject(editingProject._id, payload);
      } else {
        await createProject(payload);
      }
      closeModal();
      await fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteProject(deleteTarget._id);
      setDeleteTarget(null);
      await fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
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

      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <p className="mt-8 text-sm text-gray-500">Loading projects…</p>
      ) : projects.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm font-medium text-gray-600">No projects found</p>
          <p className="mt-1 text-sm text-gray-400">
            {search || statusFilter !== 'ALL'
              ? 'Try adjusting your search or filters.'
              : 'Click “Add Project” to create your first project.'}
          </p>
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