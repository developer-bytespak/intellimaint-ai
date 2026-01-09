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
        {documents?.length > 0 ? (
          documents.map((doc)=>(
            <>
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
            </>
          ))
        ):(
          <p className="text-gray-500 text-sm">No documents available.</p>
        )}
      </div>
      
      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={observerTarget} className="py-4 flex justify-center">
          {isLoading && (
            <div className="w-full max-w-xs">
              <div className="p-3 bg-gradient-to-r from-[#232a33] to-[#1f2632] rounded-xl animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#2a3441]" />
                  <div className="flex-1">
                    <div className="h-4 bg-[#2a3441] rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-[#2a3441] rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

