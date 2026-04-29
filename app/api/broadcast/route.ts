import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get keys without the "!" to prevent immediate crashing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only initialize if both keys are present
const supabase = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

export async function GET() {
  // If supabase is null, it means the Env Vars aren't set up in Vercel yet
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase keys are missing in environment variables." }, 
      { status: 500 }
    );
  }

  try {
    // 1. Get everyone who hasn't been invited yet
    const { data: guests, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('invite_sent', false);

    if (error) throw error;
    if (!guests || guests.length === 0) return NextResponse.json({ message: "No pending invites." });

    const results = [];

    for (const guest of guests) {
      // 2. Call your existing smart route
      // Using your hardcoded domain for maximum reliability during the blast
      const res = await fetch(`https://destinyandstace.com/api/send-rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: guest.id,
          guestName: guest.guest_name,
          guestEmail: guest.email,
        }),
      });

      if (res.ok) {
        // 3. Mark as sent in Supabase
        await supabase.from('rsvps').update({ invite_sent: true }).eq('id', guest.id);
        results.push({ name: guest.guest_name, status: 'success' });
      } else {
        results.push({ name: guest.guest_name, status: 'failed' });
      }
    }

    return NextResponse.json({ summary: results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}