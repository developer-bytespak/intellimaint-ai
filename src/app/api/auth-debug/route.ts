import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get all headers
    const authHeader = request.headers.get('authorization');
    const contentType = request.headers.get('content-type');
    
    // Get all cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      headers: {
        authorizationPresent: !!authHeader,
        authorizationLength: authHeader?.length || 0,
        isBearerToken: authHeader?.startsWith('Bearer ') || false,
        authHeaderFirstChars: authHeader?.substring(0, 30) || 'none',
        contentType,
      },
      cookies: {
        present: allCookies.length > 0,
        count: allCookies.length,
        names: allCookies.map(c => c.name),
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextPublicNestUrl: process.env.NEXT_PUBLIC_NEST_URL || 'not set',
        apiBase: process.env.NEXT_PUBLIC_NEST_URL || 'http://localhost:3000/api/v1',
      },
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('[auth-debug] Error:', error);
    return NextResponse.json(
      { error: 'Failed to collect debug info', details: String(error) },
      { status: 500 }
    );
  }
}
