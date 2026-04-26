// src/app/page.tsx
'use client'; // This directive is required for Tailwind interaction/state

import { useState } from 'react';

// Mock data for the event structure
const eventDetails = {
  name: "The Robinsons Wedding",
  // A placeholder couple profile image
  profileImageUrl: "https://res.cloudinary.com/demo/image/upload/ar_1:1,c_fill,g_auto,r_max,w_200/couple_profile.jpg",
};

// Mock data for the live gallery (thumbnails)
const galleryPhotos = [
  { id: 1, url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' },
  { id: 2, url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/some_image.jpg' },
  { id: 3, url: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_200,g_face/v1/faces/sleeping_baby.jpg' },
  { id: 4, url: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_200,g_face/v1/faces/old_man.jpg' },
  { id: 5, url: 'https://res.cloudinary.com/demo/image/upload/ar_1:1,c_fill,g_auto/v1312461204/flower.jpg' },
  { id: 6, url: 'https://res.cloudinary.com/demo/image/upload/ar_1:1,c_fill,g_auto/v1312461204/house.jpg' },
];

export default function Home() {
  // We will add state management for the upload later
  // const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* 1. HEADER (Visually matched to image_0.png) */}
      <header className="p-4 border-b border-gray-100 flex items-center justify-between">
        <a href="#" className="text-sm font-medium text-accent-pink hover:opacity-80 flex items-center gap-1">
          <span className="text-xl">←</span> Back to album
        </a>
        {/* Kululu logo or burger menu placeholder (optional, not core guest functionality) */}
        <div className="w-8 h-8 flex flex-col justify-between p-1 cursor-pointer">
            <span className="w-full h-0.5 bg-gray-500 rounded-full"></span>
            <span className="w-full h-0.5 bg-gray-500 rounded-full"></span>
            <span className="w-full h-0.5 bg-gray-500 rounded-full"></span>
        </div>
      </header>

      {/* 2. EVENT PROFILE SECTION */}
      <div className="flex flex-col items-center p-6 pb-2 text-center">
        <img
          src={eventDetails.profileImageUrl}
          alt={eventDetails.name}
          className="w-24 h-24 rounded-full border-4 border-white shadow-xl mb-4 object-cover"
        />
        <h1 className="text-2xl font-semibold text-gray-950 px-4">{eventDetails.name}</h1>
      </div>

      {/* 3. UPLOAD BUTTONS SECTION (Matching the dashed style of image_0.png) */}
      <div className="p-5 space-y-5">
        {/* Pick Photos Upload Box */}
        <label className="block border-[3px] border-dashed border-accent-pink/60 rounded-[2.5rem] p-10 text-center cursor-pointer bg-white transition hover:border-accent-pink/100 hover:bg-gray-50">
      <input 
  type="file" 
  accept="image/*" 
  multiple 
  /* REMOVED: capture="environment" */
  className="sr-only" 
  onChange={(e) => {
    const files = e.target.files;
    if (files) {
      console.log(`${files.length} photos selected`);
    }
  }}
/>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-pink/5 border-2 border-accent-pink/20 mb-4 shadow-inner">
            {/* Visual replacement for the Camera Icon (SVG) */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-accent-pink">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.822 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          </div>
          <span className="block text-2xl font-semibold text-accent-pink">Pick Photos</span>
        </label>

        {/* Pick Videos Upload Box (Visually similar but placeholder) */}
        <label className="block border-[3px] border-dashed border-gray-200 rounded-[2.5rem] p-10 text-center cursor-pointer bg-white transition hover:border-gray-300 hover:bg-gray-50 opacity-60">
          {/* Optional Video Input */}
          {/* <input type="file" accept="video/*" multiple className="sr-only" /> */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 mb-4 border border-gray-100 shadow-inner">
            {/* Visual replacement for Video Camera Icon (SVG) */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <span className="block text-2xl font-semibold text-gray-400">Pick Videos</span>
        </label>

        {/* Text Post Link (Matched style of image_0.png) */}
        <div className="text-center py-2">
            <span className="text-gray-900 text-lg">Or add a </span>
            <a href="#" className="text-accent-pink text-lg font-medium underline underline-offset-4 decoration-accent-pink/30 hover:decoration-accent-pink/80 transition-colors">text post</a>
        </div>
      </div>

      {/* 4. THE LIVE GALLERY GRID (Matching image_1.png) */}
      <div className="p-4 border-t border-gray-100">
        <h2 className="text-lg font-semibold text-gray-950 mb-4 px-2">Live Photo Wall</h2>
        <div className="grid grid-cols-3 gap-1.5 md:gap-2">
          {galleryPhotos.map((photo) => (
            <div key={photo.id} className="aspect-square bg-gray-50 rounded-xl overflow-hidden shadow-inner group">
              <img 
                src={photo.url} 
                alt={`Photo ${photo.id}`} 
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}