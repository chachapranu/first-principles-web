'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tutorial {
  _id: string;
  title: string;
  description?: string;
  author?: string;
  githubUrl: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [githubUrl, setGithubUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated');
    if (!isAuthenticated) {
      router.push('/admin');
      return;
    }
    
    fetchTutorials();
  }, [router]);

  const fetchTutorials = async () => {
    try {
      const response = await fetch('/api/tutorials');
      const data = await response.json();
      if (response.ok) {
        setTutorials(data.tutorials);
      }
    } catch (error) {
      console.error('Error fetching tutorials:', error);
    }
  };

  const handleAddTutorial = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ githubUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.addedTutorials) {
          // Folder import result
          setMessage(`${data.message}${data.errors ? `\n\nWarnings:\n${data.errors.join('\n')}` : ''}`);
        } else {
          // Single file import result
          setMessage(data.message);
        }
        setMessageType('success');
        setGithubUrl('');
        fetchTutorials();
      } else {
        setMessage(data.error || 'Failed to add tutorial');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Network error occurred');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTutorial = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Tutorial deleted successfully!');
        setMessageType('success');
        fetchTutorials();
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to delete tutorial');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Network error occurred');
      setMessageType('error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-normal text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-amber-600 hover:text-amber-800 transition-colors"
              >
                View Site
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Add New Tutorial</h2>
              
              <form onSubmit={handleAddTutorial} className="space-y-4">
                <div>
                  <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Markdown URL
                  </label>
                  <input
                    id="githubUrl"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/user/repo/tree/main/folder OR https://github.com/user/repo/blob/main/file.md"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Folder URL:</strong> Paste a GitHub folder URL (with /tree/) to import all markdown files recursively.<br/>
                    <strong>File URL:</strong> Paste a GitHub file URL (with /blob/) to import a single markdown file.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Adding...' : 'Add Tutorial'}
                </button>
              </form>

              {message && (
                <div className={`mt-4 p-3 rounded ${
                  messageType === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-medium text-gray-900">
                  All Tutorials ({tutorials.length})
                </h2>
              </div>
              
              {tutorials.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No tutorials yet. Add your first tutorial using the form on the left.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {tutorials.map((tutorial) => (
                    <div key={tutorial._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            <Link 
                              href={`/tutorial/${tutorial._id}`}
                              className="hover:text-amber-600 transition-colors"
                              target="_blank"
                            >
                              {tutorial.title}
                            </Link>
                          </h3>
                          
                          {tutorial.description && (
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {tutorial.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {tutorial.author && (
                              <span>By {tutorial.author}</span>
                            )}
                            <span>
                              {new Date(tutorial.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <a
                              href={tutorial.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-600 hover:text-amber-800 transition-colors"
                            >
                              GitHub →
                            </a>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteTutorial(tutorial._id, tutorial.title)}
                          className="ml-4 text-red-600 hover:text-red-800 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}