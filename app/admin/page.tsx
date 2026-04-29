"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../src/lib/supabaseClient';
import { Montserrat } from 'next/font/google';
import Link from 'next/link';

const sans = Montserrat({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Set your password here
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '3639') setIsAuthorized(true);
    else alert('Wrong password');
  };

  useEffect(() => {
    if (isAuthorized) fetchRSVPs();
  }, [isAuthorized]);

  async function fetchRSVPs() {
    setLoading(true);
    const { data } = await supabase
      .from('rsvps')
      .select('*')
      .order('guest_name', { ascending: true });
    if (data) setGuests(data);
    setLoading(false);
  }

  // Manual Override Logic
  async function toggleStatus(guestId: string, currentStatus: any, field: string) {
    const newStatus = !currentStatus;
    
    // Logic: If we are updating 'is_attending', we should also ensure 'invite_sent' is true
    const payload: any = { [field]: newStatus };
    if (field === 'is_attending' && newStatus !== null) {
      payload.invite_sent = true;
    }

    const { error } = await supabase
      .from('rsvps')
      .update(payload)
      .eq('id', guestId);

    if (!error) {
      // Update local state for both fields if necessary
      setGuests(guests.map(g => {
        if (g.id === guestId) {
          const updatedGuest = { ...g, [field]: newStatus };
          if (field === 'is_attending' && newStatus !== null) {
            updatedGuest.invite_sent = true;
          }
          return updatedGuest;
        }
        return g;
      }));
    } else {
      alert("Update failed: " + error.message);
    }
  }

  async function triggerBroadcast() {
    const pendingCount = guests.filter(g => !g.invite_sent).length;
    if (pendingCount === 0) return alert("No pending invites to send!");
    
    if (!confirm(`Send invites to ${pendingCount} guests?`)) return;
    
    setSending(true);
    try {
      const res = await fetch('/api/broadcast');
      const data = await res.json();
      alert(`Blast complete! Processed ${data.summary?.length || 0} emails.`);
      fetchRSVPs();
    } catch (err) {
      alert("Broadcast failed. Check Vercel logs.");
    }
    setSending(false);
  }

  if (!isAuthorized) {
    return (
      <div className={`min-h-screen bg-[#111] flex items-center justify-center p-6 ${sans.className}`}>
        <form onSubmit={handleAuth} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 w-full max-w-sm backdrop-blur-xl">
          <h1 className="text-white font-black uppercase tracking-widest mb-6 text-center">Admin Access</h1>
          <input 
            type="password" 
            placeholder="Enter Password"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white mb-4 outline-none focus:border-[#d0006f] transition-all"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-[#d0006f] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-transform">Login</button>
          <Link href="/" className="block text-center mt-6 text-white/20 text-[10px] uppercase tracking-widest hover:text-white transition-colors">Back to Site</Link>
        </form>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#111] text-white p-4 md:p-12 ${sans.className}`}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Command Center</h1>
            <p className="text-[#d0006f] uppercase tracking-[0.3em] text-[10px] font-bold mt-2">Wedding of Destiny & Stace</p>
          </div>
          <button 
            onClick={triggerBroadcast}
            disabled={sending || loading}
            className="bg-[#d0006f] hover:bg-[#e6007a] px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-30 shadow-[0_0_20px_rgba(208,0,111,0.3)]"
          >
            {sending ? 'Processing...' : '🚀 Trigger Email Blast'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <StatCard title="Total Guests" value={guests.length} />
          <StatCard title="Confirmed" value={guests.filter(g => g.is_attending === true).length} />
          <StatCard title="Pending Invites" value={guests.filter(g => !g.invite_sent).length} color="#d0006f" />
        </div>

        {/* Guest Table */}
        <div className="bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase tracking-widest font-black text-white/40">
                  <th className="p-6">Guest Info</th>
                  <th className="p-6">RSVP Status</th>
                  <th className="p-6">Invite</th>
                  <th className="p-6">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {guests.map(guest => (
                  <tr key={guest.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="p-6">
                      <div className="font-black uppercase text-sm">{guest.guest_name}</div>
                      <div className="text-[10px] text-white/30 lowercase">{guest.email}</div>
                    </td>
                    <td className="p-6">
                      <button 
                        onClick={() => toggleStatus(guest.id, guest.is_attending, 'is_attending')}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                          guest.is_attending === true ? 'bg-green-500/10 text-green-500 border-green-500/30' : 
                          guest.is_attending === false ? 'bg-red-500/10 text-red-500 border-red-500/30' : 
                          'bg-white/5 text-white/40 border-white/10'
                        }`}
                      >
                        {guest.is_attending === true ? 'Attending' : guest.is_attending === false ? 'Declined' : 'Pending'}
                      </button>
                    </td>
                    <td className="p-6">
                      <button 
                        onClick={() => toggleStatus(guest.id, guest.invite_sent, 'invite_sent')}
                        className={`text-[10px] font-black uppercase tracking-widest transition-colors ${guest.invite_sent ? 'text-[#d0006f]' : 'text-white/20 hover:text-white'}`}
                      >
                        {guest.invite_sent ? 'Sent ✓' : 'Mark Sent'}
                      </button>
                    </td>
                    <td className="p-6">
                      <div className="text-[10px] text-white/40 leading-relaxed max-w-[200px]">
                        {guest.dietary_notes || guest.song_request ? (
                          <>
                            {guest.dietary_notes && <p>🍴 {guest.dietary_notes}</p>}
                            {guest.song_request && <p className="mt-1">🎵 {guest.song_request}</p>}
                          </>
                        ) : '—'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Link href="/" className="inline-block mt-12 text-white/20 text-[10px] uppercase tracking-[0.3em] font-black hover:text-[#d0006f] transition-all">
          ← Logout & Back to Home
        </Link>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string, value: number, color?: string }) {
  return (
    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-2">{title}</p>
      <p className={`text-4xl font-black ${color ? `text-[${color}]` : 'text-white'}`} style={color ? {color} : {}}>{value}</p>
    </div>
  );
}