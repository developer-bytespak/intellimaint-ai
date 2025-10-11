'use client';

import { redirect } from 'next/navigation';

export default function BlogsPage() {
  // Redirect to app-info page since blogs are accessed from there
  redirect('/app-info');
}
