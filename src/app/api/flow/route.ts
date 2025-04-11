import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
      const body = await request.json();
      const { userAddress, message, sessionId } = body;
  
      if (!userAddress || !message) {
        return NextResponse.json(
          { error: 'Missing required fields: userAddress and message are required' },
          { status: 400 }
        );
      }
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress,
          message,
          sessionId,
        }),
      });
  
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error sending message:', error);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }
  }