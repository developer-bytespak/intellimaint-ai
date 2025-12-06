import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_NEST_URL || 'http://localhost:3000/api/v1';

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

    // Get user ID from backend using cookies
    const cookieStore = await cookies();
    // Convert cookies to header string
    const cookieHeader = cookieStore.getAll()
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');
    
    const userResponse = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const userData = await userResponse.json();
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
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
      token: blobToken,
    });

    // Save document metadata to backend
    const documentResponse = await fetch(`${API_BASE_URL}/repository/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
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

      const errorData = await documentResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Failed to save document metadata' },
        { status: documentResponse.status }
      );
    }

    const documentData = await documentResponse.json();
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

