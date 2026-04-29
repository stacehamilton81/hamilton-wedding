"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../src/lib/supabaseClient';
import { Montserrat } from 'next/font/google';

const sans = Montserrat({ subsets: ['latin'], weight: ['400', '900'] });

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Simple password check - Update 'yourpassword' to whatever you want
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'staceanddestiny2026') setIsAuthorized(true);
    else alert('Wrong password');
  };

  useEffect(() => {
    if (isAuthorized) fetchRSVPs();
  }, [isAuthorized]);

  async function fetchRSVPs() {
    setLoading(true);
    const { data } = await supabase.from('rsvps').select('*').order('guest_name', { ascending: true });
    if (data) setGuests(data);
    setLoading(false);
  }

  async function triggerBroadcast() {
    if (!confirm("Are you sure you want to send the blast to all pending guests?")) return;
    setSending(true);
    const res = await fetch('/api/broadcast');
    const data = await res.json();
    alert(`Done! Processed ${data.summary?.length || 0} emails.`);
    setSending(false);
    fetchRSVPs(); // Refresh the list to see the 'Sent' statuses update
  }

  if (!isAuthorized) {
    return (
      <div className={`min-h-screen bg-[#111] flex items-center justify-center p-6 ${sans.className}`}>
        <form onSubmit={handleAuth} className="bg-white/5 p-8 rounded-[2rem] border border-white/10 w-full max-w-sm">
          <h1 className="text-white font-black uppercase tracking-widest mb-4">Admin Access</h1>
          <input 
            type="password" 
            placeholder="Enter Password"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white mb-4 outline-none focus:border-[#d0006f]"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-[#d0006f] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#111] text-white p-8 ${sans.className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase italic">Dashboard</h1>
            <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] mt-2">RSVP Management</p>
          </div>
          <button 
            onClick={triggerBroadcast}
            disabled={sending}
            className="bg-[#d0006f] hover:bg-[#e6007a] px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50"
          >
            {sending ? 'Sending Blast...' : '🚀 Trigger Email Blast'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard title="Total Guests" value={guests.length} />
          <StatCard title="Attending" value={guests.filter(g => g.is_attending === true).length} />
          <StatCard title="Invites Sent" value={guests.filter(g => g.invite_sent === true).length} />
        </div>

        <div className="bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/10 text-[10px] uppercase tracking-widest font-black">
                <th className="p-6">Name</th>
                <th className="p-6">Status</th>
                <th className="p-6">Invite Sent</th>
                <th className="p-6">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {guests.map(guest => (
                <tr key={guest.id} className="text-sm hover:bg-white/[0.02] transition-colors">
                  <td className="p-6 font-bold">{guest.guest_name}</td>
                  <td className="p-6">
                    {guest.is_attending === true ? '✅ Yes' : guest.is_attending === false ? '❌ No' : '⏳ Pending'}
                  </td>
                  <td className="p-6 text-xs">{guest.invite_sent ? 'Sent' : '—'}</td>
                  <td className="p-6 text-white/40 italic text-xs">{guest.dietary_notes || 'No notes'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string, value: number }) {
  return (
    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-2">{title}</p>
      <p className="text-4xl font-black">{value}</p>
    </div>
  );
}