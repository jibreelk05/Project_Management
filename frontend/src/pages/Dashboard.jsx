import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">
        Welcome, {user?.name || 'User'}!
      </h2>
      <p className="mt-1 text-gray-500">
        Here&apos;s an overview of your projects and tasks.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
          <p className="mt-1 text-3xl font-bold text-gray-900">—</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Open Tasks</h3>
          <p className="mt-1 text-3xl font-bold text-gray-900">—</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Team Members</h3>
          <p className="mt-1 text-3xl font-bold text-gray-900">—</p>
        </div>
      </div>
    </div>
  );
}