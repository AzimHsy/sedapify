import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await createClient();
    
    // 1. Exchange the code for a session (Logs them in)
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // 2. Fetch the User to get their ID
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 3. Check their Profile in the database
        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        // 4. Logic: If profile exists but onboarding is false, force redirect
        if (profile && !profile.onboarding_completed) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }
    }
  }

  // If a specific redirect was requested (and they are onboarded), go there
  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // Default: Go Home
  return NextResponse.redirect(`${origin}/`);
}