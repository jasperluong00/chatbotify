import { NextResponse } from 'next/server';
import { R2RPipeline } from '@/app/lib/chatbot/pipeline';

const pipeline = new R2RPipeline();

// Initialize the pipeline
let isInitialized = false;
pipeline.initialize()
  .then(() => {
    isInitialized = true;
    console.log('Pipeline initialized successfully');
  })
  .catch((error) => {
    console.error('Failed to initialize pipeline:', error);
  });

export async function POST(request: Request) {
  try {
    if (!isInitialized) {
      return NextResponse.json(
        { error: 'System is still initializing. Please try again in a moment.' },
        { status: 503 }
      );
    }

    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const response = await pipeline.processQuery(query);
    return NextResponse.json({ response });
    
  } catch (error: any) {
    console.error('Error processing query:', error);
    
    // More detailed error response
    return NextResponse.json(
      { 
        error: 'Failed to process query',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 