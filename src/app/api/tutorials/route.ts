import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tutorial from '@/models/Tutorial';

export async function GET() {
  try {
    await dbConnect();
    
    const tutorials = await Tutorial.find({})
      .select('title description author category difficulty readTime totalChapters createdAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({ tutorials });
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutorials' },
      { status: 500 }
    );
  }
}