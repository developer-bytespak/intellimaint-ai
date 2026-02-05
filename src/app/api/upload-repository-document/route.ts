import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE } from '@/lib/api/axios';
import axios from 'axios';

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
    
    if (authHeader?.startsWith('Bearer ')) {
      // Use Authorization header from client
      authHeaders = {
        'Authorization': authHeader,
      };
      console.log('[upload-repository] Using Authorization header from client');
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
        console.log('[upload-repository] Using cookies from client');
      }
    }
    
    if (!Object.keys(authHeaders).length) {
      console.log('[upload-repository] No auth headers found');
      return NextResponse.json(
        { error: 'Unauthorized. Please log in' },
        { status: 401 }
      );
    }
    
    try {
      // Verify user by fetching profile
      console.log('[upload-repository] Fetching user profile with auth headers:', authHeaders);
      const userResponse = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: authHeaders,
        withCredentials: true,
      });
      
      console.log('[upload-repository] User profile fetched successfully');
      
      const userData = userResponse.data;
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

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop() || 'pdf';
      const filename = `repositories/${userId}/${timestamp}-${randomString}.${fileExtension}`;

      // Upload to Vercel Blob
      const { put } = await import('@vercel/blob');
      const blob = await put(filename, file, {
        access: 'public',
        contentType: file.type,
        token: blobToken,
      });

      console.log('[upload-repository] File uploaded to blob:', blob.url);

      // Save document metadata to backend
      const documentResponse = await axios.post(
        `${API_BASE_URL}/repository/documents`,
        {
          documents: [{
            fileId: `${timestamp}-${randomString}`,
            fileName: file.name,
            fileUrl: blob.url,
            fileSize: file.size,
            blobPath: filename,
          }],
        },
        {
          headers: authHeaders,
          withCredentials: true,
        }
      );

      const documentData = documentResponse.data;
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

    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error('[upload-repository] Auth failed:', error.response?.statusText);
        return NextResponse.json(
          { error: 'Unauthorized. Please log in again.' },
          { status: 401 }
        );
      }
      if (error.response?.status === 500) {
        console.error('[upload-repository] Backend server error:', error.response?.statusText);
        return NextResponse.json(
          { error: 'Backend server error. Please try again later.' },
          { status: 500 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error uploading repository document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
