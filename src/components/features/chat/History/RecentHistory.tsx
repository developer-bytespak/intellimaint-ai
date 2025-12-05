'use client';

import { useState } from 'react';
import { Chat, PhotoGroup, Document, TabType, Photo } from '@/types/chat';
import ChatsList from './ChatsList';
import PhotosGrid from './PhotosGrid';
import DocumentsList from './DocumentsList';

interface RecentHistoryProps {
  chats: Chat[];
  activeChat: Chat | null;
  photoGroups: PhotoGroup[];
  documents: Document[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onChatSelect: (chat: Chat) => void;
  onCreateNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onDeletePhoto: (photoId: string) => void;
  onViewPhoto: (photoId: string) => void;
  onDeleteDocument: (documentId: string) => void;
  onViewDocument: (documentId: string) => void;
}

export default function RecentHistory({
  chats,
  activeChat,
  photoGroups,
  documents,
  activeTab,
  onTabChange,
  onChatSelect,
  onCreateNewChat,
  onDeleteChat,
  onDeletePhoto,
  onViewPhoto,
  onDeleteDocument,
  onViewDocument
}: RecentHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [showDeleteChatConfirm, setShowDeleteChatConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [showDeleteDocumentConfirm, setShowDeleteDocumentConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  // Filter chats based on search query
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chat.messages.length > 0 && chat.messages[chat.messages.length - 1].content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter documents based on search query
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter photo groups based on search query
  const filteredPhotoGroups = photoGroups.map(group => ({
    ...group,
    photos: group.photos.filter(photo =>
      photo.filename.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.photos.length > 0);

  // Handle view photo - set it for overlay
  const handleViewPhoto = (photo: Photo) => {
    setViewingPhoto(photo);
    // Also call the original handler if needed
    onViewPhoto(photo.id);
  };

  // Handle delete photo - show confirmation dialog
  const handleDeletePhoto = (photoId: string) => {
    setPhotoToDelete(photoId);
    setShowDeleteConfirm(true);
  };

  // Confirm delete photo
  const confirmDeletePhoto = () => {
    if (photoToDelete) {
      // If the photo being viewed is deleted, close the overlay
      if (viewingPhoto?.id === photoToDelete) {
        setViewingPhoto(null);
      }
      // Call the original delete handler
      onDeletePhoto(photoToDelete);
      setPhotoToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  // Cancel delete photo
  const cancelDeletePhoto = () => {
    setPhotoToDelete(null);
    setShowDeleteConfirm(false);
  };

  // Handle delete chat - show confirmation dialog
  const handleDeleteChat = (chatId: string) => {
    setChatToDelete(chatId);
    setShowDeleteChatConfirm(true);
  };

  // Confirm delete chat
  const confirmDeleteChat = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete);
      setChatToDelete(null);
      setShowDeleteChatConfirm(false);
    }
  };

  // Cancel delete chat
  const cancelDeleteChat = () => {
    setChatToDelete(null);
    setShowDeleteChatConfirm(false);
  };

  // Handle view document - find the document and set it for overlay
  const handleViewDocument = (documentId: string) => {
    // Find the document in the documents array
    const document = documents.find(doc => doc.id === documentId);
    if (document) {
      setViewingDocument(document);
    }
    // Also call the original handler if needed
    onViewDocument(documentId);
  };

  // Handle delete document - show confirmation dialog
  const handleDeleteDocument = (documentId: string) => {
    setDocumentToDelete(documentId);
    setShowDeleteDocumentConfirm(true);
  };

  // Confirm delete document
  const confirmDeleteDocument = () => {
    if (documentToDelete) {
      // If the document being viewed is deleted, close the overlay
      if (viewingDocument?.id === documentToDelete) {
        setViewingDocument(null);
      }
      // Call the original delete handler
      onDeleteDocument(documentToDelete);
      setDocumentToDelete(null);
      setShowDeleteDocumentConfirm(false);
    }
  };

  // Cancel delete document
  const cancelDeleteDocument = () => {
    setDocumentToDelete(null);
    setShowDeleteDocumentConfirm(false);
  };

  // Generate image URL for photo (same logic as PhotosGrid)
  const getPhotoImageUrl = (photo: Photo, index: number) => {
    if (photo.url && (photo.url.startsWith('http') || photo.url.startsWith('/'))) {
      return photo.url;
    }
    const photoSeed = parseInt(photo.id.replace(/\D/g, '')) || index;
    const imageId = (photoSeed % 1000) + 1;
    return `https://picsum.photos/id/${imageId}/800/800`;
  };

  // Generate document content preview based on document type and title
  const getDocumentContent = (document: Document) => {
    const title = document.title.toLowerCase();
    
    // PDF content
    if (document.type === 'PDF') {
      if (title.includes('maintenance') || title.includes('schedule')) {
        return {
          title: 'Maintenance Schedule',
          content: [
            '**Quarterly Maintenance Schedule**',
            '',
            '**Equipment:** Industrial Generator Set',
            '**Model:** GEN-5000-XL',
            '**Serial Number:** IG-2024-7892',
            '',
            '**Scheduled Tasks:**',
            '1. Oil Change - Every 250 hours',
            '2. Air Filter Replacement - Every 500 hours',
            '3. Spark Plug Inspection - Every 100 hours',
            '4. Battery Check - Monthly',
            '5. Coolant System Flush - Annually',
            '',
            '**Next Service Date:** July 15, 2025',
            '**Service Provider:** IntelliMaint Services',
            '',
            '**Notes:**',
            'All maintenance activities should be logged in the system.',
            'Any anomalies detected during inspection must be reported immediately.'
          ]
        };
      } else if (title.includes('fault') || title.includes('report')) {
        return {
          title: 'Fault Analysis Report',
          content: [
            '**Operational Fault Report**',
            '',
            '**Date:** June 20, 2025',
            '**Equipment ID:** GEN-5000-XL-7892',
            '**Fault Code:** ERR-0421',
            '',
            '**Issue Description:**',
            'Generator failed to start during scheduled maintenance test.',
            'Initial diagnosis indicates potential fuel system contamination.',
            '',
            '**Symptoms Observed:**',
            '• Engine cranks but does not start',
            '• Fuel pump activates but no ignition',
            '• Check engine light illuminated',
            '',
            '**Recommended Actions:**',
            '1. Drain and replace fuel',
            '2. Inspect fuel filter for contamination',
            '3. Check fuel injectors for blockages',
            '4. Test fuel pump pressure',
            '',
            '**Priority:** High',
            '**Status:** Under Investigation'
          ]
        };
      } else if (title.includes('inspection')) {
        return {
          title: 'Inspection Report',
          content: [
            '**Generator Inspection Report**',
            '',
            '**Inspection Date:** May 28, 2025',
            '**Inspector:** John Smith, Certified Technician',
            '**Equipment:** Industrial Generator Set',
            '',
            '**Visual Inspection:**',
            '✓ Exterior condition: Good',
            '✓ No visible leaks or damage',
            '✓ All connections secure',
            '',
            '**Functional Tests:**',
            '✓ Start-up test: Passed',
            '✓ Load test: Passed',
            '✓ Voltage output: Within specifications',
            '',
            '**Maintenance Items:**',
            '• Oil level: Adequate',
            '• Coolant level: Adequate',
            '• Battery voltage: 12.6V (Normal)',
            '',
            '**Recommendations:**',
            'Schedule next service in 250 operating hours.',
            'Monitor fuel quality regularly.'
          ]
        };
      }
    }
    
    // PPT content
    if (document.type === 'PPT') {
      if (title.includes('diagnostic') || title.includes('troubleshooting')) {
        return {
          title: 'Troubleshooting Guide',
          content: [
            '**Slide 1: Equipment Diagnostic Overview**',
            '',
            '**Common Issues and Solutions**',
            '',
            '**Issue 1: Generator Won\'t Start**',
            '• Check fuel level and quality',
            '• Inspect battery voltage',
            '• Verify oil level',
            '• Check for error codes',
            '',
            '**Issue 2: Low Power Output**',
            '• Inspect air filter',
            '• Check fuel injectors',
            '• Verify load capacity',
            '• Test voltage regulator',
            '',
            '**Issue 3: Overheating**',
            '• Check coolant level',
            '• Inspect radiator',
            '• Verify fan operation',
            '• Check for blockages',
            '',
            '**Preventive Measures:**',
            '• Regular maintenance schedule',
            '• Quality fuel usage',
            '• Proper storage conditions',
            '• Timely service intervals'
          ]
        };
      } else if (title.includes('performance') || title.includes('metrics')) {
        return {
          title: 'Performance Metrics',
          content: [
            '**Equipment Performance Analysis**',
            '',
            '**Q2 2025 Performance Metrics**',
            '',
            '**Uptime:** 98.5%',
            '**Average Load:** 75%',
            '**Fuel Efficiency:** 0.42 L/kWh',
            '**Maintenance Cost:** $2,450',
            '',
            '**Key Performance Indicators:**',
            '• Mean Time Between Failures: 1,250 hours',
            '• Mean Time To Repair: 4.5 hours',
            '• Overall Equipment Effectiveness: 92%',
            '',
            '**Trends:**',
            '✓ Improved fuel efficiency vs. Q1',
            '✓ Reduced maintenance incidents',
            '✓ Increased reliability',
            '',
            '**Recommendations:**',
            'Continue current maintenance schedule.',
            'Consider predictive maintenance upgrades.'
          ]
        };
      }
    }
    
    // DOC content
    if (document.type === 'DOC') {
      if (title.includes('health') || title.includes('summary')) {
        return {
          title: 'Machine Health Summary',
          content: [
            '**Machine Health Summary - June 2025**',
            '',
            '**Overall Health Status:** Good',
            '**Health Score:** 87/100',
            '',
            '**Component Status:**',
            '• Engine: Excellent (95/100)',
            '• Fuel System: Good (85/100)',
            '• Electrical System: Good (88/100)',
            '• Cooling System: Good (82/100)',
            '• Battery: Fair (75/100) - Replacement recommended',
            '',
            '**Recent Activities:**',
            '• Oil change completed: June 10, 2025',
            '• Air filter replaced: June 5, 2025',
            '• Inspection completed: June 15, 2025',
            '',
            '**Upcoming Maintenance:**',
            '• Battery replacement: July 2025',
            '• Coolant flush: August 2025',
            '',
            '**Alerts:**',
            '⚠ Battery voltage below optimal range',
            '⚠ Consider replacing within 30 days'
          ]
        };
      } else if (title.includes('checklist') || title.includes('procedures')) {
        return {
          title: 'Maintenance Checklist',
          content: [
            '**Preventive Maintenance Checklist**',
            '',
            '**Daily Checks:**',
            '☐ Check fuel level',
            '☐ Inspect for leaks',
            '☐ Verify battery voltage',
            '☐ Check oil level',
            '☐ Test start-up',
            '',
            '**Weekly Checks:**',
            '☐ Clean air filter',
            '☐ Check coolant level',
            '☐ Inspect belts',
            '☐ Test load capacity',
            '',
            '**Monthly Checks:**',
            '☐ Full system inspection',
            '☐ Oil analysis',
            '☐ Battery load test',
            '☐ Document all findings',
            '',
            '**Quarterly Checks:**',
            '☐ Complete service',
            '☐ Replace filters',
            '☐ System calibration',
            '☐ Performance testing'
          ]
        };
      }
    }
    
    // Default content
    return {
      title: document.title,
      content: [
        `**${document.title}**`,
        '',
        '**Document Information:**',
        `Type: ${document.type}`,
        `Size: ${document.size}`,
        `Date: ${document.date.toLocaleDateString()}`,
        '',
        '**Content Preview:**',
        'This document contains important information about equipment maintenance and operations.',
        'Please review all sections carefully and follow the recommended procedures.',
        '',
        '**Key Points:**',
        '• Regular maintenance is essential for optimal performance',
        '• Follow manufacturer guidelines',
        '• Document all maintenance activities',
        '• Report any anomalies immediately'
      ]
    };
  };

  return (
    <div className="flex-1 bg-[#1f2632] text-white flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-4 py-4 bg-transparent flex-shrink-0">
        <h1 className="text-lg font-bold text-center text-white">Recent History</h1>
      </div>

      {/* Tabs */}
      <div className="flex px-4 py-4 border-b border-[#2a3441] gap-2 flex-shrink-0">
        <button
          onClick={() => onTabChange('chats')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'chats'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Chats
        </button>
        <button
          onClick={() => onTabChange('photos')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'photos'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Photos
        </button>
        <button
          onClick={() => onTabChange('documents')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'documents'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Documents
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className="w-full bg-[#3a4a5a] text-white placeholder-gray-300 px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
      </div>

      {/* Content - Dynamic Height */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 min-h-0 chat-scrollbar" style={{ paddingBottom: '40px' }}>
        {activeTab === 'chats' && (
          <div className="pb-4">
            <ChatsList
              chats={filteredChats}
              activeChat={activeChat}
              onChatSelect={onChatSelect}
              onCreateNewChat={onCreateNewChat}
              onDeleteChat={handleDeleteChat}
            />
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="pb-4">
            <PhotosGrid
              photoGroups={filteredPhotoGroups}
              onDeletePhoto={handleDeletePhoto}
              onViewPhoto={handleViewPhoto}
            />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="pb-24">
            <DocumentsList
              documents={filteredDocuments}
              onViewDocument={handleViewDocument}
            />
          </div>
        )}
      </div>

      {/* Photo Overlay - Full Screen */}
      {viewingPhoto && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-lg z-[9999] flex items-center justify-center p-4"
          onClick={() => setViewingPhoto(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
        >
          <div 
            className="relative bg-[#1f2632] rounded-xl overflow-hidden max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxHeight: '90vh' }}
          >
            {/* Close Button */}
            <button
              onClick={() => setViewingPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-200"
              title="Close"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Photo */}
            <div className="p-4">
              <img
                src={viewingPhoto.url || getPhotoImageUrl(viewingPhoto, 0)}
                alt={viewingPhoto.filename || 'Photo'}
                className="w-full h-auto max-h-[calc(90vh-180px)] object-contain rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const photoSeed = parseInt(viewingPhoto.id.replace(/\D/g, '')) || 0;
                  const fallbackId = ((photoSeed + 100) % 1000) + 1;
                  if (!target.dataset.fallbackAttempted) {
                    target.dataset.fallbackAttempted = 'true';
                    target.src = `https://picsum.photos/id/${fallbackId}/800/800`;
                  }
                }}
              />
              {/* Photo Info */}
              <div className="mt-4 relative">
                <div className="text-center">
                  <p className="text-white text-sm font-medium">{viewingPhoto.filename}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {viewingPhoto.date.toLocaleDateString()} • {viewingPhoto.size ? `${(viewingPhoto.size / 1000).toFixed(1)} KB` : ''}
                </p>
                </div>
                {/* Delete Button - Bottom Right after description */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(viewingPhoto.id);
                  }}
                  className="absolute -bottom-1 -right-1 p-2 bg-red-500/90 hover:bg-red-600 rounded-full transition-colors duration-200 shadow-lg"
                  title="Delete photo"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div 
          className="absolute inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={cancelDeletePhoto}
        >
          <div 
            className="relative bg-[#1f2632] rounded-xl overflow-hidden max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-white text-lg font-semibold mb-2">Delete Photo</h3>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to delete this photo? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDeletePhoto}
                  className="px-4 py-2 bg-[#2a3441] hover:bg-[#3a4a5a] text-white rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePhoto}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Overlay - Constrained to menu bar width */}
      {viewingDocument && (
        <div 
          className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingDocument(null)}
        >
          <div 
            className="relative bg-[#1f2632] rounded-xl overflow-hidden max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxHeight: '90vh' }}
          >
            {/* Close Button */}
            <button
              onClick={() => setViewingDocument(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-200"
              title="Close"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Document Preview */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 relative">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-white text-xl font-bold ${
                  viewingDocument.type === 'PDF' ? 'bg-green-500' :
                  viewingDocument.type === 'PPT' ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                  {viewingDocument.type}
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-lg font-semibold mb-1">{viewingDocument.title}</h3>
                  <p className="text-gray-400 text-sm">
                    {viewingDocument.date.toLocaleDateString()} • {viewingDocument.size}
                  </p>
                </div>
                {/* Delete Button - Bottom Right after description */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDocument(viewingDocument.id);
                  }}
                  className="absolute -bottom-1 -right-1 p-2 bg-red-500/90 hover:bg-red-600 rounded-full transition-colors duration-200 shadow-lg"
                  title="Delete document"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>

              {/* Document Content Preview */}
              <div className="bg-[#2a3441] rounded-lg p-6 min-h-[400px] max-h-[calc(90vh-300px)] overflow-y-auto">
                {(() => {
                  const docContent = getDocumentContent(viewingDocument);
                  return (
                    <div className="space-y-4">
                      <div className="border-b border-[#3a4a5a] pb-3">
                        <h4 className="text-white text-lg font-semibold mb-2">{docContent.title}</h4>
                      </div>
                      <div className="text-white text-sm leading-relaxed space-y-2">
                        {docContent.content.map((line, index) => {
                          if (line.startsWith('**') && line.endsWith('**')) {
                            // Bold text
                            const text = line.slice(2, -2);
                            return (
                              <p key={index} className="font-semibold text-base mt-4 mb-2">
                                {text}
                              </p>
                            );
                          } else if (line.startsWith('•') || line.startsWith('☐') || line.startsWith('✓') || line.startsWith('⚠')) {
                            // List item
                            return (
                              <p key={index} className="ml-4 text-gray-300">
                                {line}
                              </p>
                            );
                          } else if (line.trim() === '') {
                            // Empty line
                            return <div key={index} className="h-2" />;
                          } else {
                            // Regular text
                            return (
                              <p key={index} className="text-gray-300">
                                {line}
                              </p>
                            );
                          }
                        })}
                      </div>
                      <div className="mt-6 pt-4 border-t border-[#3a4a5a]">
                        <button
                          onClick={() => {
                            // Create a blob with dummy content based on document type
                            const docContent = getDocumentContent(viewingDocument);
                            const content = docContent.content.join('\n');
                            const blob = new Blob([content], { 
                              type: viewingDocument.type === 'PDF' ? 'application/pdf' : 
                                    viewingDocument.type === 'PPT' ? 'application/vnd.ms-powerpoint' : 
                                    'application/msword' 
                            });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `${viewingDocument.title}.${viewingDocument.type.toLowerCase()}`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Document
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Document Confirmation Dialog */}
      {showDeleteDocumentConfirm && (
        <div 
          className="absolute inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={cancelDeleteDocument}
        >
          <div 
            className="relative bg-[#1f2632] rounded-xl overflow-hidden max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-white text-lg font-semibold mb-2">Delete Document</h3>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to delete this document? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDeleteDocument}
                  className="px-4 py-2 bg-[#2a3441] hover:bg-[#3a4a5a] text-white rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteDocument}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Chat Confirmation Dialog */}
      {showDeleteChatConfirm && (
        <div 
          className="absolute inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={cancelDeleteChat}
        >
          <div 
            className="relative bg-[#1f2632] rounded-xl overflow-hidden max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-white text-lg font-semibold mb-2">Delete Chat</h3>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to delete this chat? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDeleteChat}
                  className="px-4 py-2 bg-[#2a3441] hover:bg-[#3a4a5a] text-white rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteChat}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

