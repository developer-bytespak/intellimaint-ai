'use client';


// TODO: User Show Image and Document Preview before sending the message ;

import { MessageDocument } from '@/types/chat';

interface AttachmentPreviewProps {
  images: string[];
  documents: MessageDocument[];
  onRemoveImage: (index: number) => void;
  onRemoveDocument: (index: number) => void;
  onViewImage?: (index: number) => void;
}

export default function AttachmentPreview({
  images,
  documents,
  onRemoveImage,
  onRemoveDocument,
  onViewImage
}: AttachmentPreviewProps) {
  return (
    <>
      {images.length > 0 && (
        <div className="w-full max-w-full mb-3 box-border">
          <div className="flex flex-wrap gap-2 max-w-full">
            {images.map((src, index) => (
              <div key={index} className="flex flex-col items-end w-16">
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(index);
                  }} 
                  className="z-20 bg-[#1f2632] border border-[#3a4a5a] text-white w-5 h-5 rounded-full flex items-center justify-center hover:bg-[#3a4a5a] transition-colors -mb-4 -mr-1"
                >
                  ×
                </button>
                <div 
                  className="w-16 h-16 rounded-lg overflow-hidden border border-[#3a4a5a] cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => onViewImage && onViewImage(index)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`preview-${index}`} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {documents.length > 0 && (
        <div className="w-full max-w-full mb-3 box-border">
          <div className="flex flex-wrap gap-2 max-w-full">
            {documents.map((doc, index) => (
              <div key={index} className="flex flex-col items-end w-auto">
                <button 
                  type="button" 
                  onClick={() => onRemoveDocument(index)} 
                  className="z-20 bg-[#1f2632] border border-[#3a4a5a] text-white w-5 h-5 rounded-full flex items-center justify-center hover:bg-[#3a4a5a] transition-colors -mb-4 -mr-1"
                >
                  ×
                </button>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#3a4a5a] bg-[#1f2632] max-w-[200px]">
                  {doc.type === 'PDF' ? (
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  <span className="text-white text-xs truncate" title={doc.file.name}>
                    {doc.file.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

