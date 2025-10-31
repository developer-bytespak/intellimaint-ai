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
    <div>
      <h2 className="text-gray-400 text-sm font-medium mb-4">Photos</h2>
      <div className="space-y-6">
        {photoGroups.map((group) => (
          <div key={`${group.month}-${group.year}`}>
            <h3 className="text-gray-400 text-sm font-medium mb-3">{group.month} {group.year}</h3>
            <div className="grid grid-cols-3 gap-2">
              {group.photos.map((photo) => (
                <div 
                  key={photo.id} 
                  className="aspect-square bg-[#2a3441] rounded-xl overflow-hidden relative group cursor-pointer"
                >
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                  </div>
                  
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
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

