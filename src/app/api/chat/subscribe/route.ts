import { NextResponse } from 'next/server';

interface SubscribeResponse {
  assistantId: string;
  threadId: string;
  content: string;
  timestamp?: number;
}

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, showIntermediateSteps } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        showIntermediateSteps,
      }),
    });

    // Forward the response headers
    const headers = new Headers(response.headers);

    // Create a new response with the same headers and body
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error('Error in subscribe route:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat/subscribe`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'No chat response available yet',
          timestamp: Date.now()
        },
        { status: 404 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat subscription error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch chat response',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}