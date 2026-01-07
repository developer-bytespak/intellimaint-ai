import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    let token: string | undefined;
    
    // CROSS-DOMAIN FIX: Try Authorization header first (from localStorage on client)
    // This works in production where cookies are cross-domain and can't be read
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('[ws-auth] Token from Authorization header');
    }
    
    // Fallback: Try cookies (works locally when frontend and backend are on same domain)
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get('local_accessToken')?.value || 
              cookieStore.get('google_accessToken')?.value;
      if (token) {
        console.log('[ws-auth] Token from cookies');
      }
    }
    
    if (!token) {
      console.log('[ws-auth] No token found in header or cookies');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify JWT and extract userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Generate a short-lived WebSocket ticket (expires in 1 min)
    const wsTicket = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET!,
      { expiresIn: '1m' }
    );
    
    console.log('[ws-auth] Successfully generated wsTicket for user:', decoded.userId);
    
    return NextResponse.json({ 
      wsTicket,
      userId: decoded.userId 
    });
    
  } catch (error) {
    console.error('[ws-auth] Auth error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}