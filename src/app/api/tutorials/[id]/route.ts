import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tutorial from '@/models/Tutorial';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('API: Starting individual tutorial fetch...');
    await dbConnect();
    
    const { id } = await params;
    console.log(`API: Fetching tutorial with ID: ${id}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid tutorial ID' },
        { status: 400 }
      );
    }

    const tutorial = await Tutorial.findById(id)
      .lean()
      .maxTimeMS(10000);
    
    if (!tutorial) {
      return NextResponse.json(
        { error: 'Tutorial not found' },
        { status: 404 }
      );
    }

    console.log(`API: Found tutorial: ${tutorial.title}`);
    return NextResponse.json({ tutorial });
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    
    // Handle timeout/connection errors gracefully
    if (error instanceof Error && (
      error.message.includes('timeout') || 
      error.message.includes('ENOTFOUND') ||
      error.message.includes('MongoServerError')
    )) {
      return NextResponse.json(
        { error: 'Database connection timeout. Please try again.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch tutorial', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}