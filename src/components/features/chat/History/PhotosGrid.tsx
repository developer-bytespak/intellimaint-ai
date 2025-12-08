'use client';

import { useEffect, useRef, useCallback } from 'react';
import { PhotoGroup, Photo } from '@/types/chat';
import { useUpload } from '@/hooks/useUploadContext';

interface PhotosGridProps {
  photoGroups?: PhotoGroup[];
  onDeletePhoto: (photoId: string) => void;
  onViewPhoto: (photo: Photo) => void;
  enabled?: boolean;
}

// Helper function to group photos by month
const groupPhotosByMonth = (photos: Photo[]): PhotoGroup[] => {
  const groups: { [key: string]: Photo[] } = {};
  
  photos.forEach((photo) => {
    const date = new Date(photo.date);
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const key = `${month}-${year}`;
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(photo);
  });

  // Convert to PhotoGroup array and sort by date (desc order - newest first)
  const photoGroups: PhotoGroup[] = Object.entries(groups).map(([key, photos]) => {
    const date = new Date(photos[0].date);
    return {
      month: date.toLocaleString('en-US', { month: 'long' }),
      year: date.getFullYear(),
      photos: photos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  });

  // Sort groups by date (desc order - newest first)
  return photoGroups.sort((a, b) => {
    const dateA = new Date(a.year, new Date(`${a.month} 1, ${a.year}`).getMonth());
    const dateB = new Date(b.year, new Date(`${b.month} 1, ${b.year}`).getMonth());
    return dateB.getTime() - dateA.getTime();
  });
};

export default function PhotosGrid({
  photoGroups: propPhotoGroups,
  onDeletePhoto,
  onViewPhoto,
  enabled = true,
}: PhotosGridProps) {
  const { useHistoryImages } = useUpload();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHistoryImages(enabled);

  // Flatten all pages into a single array
  const photos: Photo[] = data?.pages.flat() || [];

  // Intersection Observer ref for infinite scrolling
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer callback
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        console.log('[PhotosGrid] Loading more images...');
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // Setup intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '200px', // Start loading 200px before reaching the bottom
      threshold: 0.1,
    });

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [handleObserver]);

  // Debug logging
  console.log('[PhotosGrid] Photos received:', photos);
  console.log('[PhotosGrid] Photos count:', photos.length);
  console.log('[PhotosGrid] Has next page:', hasNextPage);
  console.log('[PhotosGrid] Is fetching next page:', isFetchingNextPage);

  // Group photos by month - ALWAYS use fetched photos when available, ignore propPhotoGroups if enabled
  // Use propPhotoGroups only if fetching is disabled or no photos fetched
  const photoGroups = (enabled && photos.length > 0) 
    ? groupPhotosByMonth(photos) 
    : (propPhotoGroups || []);
  
  console.log('[PhotosGrid] Using', enabled && photos.length > 0 ? 'FETCHED' : 'PROP', 'photoGroups');
  console.log('[PhotosGrid] Photo groups:', photoGroups);
  console.log('[PhotosGrid] Photo groups count:', photoGroups.length);

  // Loading state
  if (isLoading) {
    return (
      <div className="pb-8">
        <h2 className="text-gray-400 text-sm font-medium mb-4">Photos</h2>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm">Loading images...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="pb-8">
        <h2 className="text-gray-400 text-sm font-medium mb-4">Photos</h2>
        <div className="flex items-center justify-center py-12">
          <p className="text-red-400 text-sm">Failed to load images. Please try again.</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (photoGroups.length === 0) {
    return (
      <div className="pb-8">
        <h2 className="text-gray-400 text-sm font-medium mb-4">Photos</h2>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-400 text-sm">No photos found</p>
        </div>
      </div>
    );
  }
  return (
    <div className="pb-8">
      <h2 className="text-gray-400 text-sm font-medium mb-4">Photos</h2>
      <div className="space-y-6">
        {photoGroups
          .map((group) => {
            // Filter photos with valid URLs first
            const validPhotos = group.photos.filter((photo) => {
              const hasValidUrl = photo.url && typeof photo.url === 'string' && photo.url.trim().length > 0 && (photo.url.startsWith('http://') || photo.url.startsWith('https://'));
              if (!hasValidUrl) {
                console.warn('[PhotosGrid] Photo filtered out (no valid URL):', photo);
              } else {
                console.log('[PhotosGrid] Photo passed filter:', photo.url.substring(0, 60) + '...');
              }
              return hasValidUrl;
            });
            
            console.log(`[PhotosGrid] Group ${group.month} ${group.year}: ${group.photos.length} total, ${validPhotos.length} valid`);
            
            // Return group with filtered photos (or null if empty)
            return validPhotos.length > 0 ? { ...group, photos: validPhotos } : null;
          })
          .filter((group): group is PhotoGroup => group !== null) // Remove null entries
          .map((group, groupIndex, filteredGroups) => {
            const isLastGroup = groupIndex === filteredGroups.length - 1;
            return (
            <div key={`${group.month}-${group.year}`} className={isLastGroup ? 'pb-8' : ''}>
              <h3 className="text-gray-400 text-sm font-medium mb-3">{group.month} {group.year}</h3>
              <div className="grid grid-cols-3 gap-2">
              {group.photos.map((photo, index) => {
                  console.log(`[PhotosGrid] Rendering photo ${index} in ${group.month} ${group.year}:`, photo.url?.substring(0, 60) + '...');
                  return (
                    <div 
                      key={photo.id} 
                      className="aspect-square bg-[#2a3441] rounded-xl overflow-hidden relative group"
                    >
                      {/* Photo Image - Only show real images from backend */}
                      <img
                        src={photo.url}
                        alt={photo.filename || 'Photo'}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          // If image fails to load, show placeholder with gradient background
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.fallback-bg')) {
                            const fallbackDiv = document.createElement('div');
                            fallbackDiv.className = 'fallback-bg w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center';
                            const errorText = document.createElement('span');
                            errorText.className = 'text-white text-xs text-center px-2';
                            errorText.textContent = 'Image not available';
                            fallbackDiv.appendChild(errorText);
                            parent.appendChild(fallbackDiv);
                          }
                        }}
                      />
                      
                      {/* Hover Overlay with View and Delete buttons */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('View button clicked, photo:', photo);
                            onViewPhoto(photo);
                          }}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 shadow-lg"
                          title="View Image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePhoto(photo.id);
                          }}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 shadow-lg"
                          title="Delete Image"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
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
      
      {/* Infinite scroll trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-8">
          {isFetchingNextPage && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-sm">Loading more images...</p>
            </div>
          )}
        </div>
      )}
      
      {/* End of results indicator */}
      {!hasNextPage && photos.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-400 text-sm">No more images to load</p>
        </div>
      )}
    </div>
  );
}