"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET_NAME = 'your_bucket_name'; // Replace with your actual bucket name

export default function Slideshow() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Helper to turn a file path into a Public URL
  const getUrl = (path: string) => 
    supabase.storage.from(BUCKET_NAME).getPublicUrl(path).data.publicUrl;

  useEffect(() => {
    // 1. Initial Load from the new Table
    const loadInitial = async () => {
      const { data } = await supabase
        .from('wedding_photos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setPhotos(data);
    };

    loadInitial();

    // 2. Realtime Listener
    const channel = supabase
      .channel('wedding_stream')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'wedding_photos' }, 
        (payload) => {
          console.log('New photo detected!', payload.new);
          setPhotos(prev => [payload.new, ...prev]);
          setCurrentIndex(0); // Jump to the new photo immediately
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 3. Auto-cycle every 6 seconds
  useEffect(() => {
    if (photos.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [photos]);

  if (photos.length === 0) return <div className="h-screen bg-black" />;

  const currentPhoto = photos[currentIndex];

  return (
    <main className="h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Blurred Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-110 transition-all duration-1000"
        style={{ backgroundImage: `url(${getUrl(currentPhoto.file_path)})` }}
      />
      
      {/* Sharp Main Image */}
      <img
        key={currentPhoto.id}
        src={getUrl(currentPhoto.file_path)}
        className="relative z-10 max-w-full max-h-full object-contain shadow-2xl transition-all duration-1000 animate-in fade-in zoom-in"
      />

      {/* Bottom Text */}
      <div className="absolute bottom-10 left-10 z-20">
        <p className="text-white font-black uppercase tracking-[0.3em] text-2xl">Destiny + Stace</p>
        <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2">September 5, 2026</p>
      </div>
    </main>
  );
}