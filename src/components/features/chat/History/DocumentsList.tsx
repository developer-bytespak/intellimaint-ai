'use client';

import { Document } from '@/types/chat';

interface DocumentsListProps {
  documents: Document[];
  onViewDocument: (documentId: string) => void;
}

export default function DocumentsList({
  documents,
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
    </div>
  );
}

