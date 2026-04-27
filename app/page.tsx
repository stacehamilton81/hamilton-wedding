'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabaseClient';
import imageCompression from 'browser-image-compression';

const eventDetails = {
  name: "The Hamilton Wedding",
  profileImageUrl: "img/happy_couple.png",
};

const getDeviceId = () => {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('wedding_device_id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('wedding_device_id', id);
  }
  return id;
};

// Define the structure for our images to handle both sizes
interface PhotoSet {
  thumb: string;
  full: string;
}

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<PhotoSet[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);


  const handleDownload = async (url: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    // Name the file something nice for the guests
    link.download = `Hamilton-Wedding-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
  }
};

  const fetchImages = async () => {
    try {
      // We list the 'thumbs' folder for the gallery grid to keep it fast
      const { data, error } = await supabase.storage
        .from('WEDDING-PHOTOS')
        .list('thumbs', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      if (data) {
        const photoSets = data.map((file) => {
          const { data: thumbData } = supabase.storage.from('WEDDING-PHOTOS').getPublicUrl(`thumbs/${file.name}`);
          const { data: fullData } = supabase.storage.from('WEDDING-PHOTOS').getPublicUrl(`originals/${file.name}`);
          
          return {
            thumb: `${thumbData.publicUrl}?t=${Date.now()}`,
            full: `${fullData.publicUrl}?t=${Date.now()}`
          };
        });
        setImages(photoSets);
      }
    } catch (err) {
      console.error("Error fetching images:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const deviceId = getDeviceId();
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // 1. Upload ORIGINAL (The big 10MB version for your archives)
        const { error: fullError } = await supabase.storage
          .from('WEDDING-PHOTOS')
          .upload(`originals/${fileName}`, file, {
            metadata: { owner: deviceId }
          });
        if (fullError) throw fullError;

        // 2. Create and Upload THUMBNAIL (The ~100KB version for the app speed)
        const options = {
          maxSizeMB: 0.1, 
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };
        const compressedBlob = await imageCompression(file, options);
        
        const { error: thumbError } = await supabase.storage
          .from('WEDDING-PHOTOS')
          .upload(`thumbs/${fileName}`, compressedBlob, {
            metadata: { owner: deviceId }
          });
        if (thumbError) throw thumbError;
      }
      
      setTimeout(async () => {
        await fetchImages();
        setIsUploading(false);
      }, 800);

    } catch (error: any) {
      console.error('Upload error:', error);
      alert("Upload failed: " + error.message);
      setIsUploading(false);
    } finally {
      e.target.value = '';
    }
  };

  const handleDelete = async (fullUrl: string) => {
    const fileName = fullUrl.split('/').pop()?.split('?')[0];
    if (!fileName) return;

    const adminPass = "Hamilton2026"; 
    const userInput = prompt("To delete, enter the Admin Password. (If this is your photo, try leaving it blank)");

    if (userInput === adminPass || userInput === "") {
      // Delete from both folders to stay clean
      const { error } = await supabase.storage
        .from('WEDDING-PHOTOS')
        .remove([`originals/${fileName}`, `thumbs/${fileName}`]);

      if (error) {
        alert("Delete failed. You might not have permission.");
      } else {
        setSelectedImageIndex(null);
        fetchImages();
      }
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat transition-all duration-1000 relative font-sans"
      style={{ 
        backgroundImage: images[0] ? `url(${images[0].thumb})` : 'none',
        backgroundColor: '#111' 
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>

      <div className="relative z-10 flex flex-col min-h-screen text-white">
        
        <header className="p-4 flex items-center justify-end">
          <div className="flex flex-col gap-1 w-6 opacity-70">
            <span className="h-0.5 w-full bg-white"></span>
            <span className="h-0.5 w-full bg-white"></span>
            <span className="h-0.5 w-full bg-white"></span>
          </div>
        </header>

        <div className="flex flex-col items-center p-8 text-center">
          <img
            src={eventDetails.profileImageUrl}
            alt="Profile"
            className="w-48 h-48 rounded-full border-4 border-white/70 shadow-2xl mb-6 object-cover"
          />
          <h1 className="text-[34px] font-extrabold tracking-tight leading-[1.1] text-center drop-shadow-2xl mb-10 text-white">
            The Hamilton<br />Wedding
          </h1>
        </div>

        <div className="px-6 pb-12 flex justify-center">
          <label className={`relative flex items-center justify-center gap-3 rounded-[14px] py-[18px] px-10 shadow-2xl transition-all cursor-pointer w-full max-w-[320px]
            ${isUploading 
              ? 'bg-[#b0005e] opacity-80' 
              : 'bg-[#d0006f] hover:bg-[#b0005e] active:scale-[0.96] shadow-pink-900/40' 
            }`}>
            
            <input type="file" accept="image/*" multiple className="hidden" disabled={isUploading} onChange={handleFileUpload} />

            {isUploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              /* WHITE MINIMAL CAMERA ICON */
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
                <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
              </svg>
            )}
            
            <span className="text-[20px] font-bold tracking-tight whitespace-nowrap uppercase">
              {isUploading ? 'Uploading...' : 'Upload Photos'}
            </span>
          </label>
        </div>

        <div className="w-full mt-auto bg-black/40 backdrop-blur-md rounded-t-[2.5rem] p-3 pt-6 border-t border-white/10">
          <div className="flex flex-col items-center text-center text-white/90 text-sm mb-6 font-medium">
            <span className="drop-shadow">{images.length} items in gallery</span>
          </div>

          <div className="grid grid-cols-3 gap-1 px-1 pb-10">
            {isUploading && (
              <div className="aspect-square bg-white/5 flex items-center justify-center border border-white/10 animate-pulse rounded-sm">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#d0006f]"></div>
              </div>
            )}

            {images.map((imgSet, index) => (
              <div 
                key={index} 
                className="aspect-square bg-white/5 overflow-hidden cursor-pointer active:opacity-80 transition-opacity"
                onClick={() => setSelectedImageIndex(index)}
              >
                <img src={imgSet.thumb} className="object-cover w-full h-full" alt="Gallery thumbnail" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FULL-SCREEN IMAGE VIEWER */}
{selectedImageIndex !== null && (
  <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
    {/* CLOSE BUTTON */}
    <button 
      className="absolute top-12 right-6 text-white text-4xl p-2 z-[110]"
      onClick={() => setSelectedImageIndex(null)}
    >
      &times;
    </button>
    
    {/* FULL-RES IMAGE */}
    <img 
      src={images[selectedImageIndex].full} 
      className="max-w-full max-h-[70vh] object-contain shadow-2xl" 
      alt="Full size view" 
    />

{/* CONTROLS ROW - Ergonomic & Feature Rich */}
<div className="absolute bottom-10 flex items-center justify-between w-full max-w-[550px] px-4">
  
  {/* SAFE ZONE (LEFT) */}
  <button 
    onClick={() => handleDelete(images[selectedImageIndex].full)}
    className="bg-black border-2 border-[#d0006f] text-white rounded-[14px] px-5 py-3.5 font-bold text-[10px] tracking-widest uppercase active:scale-[0.96] transition-all shadow-lg"
  >
    Delete
  </button>

  {/* ACTION ZONE (RIGHT) */}
  <div className="flex gap-2">
    <button 
      className="bg-[#d0006f] active:scale-[0.96] text-white rounded-[14px] px-5 py-3.5 font-bold text-xs shadow-lg transition-all"
      onClick={() => setSelectedImageIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1))}
    >
      PREV
    </button>
    <button 
      className="bg-[#d0006f] active:scale-[0.96] text-white rounded-[14px] px-5 py-3.5 font-bold text-xs shadow-lg transition-all"
      onClick={() => setSelectedImageIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0))}
    >
      NEXT
    </button>
    
    {/* NEW DOWNLOAD BUTTON */}
    <button 
      onClick={() => handleDownload(images[selectedImageIndex].full)}
      className="bg-[#d0006f] active:scale-[0.96] text-white rounded-[14px] px-4 py-3.5 shadow-lg transition-all flex items-center justify-center"
      title="Download Original"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 12l4.5 4.5m0 0 4.5-4.5M12 3v13.5" />
      </svg>
    </button>
  </div>



</div></div>
)}
    </div>
  );
}