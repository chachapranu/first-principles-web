import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Health check: Testing environment variables...');
    
    // Check if environment variables are set
    const hasMongoUri = !!process.env.MONGODB_URI;
    console.log(`Health check: MONGODB_URI is ${hasMongoUri ? 'set' : 'NOT set'}`);
    
    if (!hasMongoUri) {
      return NextResponse.json({
        status: 'error',
        message: 'MongoDB URI not configured',
        env: {
          mongoUri: hasMongoUri,
          nodeEnv: process.env.NODE_ENV
        }
      }, { status: 500 });
    }

    console.log('Health check: Testing database connection...');
    
    // Test database connection
    const startTime = Date.now();
    await dbConnect();
    const connectionTime = Date.now() - startTime;
    
    console.log(`Health check: Database connected in ${connectionTime}ms`);
    
    return NextResponse.json({
      status: 'ok',
      message: 'All systems operational',
      env: {
        mongoUri: hasMongoUri,
        nodeEnv: process.env.NODE_ENV
      },
      timing: {
        connectionTime: `${connectionTime}ms`
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        mongoUri: !!process.env.MONGODB_URI,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}