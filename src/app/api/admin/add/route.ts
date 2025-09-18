import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tutorial from '@/models/Tutorial';
import { fetchGitHubMarkdown, fetchGitHubTutorial, estimateReadTime } from '@/lib/github';

export async function POST(request: NextRequest) {
  try {
    const { githubUrl } = await request.json();
    
    if (!githubUrl) {
      return NextResponse.json(
        { error: 'GitHub URL is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if it's a folder URL (contains /tree/) or file URL (contains /blob/)
    const isFolder = githubUrl.includes('/tree/');
    const isFile = githubUrl.includes('/blob/');

    if (!isFolder && !isFile) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL. Please provide a GitHub file or folder URL.' },
        { status: 400 }
      );
    }

    if (isFolder) {
      // Handle folder URL - create single tutorial with chapters
      const tutorialResult = await fetchGitHubTutorial(githubUrl);
      
      if (tutorialResult.chapters.length === 0) {
        return NextResponse.json(
          { error: 'No markdown files found in the specified folder' },
          { status: 400 }
        );
      }

      // Check if tutorial already exists
      const existingTutorial = await Tutorial.findOne({ 
        title: tutorialResult.title,
        author: tutorialResult.author 
      });
      
      if (existingTutorial) {
        return NextResponse.json(
          { error: `Tutorial "${tutorialResult.title}" already exists` },
          { status: 409 }
        );
      }

      const tutorialData = {
        title: tutorialResult.title,
        description: tutorialResult.description,
        chapters: tutorialResult.chapters,
        githubUrl,
        author: tutorialResult.author,
        readTime: tutorialResult.totalReadTime,
        totalChapters: tutorialResult.chapters.length
      };

      console.log('Creating tutorial with data:', JSON.stringify(tutorialData, null, 2));

      const tutorial = new Tutorial(tutorialData);

      console.log('Tutorial validation before save:', tutorial.validateSync());
      
      await tutorial.save();

      return NextResponse.json({ 
        message: `Tutorial "${tutorialResult.title}" created successfully with ${tutorialResult.chapters.length} chapters`,
        tutorial: {
          id: tutorial._id,
          title: tutorial.title,
          description: tutorial.description,
          totalChapters: tutorialResult.chapters.length,
          totalReadTime: tutorialResult.totalReadTime
        },
        chapters: tutorialResult.chapters.map(ch => ({ title: ch.title, readTime: ch.readTime })),
        errors: tutorialResult.errors.length > 0 ? tutorialResult.errors : undefined
      });

    } else {
      // Handle single file URL
      const existingTutorial = await Tutorial.findOne({ githubUrl });
      if (existingTutorial) {
        return NextResponse.json(
          { error: 'Tutorial with this GitHub URL already exists' },
          { status: 409 }
        );
      }

      const githubFile = await fetchGitHubMarkdown(githubUrl);
      const readTime = estimateReadTime(githubFile.content);

      const tutorial = new Tutorial({
        title: githubFile.title,
        description: githubFile.description,
        content: githubFile.content,
        githubUrl,
        author: githubFile.author,
        readTime
      });

      await tutorial.save();

      return NextResponse.json({ 
        message: 'Tutorial added successfully',
        tutorial: {
          id: tutorial._id,
          title: tutorial.title,
          description: tutorial.description
        }
      });
    }

  } catch (error) {
    console.error('Error adding tutorial:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add tutorial' },
      { status: 500 }
    );
  }
}