'use client';

import { useEffect, useRef } from 'react';
import { Document } from '@/types/chat';

interface DocumentsListProps {
  documents: Document[];
  onViewDocument: (documentId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export default function DocumentsList({
  documents,
  onViewDocument,
  onLoadMore,
  hasMore = false,
  isLoading = false
}: DocumentsListProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && onLoadMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div>
      <h2 className="text-gray-400 text-sm font-medium mb-4">Documents</h2>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div 
            key={doc.id} 
            className="p-3 bg-[#2a3441] rounded-xl group relative cursor-pointer hover:bg-[#3a4a5a] transition-colors duration-200"
            onClick={() => onViewDocument(doc.id)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold ${
                doc.type === 'PDF' ? 'bg-green-500' :
                doc.type === 'PPT' ? 'bg-orange-500' : 'bg-blue-500'
              }`}>
                {doc.type}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{doc.title}</p>
                <p className="text-gray-400 text-xs">{formatDate(doc.date)} - {doc.size}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={observerTarget} className="py-4 flex justify-center">
          {isLoading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          )}
        </div>
      )}
    </div>
  );
}

