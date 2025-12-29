import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('local_accessToken')?.value; // Your cookie name
    console.log('Retrieved token from cookies:', token);
    
    if (!token) {
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
    
    return NextResponse.json({ 
      wsTicket,
      userId: decoded.userId 
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}