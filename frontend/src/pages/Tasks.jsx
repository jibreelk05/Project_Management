import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import TaskFilters from '../components/tasks/TaskFilters';
import DeleteConfirmModal from '../components/projects/DeleteConfirmModal';
import Pagination from '../components/common/Pagination';
import { useAuth } from '../hooks/useAuth';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { getProjects } from '../services/projectService';

const toIso = (value) => (value ? new Date(value).toISOString() : undefined);

export default function Tasks() {
  const { user } = useAuth();
  const canManage = user?.role === 'PROJECT_MANAGER' || user?.role === 'ADMIN';

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit: 10, sort };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      const res = await getTasks(params);
      setTasks(res.data?.tasks || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, sort, page]);

  const fetchProjectList = useCallback(async () => {
    try {
      const res = await getProjects({ limit: 100 });
      setProjects((res.data?.projects || []).filter((p) =>
        ['TODO', 'IN_PROGRESS'].includes(p.status),
      ));
    } catch { /* project listing is non-critical */ }
  }, []);

  useEffect(() => { fetchProjectList(); }, [fetchProjectList]);

  useEffect(() => {
    const timer = setTimeout(fetchTasks, 300);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const openModal = (task = null) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = async (form) => {
    const payload = {
      title: form.title,
      description: form.description || undefined,
      status: form.status,
      priority: form.priority,
      project: form.project || undefined,
      assignedTo: form.assignedTo || undefined,
      dueDate: toIso(form.dueDate),
    };
    try {
      setSubmitting(true);
      if (editingTask) {
        await updateTask(editingTask._id, payload);
      } else {
        await createTask(payload);
      }
      closeModal();
      await fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteTask(deleteTarget._id);
      setDeleteTarget(null);
      await fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <p className="mt-1 text-gray-500">Manage and track project tasks.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Plus size={18} />
          Add Task
        </button>
      </div>

      <div className="mt-6">
        <TaskFilters
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          status={statusFilter}
          onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
          priority={priorityFilter}
          onPriorityChange={(v) => { setPriorityFilter(v); setPage(1); }}
          sort={sort}
          onSortChange={(v) => { setSort(v); setPage(1); }}
        />
      </div>
      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <p className="mt-8 text-sm text-gray-500">Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm font-medium text-gray-600">No tasks found</p>
          <p className="mt-1 text-sm text-gray-400">
            {search || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
              ? 'Try adjusting your search or filters.'
              : 'Click "Add Task" to create your first task.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              canManage={canManage}
              onEdit={openModal}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}
      <Pagination
        page={pagination.page}
        totalPages={pagination.pages}
        total={pagination.total}
        onPageChange={setPage}
      />

      <TaskModal
        open={modalOpen}
        initialData={editingTask}
        projects={projects}
        submitting={submitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        projectName={deleteTarget?.title || deleteTarget?.name || ''}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}