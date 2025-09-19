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
  chapters?: Chapter[];
  author?: string;
  totalChapters?: number;
  createdAt: string;
  githubUrl: string;
}

export default function ChapterPage() {
  const params = useParams();
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
      } catch {
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
                  <h1 className="text-4xl font-bold text-gray-900 mt-16 mb-8 leading-tight border-b-2 border-amber-200 pb-4">
                    <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {children}
                    </span>
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-3xl font-semibold text-gray-800 mt-12 mb-6 leading-tight relative">
                    <span className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></span>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-2xl font-medium text-gray-800 mt-10 mb-5 leading-tight flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-xl font-medium text-gray-700 mt-8 mb-4 leading-tight">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 leading-loose mb-6 text-lg tracking-wide">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="text-gray-700 leading-loose mb-8 text-lg space-y-3 pl-8">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="text-gray-700 leading-loose mb-8 text-lg space-y-3 pl-8 list-decimal">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700 relative">
                    <span className="absolute -left-6 top-3 w-2 h-2 bg-amber-400 rounded-full"></span>
                    {children}
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gradient-to-b from-amber-400 to-amber-600 bg-gradient-to-r from-amber-50 to-orange-50 pl-8 py-6 mb-8 italic text-gray-800 rounded-r-lg shadow-sm">
                    <div className="flex items-start">
                      <span className="text-amber-500 text-4xl mr-4 leading-none">&ldquo;</span>
                      <div className="flex-1">{children}</div>
                    </div>
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isInline = !className || !className.includes('language-');
                  return isInline ? (
                    <code className="bg-amber-100 text-amber-900 px-3 py-1 rounded-md text-base font-mono font-medium border border-amber-200">
                      {children}
                    </code>
                  ) : (
                    <div className="mb-8">
                      <pre className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-6 rounded-xl text-sm font-mono overflow-x-auto shadow-lg border border-gray-700">
                        <code className="block">{children}</code>
                      </pre>
                    </div>
                  );
                },
                pre: ({ children }) => (
                  <div className="mb-8">
                    <pre className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-6 rounded-xl text-sm font-mono overflow-x-auto shadow-lg border border-gray-700">
                      {children}
                    </pre>
                  </div>
                ),
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    className="text-amber-600 hover:text-amber-800 transition-all duration-200 underline decoration-amber-300 decoration-2 underline-offset-2 hover:decoration-amber-500 font-medium"
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="mb-8 overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 border-b border-gray-200">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">
                    {children}
                  </td>
                ),
                hr: () => (
                  <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-gray-900 bg-amber-100 px-1 py-0.5 rounded">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-amber-700 font-medium">
                    {children}
                  </em>
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
