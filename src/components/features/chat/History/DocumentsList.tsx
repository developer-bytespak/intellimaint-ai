'use client';

import { Document } from '@/types/chat';

interface DocumentsListProps {
  documents: Document[];
  onDeleteDocument: (documentId: string) => void;
  onViewDocument: (documentId: string) => void;
}

export default function DocumentsList({
  documents,
  onDeleteDocument,
  onViewDocument
}: DocumentsListProps) {
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
          <div key={doc.id} className="p-3 bg-[#2a3441] rounded-xl group relative">
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
              
              {/* Hover overlay with action buttons */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDocument(doc.id);
                  }}
                  className="p-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg transition-colors duration-200"
                  title="View document"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDocument(doc.id);
                  }}
                  className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors duration-200"
                  title="Delete document"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

