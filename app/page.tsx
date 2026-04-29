"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Montserrat } from 'next/font/google';

const sans = Montserrat({ 
  subsets: ['latin'],
  weight: ['400', '700', '900'] 
});

export default function Home() {
  const [days, setDays] = useState("00");
  const [hrs, setHrs] = useState("00");
  const [min, setMin] = useState("00");
  const [sec, setSec] = useState("00");
  const [openSection, setOpenSection] = useState("");

  useEffect(() => {
    // Standard ISO string
    const target = new Date("2026-09-05T17:00:00").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff > 0) {
        setDays(Math.floor(diff / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'));
        setHrs(Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'));
        setMin(Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0'));
        setSec(Math.floor((diff / 1000) % 60).toString().padStart(2, '0'));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className={`min-h-screen bg-[#111] text-white relative flex flex-col items-center p-6 py-20 ${sans.className}`}>
      
      {/* Background Decor - pointer-events-none is crucial */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#d0006f] opacity-20 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#d0006f] opacity-10 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-[450px] flex flex-col items-center text-center">
        <img src="img/happy_couple.png" alt="Couple" className="w-40 h-40 rounded-full border-8 border-[#d0006f] mb-8 object-cover" />

        <h1 className="text-[40px] font-black uppercase tracking-tighter leading-none mb-2">Destiny + Stace</h1>
        <p className="text-white/80 text-sm tracking-[0.3em] uppercase mb-10 font-light">Sept 5, 2026 • 5pm-10pm
        <br></br>Campio Ritchie</p>

        {/* Timer - If this is 00, JS is not running */}
        <div className="flex gap-4 mb-12">
          {[["Days", days], ["Hrs", hrs], ["Min", min], ["Sec", sec]].map(([label, val]) => (
            <div key={label} className="flex flex-col items-center">
              <div className="bg-white/5 border border-white/10 w-16 h-20 rounded-xl flex items-center justify-center relative backdrop-blur-md">
                <div className="absolute w-full h-[1px] bg-black/40 top-1/2"></div>
                <span className="text-3xl font-black text-[#d0006f]">{val}</span>
              </div>
              <span className="text-[9px] uppercase tracking-widest font-bold mt-2 opacity-50">{label}</span>
            </div>
          ))}
        </div>

       <div className="w-full mb-12 relative z-50">
         
          <p className="text-[11px] uppercase font-black tracking-widest mt-4">RSVP via your personal email link</p>
        </div>


        {/* Info Accordion - Simple Logic */}
        <div className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 mb-8 text-left backdrop-blur-xl relative z-50">
          <div className="border-b border-white/5">
            <button onClick={() => setOpenSection(openSection === 'vibe' ? '' : 'vibe')} className="w-full py-5 flex justify-between items-center text-[12px] font-black uppercase tracking-[0.2em] opacity-90">
              The Vibe <span className="text-[#d0006f] text-lg">{openSection === 'vibe' ? '−' : '+'}</span>
            </button>
            {openSection === 'vibe' && <div className="pb-6 text-xs leading-relaxed opacity-100">Cocktail attire. Industrial-modern energy.</div>}
          </div>

          <div className="border-b border-white/5">
            <button onClick={() => setOpenSection(openSection === 'gift' ? '' : 'gift')} className="w-full py-5 flex justify-between items-center text-[12px] font-black uppercase tracking-[0.2em] opacity-90">
              Gifts <span className="text-[#d0006f] text-lg">{openSection === 'gift' ? '−' : '+'}</span>
            </button>
            {openSection === 'gift' && <div className="pb-6 text-xs leading-relaxed opacity-100">No gifts please! Your presence is our present.</div>}
          </div>
        </div>

  {/* Main Action */}
        <div className="w-full mb-12 relative z-50">
          <Link href="/photos" className="block w-full bg-[#d0006f] py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-transform">
            Photo Wall
          </Link>
        
        </div>


        {/* Simplified Venue Section (No Iframe) */}
        <div className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 text-center backdrop-blur-xl relative z-50">
          <span className="text-[10px] font-black uppercase opacity-40 block mb-4">The Venue</span>
          <h2 className="text-lg font-black uppercase mb-4">Campio Ritchie Brewing Co.</h2>
          <a 
            href="https://www.google.com/maps/place/campio+ritchie/data=!4m2!3m1!1s0x53a023ef693827f7:0xebd98cddfa69a722?sa=X&ved=1t:242&ictx=111" 
            target="_blank" 
            className="inline-block bg-white/10 border border-white/20 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
          >
            Open in Google Maps
          </a>
          <p className="text-[9px] mt-6 opacity-40 font-bold uppercase tracking-widest">9570 76 Ave NW, Edmonton, AB T6C 0K2</p>
        </div>

      </div>
    </main>
  );
}