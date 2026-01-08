/**
 * Auth Callback Handler
 * @description Handles OAuth callback from Google
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createServerComponentClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to home page after login
  return NextResponse.redirect(new URL('/', request.url));
}
