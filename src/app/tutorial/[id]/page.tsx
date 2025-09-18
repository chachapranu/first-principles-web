'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Chapter {
  title: string;
  content: string;
  order: number;
  readTime?: number;
}

interface Tutorial {
  _id: string;
  title: string;
  description?: string;
  content?: string; // For backward compatibility
  chapters?: Chapter[];
  author?: string;
  category?: string;
  difficulty?: string;
  readTime?: number;
  totalChapters?: number;
  createdAt: string;
  githubUrl: string;
}

export default function TutorialPage() {
  const params = useParams();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTutorial() {
      try {
        const response = await fetch(`/api/tutorials/${params.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setTutorial(data.tutorial);
        } else {
          setError(data.error || 'Failed to fetch tutorial');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchTutorial();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading tutorial...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to tutorials
          </Link>
        </div>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Tutorial not found</div>
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to tutorials
          </Link>
        </div>
      </div>
    );
  }

  // Check if this tutorial has chapters
  const hasChapters = tutorial.chapters && tutorial.chapters.length > 0;

  if (hasChapters) {
    // Show chapter overview page
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <Link 
              href="/" 
              className="text-amber-600 hover:text-amber-800 transition-colors flex items-center space-x-2 mb-6"
            >
              <span>←</span>
              <span>Back to all tutorials</span>
            </Link>
            
            <h1 className="text-4xl font-normal text-gray-900 mb-4">
              {tutorial.title}
            </h1>
            
            {tutorial.description && (
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {tutorial.description}
              </p>
            )}
            
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>📚 {tutorial.totalChapters} chapters</span>
              {tutorial.readTime && (
                <span>⏱ {tutorial.readTime} min total</span>
              )}
              {tutorial.author && (
                <span>By {tutorial.author}</span>
              )}
              {tutorial.difficulty && (
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  {tutorial.difficulty}
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-normal text-gray-900 mb-4">Table of Contents</h2>
            <p className="text-gray-600 mb-8">
              Follow this structured learning path to master the concepts step by step.
            </p>
          </div>

          <div className="space-y-4">
            {tutorial.chapters!.sort((a, b) => a.order - b.order).map((chapter, index) => (
              <Link
                key={chapter.order}
                href={`/tutorial/${tutorial._id}/chapter/${chapter.order}`}
                className="block border border-gray-200 rounded-lg p-6 hover:shadow-sm hover:border-amber-200 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full font-medium">
                        Chapter {chapter.order}
                      </span>
                      {chapter.readTime && (
                        <span className="text-sm text-gray-500">
                          ⏱ {chapter.readTime} min
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-medium text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                      {chapter.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {chapter.content.split('\n').find(line => line.trim() && !line.startsWith('#'))?.substring(0, 150) + '...'}
                    </p>
                  </div>
                  
                  <div className="ml-4 text-amber-600 group-hover:text-amber-800 transition-colors">
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 p-6 bg-amber-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to start learning?</h3>
            <p className="text-gray-600 mb-4">
              Begin with Chapter 1 and work your way through each section at your own pace.
            </p>
            <Link
              href={`/tutorial/${tutorial._id}/chapter/1`}
              className="inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
            >
              <span>Start with Chapter 1</span>
              <span>→</span>
            </Link>
          </div>

          {tutorial.githubUrl && (
            <div className="text-center mt-8">
              <a
                href={tutorial.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                View source on GitHub →
              </a>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Fallback for tutorials without chapters (backward compatibility)
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link 
              href="/" 
              className="text-amber-600 hover:text-amber-800 transition-colors flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to tutorials</span>
            </Link>
            
            <div className="text-sm text-gray-500">
              {tutorial.title}
            </div>
            
            <div className="text-sm text-gray-500">
              {tutorial.readTime && `⏱ ${tutorial.readTime} min`}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <article className="prose prose-lg max-w-none">
          <header className="mb-12 text-center border-b border-gray-200 pb-12">
            <h1 className="text-4xl font-normal text-gray-900 mb-6 leading-tight">
              {tutorial.title}
            </h1>
            
            {tutorial.description && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {tutorial.description}
              </p>
            )}
            
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              {tutorial.readTime && (
                <span>⏱ {tutorial.readTime} min read</span>
              )}
              {tutorial.author && (
                <span>By {tutorial.author}</span>
              )}
              {tutorial.difficulty && (
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  {tutorial.difficulty}
                </span>
              )}
              <time>
                {new Date(tutorial.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
            </div>
          </header>

          <div className="tutorial-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-medium text-gray-900 mt-12 mb-6 leading-tight">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-medium text-gray-900 mt-10 mb-5 leading-tight">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-medium text-gray-900 mt-8 mb-4 leading-tight">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="text-gray-700 leading-relaxed mb-6 text-lg space-y-2 pl-6">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="text-gray-700 leading-relaxed mb-6 text-lg space-y-2 pl-6">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700">
                    {children}
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-amber-400 bg-amber-50 pl-6 py-4 mb-6 italic text-gray-700">
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isInline = !className || !className.includes('language-');
                  return isInline ? (
                    <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-base font-mono">
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto mb-6">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto mb-6">
                    {children}
                  </pre>
                ),
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    className="text-amber-600 hover:text-amber-800 transition-colors underline"
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {tutorial.content}
            </ReactMarkdown>
          </div>
        </article>

        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center">
            <Link 
              href="/" 
              className="inline-flex items-center space-x-2 text-amber-600 hover:text-amber-800 transition-colors"
            >
              <span>←</span>
              <span>Back to all tutorials</span>
            </Link>
          </div>
          
          {tutorial.githubUrl && (
            <div className="text-center mt-4">
              <a
                href={tutorial.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                View source on GitHub →
              </a>
            </div>
          )}
        </footer>
      </main>
    </div>
  );
}