'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  chapters?: Chapter[];
  author?: string;
  totalChapters?: number;
  createdAt: string;
  githubUrl: string;
}

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chapterNumber = parseInt(params.chapterNumber as string);

  useEffect(() => {
    async function fetchTutorial() {
      try {
        const response = await fetch(`/api/tutorials/${params.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setTutorial(data.tutorial);
          
          // Find the current chapter
          if (data.tutorial.chapters && data.tutorial.chapters.length > 0) {
            const chapter = data.tutorial.chapters.find((ch: Chapter) => ch.order === chapterNumber);
            if (chapter) {
              setCurrentChapter(chapter);
            } else {
              setError('Chapter not found');
            }
          } else {
            setError('This tutorial does not have chapters');
          }
        } else {
          setError(data.error || 'Failed to fetch tutorial');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }

    if (params.id && chapterNumber) {
      fetchTutorial();
    }
  }, [params.id, chapterNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading chapter...</div>
      </div>
    );
  }

  if (error || !tutorial || !currentChapter) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error || 'Chapter not found'}</div>
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

  const prevChapter = tutorial.chapters?.find(ch => ch.order === chapterNumber - 1);
  const nextChapter = tutorial.chapters?.find(ch => ch.order === chapterNumber + 1);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link 
              href={`/tutorial/${tutorial._id}`}
              className="text-amber-600 hover:text-amber-800 transition-colors flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to overview</span>
            </Link>
            
            <div className="text-sm text-gray-500 text-center">
              <div className="font-medium">{tutorial.title}</div>
              <div>Chapter {chapterNumber} of {tutorial.totalChapters}</div>
            </div>
            
            <div className="text-sm text-gray-500">
              {currentChapter.readTime && `⏱ ${currentChapter.readTime} min`}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <article className="prose prose-lg max-w-none">
          <header className="mb-12 text-center border-b border-gray-200 pb-8">
            <div className="text-sm text-amber-600 font-medium mb-2">
              Chapter {chapterNumber}
            </div>
            <h1 className="text-4xl font-normal text-gray-900 mb-6 leading-tight">
              {currentChapter.title}
            </h1>
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
              {currentChapter.content}
            </ReactMarkdown>
          </div>
        </article>

        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            {prevChapter ? (
              <Link
                href={`/tutorial/${tutorial._id}/chapter/${prevChapter.order}`}
                className="flex items-center space-x-2 text-amber-600 hover:text-amber-800 transition-colors"
              >
                <span>←</span>
                <div>
                  <div className="text-sm text-gray-500">Previous</div>
                  <div className="font-medium">{prevChapter.title}</div>
                </div>
              </Link>
            ) : (
              <div></div>
            )}

            {nextChapter ? (
              <Link
                href={`/tutorial/${tutorial._id}/chapter/${nextChapter.order}`}
                className="flex items-center space-x-2 text-amber-600 hover:text-amber-800 transition-colors text-right"
              >
                <div>
                  <div className="text-sm text-gray-500">Next</div>
                  <div className="font-medium">{nextChapter.title}</div>
                </div>
                <span>→</span>
              </Link>
            ) : (
              <Link
                href={`/tutorial/${tutorial._id}`}
                className="flex items-center space-x-2 text-amber-600 hover:text-amber-800 transition-colors"
              >
                <div>
                  <div className="text-sm text-gray-500">Completed!</div>
                  <div className="font-medium">Back to overview</div>
                </div>
                <span>✓</span>
              </Link>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}