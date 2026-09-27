import { Link } from 'react-router-dom';
import { AlertCircle, ShieldAlert, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <Search className="h-12 w-12 text-gray-300" />
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Page Not Found</h1>
      <p className="mt-2 text-sm text-gray-500">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        Back to Home
      </Link>
    </div>
  );
}

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <AlertCircle className="h-12 w-12 text-amber-400" />
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Unauthorized</h1>
      <p className="mt-2 text-sm text-gray-500">Please sign in to access this page.</p>
      <Link to="/login" className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        Sign In
      </Link>
    </div>
  );
}

export function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <ShieldAlert className="h-12 w-12 text-red-400" />
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Access Denied</h1>
      <p className="mt-2 text-sm text-gray-500">You do not have permission to access this page.</p>
      <Link to="/" className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        Back to Home
      </Link>
    </div>
  );
}
