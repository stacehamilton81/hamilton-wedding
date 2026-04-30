"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Montserrat } from 'next/font/google';
import { supabase } from '../../src/lib/supabaseClient';
import Link from 'next/link';

const sans = Montserrat({ 
  subsets: ['latin'],
  weight: ['400', '700', '900'] 
});

interface Guest {
  id: string;
  guest_name: string;
  email: string; // Corrected to match your Supabase column
  is_attending: boolean | null;
  dietary_notes: string | null;
  song_request: string | null;
}

function RsvpContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    if (id) fetchGuest(id);
    else setLoading(false);
  }, [id]);

  async function fetchGuest(uuid: string) {
    const { data } = await supabase.from('rsvps').select('*').eq('id', uuid).single();
    if (data) setGuest(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!guest || !id) return;

    const formData = new FormData(e.currentTarget);
    const attendingValue = formData.get('attending') === 'true';
    
    // updates keys must match Supabase column names exactly
    const updates = {
      is_attending: attendingValue, 
      dietary_notes: formData.get('dietary') as string,
      song_request: formData.get('song') as string,
      last_updated: new Date().toISOString(),
    };

    setIsSendingEmail(true);

    // 1. Update Supabase
    const { error: dbError } = await supabase.from('rsvps').update(updates).eq('id', id);
    
    if (!dbError) {
      // 2. Trigger the Resend API Route
      try {
        await fetch('/api/send-rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestId: id,
            guestName: guest.guest_name,
            guestEmail: guest.email, // FIXED: Now uses guest.email
            attending: attendingValue
          }),
        });
      } catch (emailError) {
        console.error("Email notification failed to send:", emailError);
      }
      
      setSubmitted(true);
    } else {
      console.error("Supabase Error:", dbError);
      alert("There was an error updating your RSVP. Please try again.");
    }
    
    setIsSendingEmail(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d0006f]"></div>
    </div>
  );

  if (!id || !guest) return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center text-white p-8 text-center">
      <p className={sans.className}>Invitation not found. Please check your link!</p>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#111] relative flex flex-col items-center justify-center p-6 ${sans.className}`}>
      
      <div className="absolute top-8 left-8 z-50">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-white/40 hover:text-[#d0006f] transition-all group font-black uppercase tracking-[0.2em] text-[10px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 transition-transform group-hover:-translate-x-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Home
        </Link>
      </div>

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#d0006f] opacity-20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#d0006f] opacity-10 blur-[120px] rounded-full"></div>

      <div className="relative z-10 w-full max-w-[450px]">
        <div className="flex flex-col items-center mb-10 text-center">
          <img
            src="img/happy_couple.png"
            alt="Destiny & Stace"
            className="w-32 h-32 rounded-full border-4 border-[#d0006f] shadow-2xl mb-6 object-cover"
          />
          <h1 className="text-white text-[32px] font-black tracking-tight leading-tight uppercase">
            RSVP<br />
            <span className="font-light opacity-80 text-[24px]">for the Hamiltons</span>
          </h1>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
          {submitted ? (
            <div className="text-center py-10">
              <div className="text-[#d0006f] text-5xl mb-4">♥</div>
              <h2 className="text-white text-2xl font-bold mb-2">Thanks, {guest.guest_name}!</h2>
              <p className="text-white/60">We've updated your response and sent a confirmation email to {guest.email}.</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="mt-8 bg-[#d0006f] text-white rounded-2xl py-4 px-8 font-black uppercase tracking-widest text-xs hover:bg-[#e6007a] transition-all"
              >
                Event Details
              </button>
            </div>
          ) : (
            <>
              <p className="text-white/60 text-sm mb-8 text-center">
                Hello <span className="text-white font-bold">{guest.guest_name}</span>,<br /> 
                please let us know if you can make it! <br /><br />
                <strong>Campio Ritchie • September 5th • 5pm-10pm</strong>
              </p>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <label className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-black mb-2 block">Attendance</label>
                  <select 
                    name="attending" 
                    required 
                    defaultValue={guest.is_attending?.toString() || "true"}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#d0006f] transition-all appearance-none"
                  >
                    <option value="true" className="bg-[#111]">Yes, I'll be there!</option>
                    <option value="false" className="bg-[#111]">Regretfully Decline</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-black mb-2 block">Children</label>
                  <textarea 
                    name="dietary" 
                    defaultValue={guest.dietary_notes || ""}
                    placeholder="Indicate the name(s) of the children attending..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#d0006f] transition-all min-h-[100px] placeholder:text-white/20"
                  />
                </div>

               
                <button 
                  type="submit" 
                  disabled={isSendingEmail}
                  className={`bg-[#d0006f] hover:bg-[#e6007a] text-white rounded-2xl py-5 shadow-xl transition-all active:scale-95 font-black uppercase tracking-widest text-sm mt-4 ${isSendingEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSendingEmail ? 'Processing...' : 'Confirm RSVP'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RsvpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#111]" />}>
      <RsvpContent />
    </Suspense>
  );
}