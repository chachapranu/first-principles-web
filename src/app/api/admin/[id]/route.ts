import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tutorial from '@/models/Tutorial';
import mongoose from 'mongoose';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid tutorial ID' },
        { status: 400 }
      );
    }

    const deletedTutorial = await Tutorial.findByIdAndDelete(id);
    
    if (!deletedTutorial) {
      return NextResponse.json(
        { error: 'Tutorial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Tutorial deleted successfully',
      deletedTutorial: {
        id: deletedTutorial._id,
        title: deletedTutorial.title
      }
    });
  } catch (error) {
    console.error('Error deleting tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to delete tutorial' },
      { status: 500 }
    );
  }
}