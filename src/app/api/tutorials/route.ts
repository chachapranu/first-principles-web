import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tutorial from '@/models/Tutorial';

export async function GET() {
  try {
    console.log('API: Starting tutorial fetch...');
    await dbConnect();
    console.log('API: Database connected, fetching tutorials...');
    
    const tutorials = await Tutorial.find({})
      .select('title description author category difficulty readTime totalChapters createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .maxTimeMS(10000);

    console.log(`API: Found ${tutorials.length} tutorials`);
    return NextResponse.json({ tutorials });
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    
    // Return empty tutorials array if DB is not available, rather than erroring
    if (error instanceof Error && (
      error.message.includes('timeout') || 
      error.message.includes('ENOTFOUND') ||
      error.message.includes('MongoServerError')
    )) {
      console.log('Database timeout/connection issue, returning empty array');
      return NextResponse.json({ tutorials: [] });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch tutorials', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}