'use client';

import { PhotoGroup } from '@/types/chat';

interface PhotosGridProps {
  photoGroups: PhotoGroup[];
  onDeletePhoto: (photoId: string) => void;
  onViewPhoto: (photoId: string) => void;
}

export default function PhotosGrid({
  photoGroups,
  onDeletePhoto,
  onViewPhoto
}: PhotosGridProps) {
  return (
    <div className="pb-8">
      <h2 className="text-gray-400 text-sm font-medium mb-4">Photos</h2>
      <div className="space-y-6">
        {photoGroups.map((group, groupIndex) => {
          const isLastGroup = groupIndex === photoGroups.length - 1;
          return (
          <div key={`${group.month}-${group.year}`} className={isLastGroup ? 'pb-8' : ''}>
            <h3 className="text-gray-400 text-sm font-medium mb-3">{group.month} {group.year}</h3>
            <div className="grid grid-cols-3 gap-2">
              {group.photos.map((photo, index) => {
                // Generate machine image URLs using Picsum Photos - reliable service
                const photoSeed = parseInt(photo.id.replace(/\D/g, '')) || index;
                // Use different image IDs for variety (using seed-based approach)
                // Using Picsum Photos which is reliable and always works
                const imageId = (photoSeed % 1000) + 1;
                const imageUrl = `https://picsum.photos/id/${imageId}/400/400`;
                
                return (
                <div 
                  key={photo.id} 
                  className="aspect-square bg-[#2a3441] rounded-xl overflow-hidden relative group cursor-pointer"
                >
                  {/* Machine Image - Using placeholder service with machine images */}
                  <img
                    src={photo.url && (photo.url.startsWith('http') || photo.url.startsWith('/')) ? photo.url : imageUrl}
                    alt={photo.filename || 'Machine photo'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Try fallback with different image ID
                      const target = e.target as HTMLImageElement;
                      const photoSeed = parseInt(photo.id.replace(/\D/g, '')) || index;
                      const fallbackId = ((photoSeed + 100) % 1000) + 1;
                      // Try a different image ID as fallback
                      if (!target.dataset.fallbackAttempted) {
                        target.dataset.fallbackAttempted = 'true';
                        target.src = `https://picsum.photos/id/${fallbackId}/400/400`;
                      } else {
                        // If Picsum fails, use placeholder with gradient background
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.fallback-bg')) {
                          const fallbackDiv = document.createElement('div');
                          fallbackDiv.className = 'fallback-bg w-full h-full bg-gradient-to-br from-blue-500 to-purple-600';
                          parent.appendChild(fallbackDiv);
                        }
                      }
                    }}
                  />
                  
                  {/* Hover overlay with action buttons */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewPhoto(photo.id);
                      }}
                      className="p-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg transition-colors duration-200"
                      title="View photo"
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePhoto(photo.id);
                      }}
                      className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors duration-200"
                      title="Delete photo"
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

