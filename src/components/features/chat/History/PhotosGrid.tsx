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
                  onClick={() => onViewPhoto(photo.id)}
                >
                  {/* Machine Image - Using placeholder service with machine images */}
                  <img
                    src={photo.url && (photo.url.startsWith('http') || photo.url.startsWith('/')) ? photo.url : imageUrl}
                    alt={photo.filename || 'Machine photo'}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
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

