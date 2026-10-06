import { CalendarRange, Pencil, Trash2 } from 'lucide-react';

const STATUS_STYLES = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

export default function ProjectCard({ project, canManage, onEdit, onDelete }) {
  const { name, description, status, startDate, endDate } = project;

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            STATUS_STYLES[status] || STATUS_STYLES.TODO
          }`}
        >
          {status}
        </span>
      </div>

      <p className="mt-2 flex-1 text-sm text-gray-500">
        {description || 'No description provided.'}
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <CalendarRange size={14} />
          {formatDate(startDate)}
        </span>
        <span className="flex items-center gap-1">
          <CalendarRange size={14} />
          {formatDate(endDate)}
        </span>
      </div>

      {canManage && (
        <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3">
          <button
            onClick={() => onEdit(project)}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={() => onDelete(project)}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}