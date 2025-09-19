'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Tutorial {
  _id: string;
  title: string;
  description?: string;
  author?: string;
  category?: string;
  difficulty?: string;
  readTime?: number;
  totalChapters?: number;
  createdAt: string;
}

export default function Home() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTutorials() {
      try {
        const response = await fetch('/api/tutorials');
        const data = await response.json();
        
        if (response.ok) {
          setTutorials(data.tutorials || []);
        } else if (response.status === 504 || response.status === 503) {
          // Handle gateway timeout or service unavailable
          console.log('Database temporarily unavailable, showing empty state');
          setTutorials([]);
          setError('Database temporarily unavailable. The site is loading content...');
        } else {
          setError(data.error || 'Failed to fetch tutorials');
        }
      } catch {
        console.log('Network error, showing empty state');
        setTutorials([]);
        setError('Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }

    fetchTutorials();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading tutorials...</div>
      </div>
    );
  }

  if (error && tutorials.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <h1 className="text-4xl font-normal text-gray-900 text-center mb-4">
              Learn from First Principles
            </h1>
            <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto leading-relaxed">
              Every complex topic has simple fundamentals. We break them down step-by-step, so you build 
              real understanding instead of memorizing facts.
            </p>
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center py-16">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-medium text-amber-800 mb-2">Service Temporarily Unavailable</h2>
              <p className="text-amber-700">
                We&apos;re experiencing some technical difficulties. Please try refreshing the page in a few moments.
              </p>
            </div>
            <p className="text-gray-600 text-sm">
              Technical details: {error}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-normal text-gray-900 text-center mb-4">
            Learn from First Principles
          </h1>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto leading-relaxed">
            Every complex topic has simple fundamentals. We break them down step-by-step, so you build 
            real understanding instead of memorizing facts.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {tutorials.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-normal text-gray-900 mb-4">No tutorials yet</h2>
            <p className="text-gray-600">
              Check back soon for new content, or contact the admin to add tutorials.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-normal text-gray-900 mb-2">
                What&apos;s New & What You Started
              </h2>
              <p className="text-gray-600">
                Fresh tutorials to explore and pick up where you left off
              </p>
            </div>

            <div className="space-y-6">
              {tutorials.map((tutorial) => (
                <article key={tutorial._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {tutorial.category && (
                        <span className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full">
                          {tutorial.category}
                        </span>
                      )}
                      {tutorial.difficulty && (
                        <span className="text-sm text-gray-600">
                          {tutorial.difficulty}
                        </span>
                      )}
                    </div>
                    <time className="text-sm text-gray-500">
                      {new Date(tutorial.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </time>
                  </div>

                  <h3 className="text-xl font-medium text-gray-900 mb-3">
                    <Link 
                      href={`/tutorial/${tutorial._id}`}
                      className="hover:text-amber-600 transition-colors"
                    >
                      {tutorial.title}
                    </Link>
                  </h3>

                  {tutorial.description && (
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {tutorial.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {tutorial.totalChapters && (
                        <span>📚 {tutorial.totalChapters} chapters</span>
                      )}
                      {tutorial.readTime && (
                        <span>⏱ {tutorial.readTime} min read</span>
                      )}
                      {tutorial.author && (
                        <span>By {tutorial.author}</span>
                      )}
                    </div>
                    <Link
                      href={`/tutorial/${tutorial._id}`}
                      className="text-amber-600 hover:text-amber-800 font-medium transition-colors"
                    >
                      Start Reading →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-600">
            Built for collaborative learning through first principles thinking
          </p>
        </div>
      </footer>
    </div>
  );
}