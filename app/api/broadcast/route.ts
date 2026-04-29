import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use the Service Role Key here to bypass RLS for this admin task
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function GET() {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: guest.id,
          guestName: guest.guest_name,
          guestEmail: guest.guest_email,
          // We leave 'attending' out so it triggers the "Initial Invite" logic
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