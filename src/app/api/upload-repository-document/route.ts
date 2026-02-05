import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE } from '@/lib/api/axios';

const API_BASE_URL = API_BASE;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate that it's a PDF
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for PDFs)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // CROSS-DOMAIN FIX: Get token from Authorization header (works in production)
    // This works when frontend and backend are on different domains
    const authHeader = request.headers.get('authorization');
    let authHeaders: HeadersInit = {};
    
    console.log('[upload-repository] 📋 Auth debug info:', {
      authHeaderPresent: !!authHeader,
      authHeaderLength: authHeader?.length || 0,
      isBearerToken: authHeader?.startsWith('Bearer ') || false,
    });
    
    if (authHeader?.startsWith('Bearer ')) {
      // Use Authorization header from client
      authHeaders = {
        'Authorization': authHeader,
      };
      console.log('[upload-repository] ✅ Using Authorization header from client (Bearer token detected)');
    } else if (authHeader) {
      console.log('[upload-repository] ⚠️  Authorization header present but not Bearer token:', authHeader.substring(0, 50));
      return NextResponse.json(
        { error: 'Invalid Authorization header format. Expected Bearer token.' },
        { status: 401 }
      );
    } else {
      // Fallback: Try cookies (for local development)
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ');
      if (cookieHeader) {
        authHeaders = {
          'Cookie': cookieHeader,
        };
        console.log('[upload-repository] Using cookies from client (Bearer token not found)');
      }
    }
    
    if (!Object.keys(authHeaders).length) {
      console.log('[upload-repository] ❌ No auth headers found - no Authorization header or cookies');
      return NextResponse.json(
        { 
          error: 'Unauthorized. No authentication provided. Please ensure you are logged in.',
          details: 'Missing Authorization header and cookies',
          troubleshooting: 'Check browser DevTools > Application > LocalStorage for "accessToken". If missing, please log in again. If present, check that it starts with "eyJ".',
          debugEndpoint: '/api/auth-debug'
        },
        { status: 401 }
      );
    }
    
    const userResponse = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: authHeaders,
    });
    
    console.log('[upload-repository] 🔐 Backend profile check response:', {
      status: userResponse.status,
      statusText: userResponse.statusText,
      authHeaderUsed: Object.keys(authHeaders)[0],
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('[upload-repository] ❌ Profile verification failed:', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        errorResponse: errorText.substring(0, 200),
      });
      
      // Provide specific error messages based on status
      let errorMessage = 'Profile verification failed. Please log in again.';
      let troubleshootingSteps = '';
      
      if (userResponse.status === 401) {
        errorMessage = 'Your session has expired or is invalid.';
        troubleshootingSteps = '1. Check if accessToken in localStorage is valid\n2. Try logging out and logging in again\n3. If issue persists, clear browser cache and cookies';
      } else if (userResponse.status === 403) {
        errorMessage = 'Access denied. Your account may not have permission to upload.';
      } else if (userResponse.status === 500) {
        errorMessage = 'Backend server error. Please try again in a moment.';
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: 'Unable to verify your identity with backend',
          backendStatus: userResponse.status,
          debugEndpoint: '/api/auth-debug',
          troubleshooting: troubleshootingSteps
        },
        { status: 401 }
      );
    }

    let userData;
    try {
      const contentType = userResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        userData = await userResponse.json();
      } else {
        console.error('User profile response is not JSON:', await userResponse.text());
        return NextResponse.json(
          { error: 'Invalid response from authentication service' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Error parsing user profile response:', error);
      return NextResponse.json(
        { error: 'Failed to parse authentication response' },
        { status: 500 }
      );
    }
    const userId = userData?.data?.id || userData?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unable to identify user' },
        { status: 401 }
      );
    }


    // Get blob token
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      return NextResponse.json(
        { error: 'Blob storage token not configured' },
        { status: 500 }
      );
    }

    console.log('blobToken', blobToken);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'pdf';
    const filename = `repositories/${userId}/${timestamp}-${randomString}.${fileExtension}`;

    // Upload to Vercel Blob (dynamic import)
    const { put } = await import('@vercel/blob');
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
      token: blobToken,
    });

    console.log('blob', blob);

    // Save document metadata to backend
    const documentResponse = await fetch(`${API_BASE_URL}/repository/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        documents: [{
          fileId: `${timestamp}-${randomString}`, // Generate a simple fileId
          fileName: file.name,
          fileUrl: blob.url,
          fileSize: file.size,
          blobPath: filename,
        }],
      }),
    });

    if (!documentResponse.ok) {
      // If saving to DB fails, try to delete from blob (best effort)
      try {
        const { del } = await import('@vercel/blob');
        await del(blob.url, { token: blobToken });
      } catch (deleteError) {
        console.error('Failed to delete blob after DB save failure:', deleteError);
      }

      let errorData: { message?: string; error?: string } = {};
      try {
        const contentType = documentResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await documentResponse.json();
        } else {
          const text = await documentResponse.text();
          console.error('Document save response is not JSON:', text);
        }
      } catch (error) {
        console.error('Error parsing document save error response:', error);
      }
      return NextResponse.json(
        { error: errorData.message || errorData.error || 'Failed to save document metadata' },
        { status: documentResponse.status }
      );
    }

    let documentData;
    try {
      const contentType = documentResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        documentData = await documentResponse.json();
      } else {
        const text = await documentResponse.text();
        console.error('Document save response is not JSON:', text);
        return NextResponse.json(
          { error: 'Invalid response from document service' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Error parsing document save response:', error);
      return NextResponse.json(
        { error: 'Failed to parse document save response' },
        { status: 500 }
      );
    }
    const document = documentData?.data?.documents?.[0] || documentData?.documents?.[0];

    return NextResponse.json({
      document: document || {
        id: `${timestamp}-${randomString}`,
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        status: 'ready',
      },
    });
  } catch (error) {
    console.error('Error uploading repository document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

