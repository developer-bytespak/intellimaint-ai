
'use client';

import { useEffect, useState, Suspense } from 'react';
import { Chat, TabType, Photo, Document as ChatDocument } from '@/types/chat';
import { useRouter, useSearchParams } from 'next/navigation';
import { useChat } from '@/hooks/useChat';
import DocumentsList from '@/components/features/chat/History/DocumentsList';
import PhotosGrid from '@/components/features/chat/History/PhotosGrid';

function RecentHistoryContent() {
  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [showDeleteChatConfirm, setShowDeleteChatConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [viewingDocument, setViewingDocument] = useState<ChatDocument | null>(null);
  const [showDeleteDocumentConfirm, setShowDeleteDocumentConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const { chats, searchingofSpecificChat, deleteChat, photoGroups, deletePhoto, documents, deleteDocument } = useChat();
  const router = useRouter();
  const searchParams = useSearchParams();

  const addParams = (params: string) => {
    router.push(`/recent-history?recent-history=${params}`);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const param = searchParams.get('recent-history');
    if (param === null) {
      router.replace("/recent-history?recent-history=chats");
      return;
    }
    if (param === 'chats') {
      setActiveTab('chats');
    } else if (param === 'photos') {
      setActiveTab('photos');
    } else if (param === 'documents') {
      setActiveTab('documents');
    }
  }, [searchParams, router]);

  const handleChatSelect = (chat: Chat) => {
    // setActiveChat(chat);
    // console.log(chat);
    searchingofSpecificChat(chat.id);
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle view document - find the document and set it for overlay
  const handleViewDocument = (documentId: string) => {
    // Find the document in the documents array
    const document = documents.find(doc => doc.id === documentId);
    if (document) {
      setViewingDocument(document);
    }
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
      // Call the delete handler
      deleteDocument(documentToDelete);
      setDocumentToDelete(null);
      setShowDeleteDocumentConfirm(false);
    }
  };

  // Cancel delete document
  const cancelDeleteDocument = () => {
    setDocumentToDelete(null);
    setShowDeleteDocumentConfirm(false);
  };

  // Handle view photo - find the photo and set it for overlay
  const handleViewPhoto = (photoId: string) => {
    // Find the photo in all photo groups
    for (const group of photoGroups) {
      const photo = group.photos.find(p => p.id === photoId);
      if (photo) {
        setViewingPhoto(photo);
        break;
      }
    }
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
      // Call the delete handler
      deletePhoto(photoToDelete);
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
      deleteChat(chatToDelete);
      setChatToDelete(null);
      setShowDeleteChatConfirm(false);
    }
  };

  // Cancel delete chat
  const cancelDeleteChat = () => {
    setChatToDelete(null);
    setShowDeleteChatConfirm(false);
  };

  // Generate image URL for photo
  const getPhotoImageUrl = (photo: Photo, index: number) => {
    if (photo.url && (photo.url.startsWith('http') || photo.url.startsWith('/'))) {
      return photo.url;
    }
    const photoSeed = parseInt(photo.id.replace(/\D/g, '')) || index;
    const imageId = (photoSeed % 1000) + 1;
    return `https://picsum.photos/id/${imageId}/800/800`;
  };

  // Generate document content preview based on document type and title
  const getDocumentContent = (document: ChatDocument) => {
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
      } else if (title.includes('load test') || title.includes('test results')) {
        return {
          title: 'Load Test Results',
          content: [
            '**Generator Load Test Results**',
            '',
            '**Test Date:** May 12, 2025',
            '**Equipment:** Industrial Generator Set',
            '**Test Duration:** 2 hours',
            '',
            '**Test Parameters:**',
            '• Load Applied: 75% of rated capacity',
            '• Ambient Temperature: 22°C',
            '• Fuel Type: Diesel',
            '',
            '**Results:**',
            '✓ Voltage Stability: Excellent',
            '✓ Frequency Stability: Excellent',
            '✓ Temperature: Within normal range',
            '✓ Fuel Consumption: 0.42 L/kWh',
            '',
            '**Performance Metrics:**',
            '• Starting Time: 3.2 seconds',
            '• Voltage Regulation: ±2%',
            '• Frequency Regulation: ±0.5 Hz',
            '',
            '**Conclusion:**',
            'Generator performance is within manufacturer specifications.',
            'No issues detected during load test.'
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
      } else if (title.includes('installation') || title.includes('guide')) {
        return {
          title: 'Installation Guide',
          content: [
            '**Generator Installation Guide**',
            '',
            '**Pre-Installation Requirements:**',
            '• Level concrete pad (minimum 4" thick)',
            '• Adequate ventilation',
            '• Fuel supply connection',
            '• Electrical connection point',
            '',
            '**Installation Steps:**',
            '1. Position generator on pad',
            '2. Connect fuel supply line',
            '3. Install exhaust system',
            '4. Connect electrical wiring',
            '5. Install battery and connect',
            '6. Fill with oil and coolant',
            '7. Perform initial start-up test',
            '',
            '**Safety Considerations:**',
            '• Maintain clearance requirements',
            '• Ensure proper grounding',
            '• Follow local codes',
            '• Install carbon monoxide detectors',
            '',
            '**Post-Installation:**',
            '• Complete system check',
            '• Document installation',
            '• Schedule first service'
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
      } else if (title.includes('operating') || title.includes('procedures')) {
        return {
          title: 'Operating Procedures',
          content: [
            '**Machine Operating Procedures**',
            '',
            '**Start-Up Procedure:**',
            '1. Check fuel level',
            '2. Verify oil level',
            '3. Inspect for leaks',
            '4. Turn on main switch',
            '5. Press start button',
            '6. Monitor startup sequence',
            '',
            '**Normal Operation:**',
            '• Monitor gauges regularly',
            '• Check temperature readings',
            '• Verify load capacity',
            '• Listen for unusual sounds',
            '',
            '**Shutdown Procedure:**',
            '1. Reduce load gradually',
            '2. Allow cool-down period',
            '3. Turn off main switch',
            '4. Document operating hours',
            '',
            '**Safety Guidelines:**',
            '• Never operate without proper ventilation',
            '• Keep area clear of flammable materials',
            '• Follow all safety protocols',
            '• Report any issues immediately'
          ]
        };
      } else if (title.includes('warranty') || title.includes('information')) {
        return {
          title: 'Warranty Information',
          content: [
            '**Equipment Warranty Information**',
            '',
            '**Warranty Period:** 3 years from purchase date',
            '**Purchase Date:** March 15, 2024',
            '**Warranty Expires:** March 15, 2027',
            '',
            '**Coverage:**',
            '• Parts: 3 years',
            '• Labor: 2 years',
            '• Extended service: Available',
            '',
            '**Warranty Terms:**',
            '• Regular maintenance required',
            '• Authorized service providers only',
            '• Proper usage conditions',
            '• Documentation of all services',
            '',
            '**Contact Information:**',
            'Warranty Service: 1-800-INTELLI',
            'Email: warranty@intellimaint.com',
            '',
            '**Important Notes:**',
            'Keep all service records for warranty claims.',
            'Follow maintenance schedule to maintain coverage.'
          ]
        };
      } else if (title.includes('cost') || title.includes('analysis')) {
        return {
          title: 'Cost Analysis Report',
          content: [
            '**Maintenance Cost Analysis Report**',
            '',
            '**Period:** Q2 2025',
            '**Equipment:** Industrial Generator Set',
            '',
            '**Cost Breakdown:**',
            '• Parts: $1,200',
            '• Labor: $850',
            '• Fuel: $400',
            '**Total:** $2,450',
            '',
            '**Comparison:**',
            'Q1 2025: $2,800',
            'Q2 2025: $2,450',
            '**Savings:** $350 (12.5% reduction)',
            '',
            '**Cost per Operating Hour:**',
            'Q1: $0.85/hour',
            'Q2: $0.72/hour',
            '',
            '**Factors Contributing to Savings:**',
            '✓ Preventive maintenance effectiveness',
            '✓ Reduced emergency repairs',
            '✓ Optimized fuel consumption',
            '',
            '**Recommendations:**',
            'Continue current maintenance strategy.',
            'Consider predictive maintenance for further optimization.'
          ]
        };
      } else if (title.includes('replacement') || title.includes('recommendations')) {
        return {
          title: 'Replacement Recommendations',
          content: [
            '**Equipment Replacement Recommendations**',
            '',
            '**Current Equipment:**',
            '• Model: GEN-5000-XL',
            '• Age: 8 years',
            '• Operating Hours: 12,500',
            '',
            '**Assessment:**',
            'Equipment is approaching end of optimal service life.',
            'Maintenance costs are increasing.',
            'Efficiency has decreased by 15%.',
            '',
            '**Recommendation:**',
            'Consider replacement within 12-18 months.',
            '',
            '**Benefits of Replacement:**',
            '• Improved fuel efficiency (20-25%)',
            '• Reduced maintenance costs',
            '• Enhanced reliability',
            '• Modern safety features',
            '• Better warranty coverage',
            '',
            '**Estimated Replacement Cost:**',
            'New Equipment: $45,000',
            'Installation: $3,500',
            '**Total:** $48,500',
            '',
            '**ROI Analysis:**',
            'Payback period: 3.5 years',
            'Based on fuel savings and reduced maintenance.'
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

  // Filter photo groups based on search query
  const filteredPhotoGroups = photoGroups.map(group => ({
    ...group,
    photos: group.photos.filter(photo =>
      photo.filename.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.photos.length > 0);

  return (
    <div className="h-screen bg-[#1f2632] text-white flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-4 py-6 bg-transparent flex-shrink-0">
        <h1 className="text-xl font-bold text-white text-center">Recent History</h1>
      </div>

      {/* Tabs */}
      <div className="flex w-full border-b border-[#2a3441] flex-shrink-0">
        <button
          onClick={() => {
            handleTabChange('chats');
            addParams("chats");
          }}
          className={`flex-1 py-4 rounded-none text-sm font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'chats'
              ? 'bg-blue-500/10 text-white border-blue-500'
              : 'text-gray-400 hover:text-white border-transparent'
          }`}
        >
          Chats
        </button>
        <button
          onClick={() => {
            handleTabChange('photos');
            addParams("photos");
          }}
          className={`flex-1 py-4 rounded-none text-sm font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'photos'
              ? 'bg-blue-500/10 text-white border-blue-500'
              : 'text-gray-400 hover:text-white border-transparent'
          }`}
        >
          Photos
        </button>
        <button
          onClick={() => {
            handleTabChange('documents');
            addParams("documents");
          }}
          className={`flex-1 py-4 rounded-none text-sm font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'documents'
              ? 'bg-blue-500/10 text-white border-blue-500'
              : 'text-gray-400 hover:text-white border-transparent'
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

      {/* Content - Responsive Grid */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 min-h-0 chat-scrollbar" style={{ paddingBottom: '200px' }}>
        {/* Chats Tab */}
        {activeTab === 'chats' && (
          <div>
            <div className="flex justify-between items-center mb-4 ">
              <h2 className="text-gray-400 text-sm font-medium ">Chats</h2>
              <button 
              onClick={() => {
                router.push("/chat?closeSidebar=true");
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer">
                New Chat
              </button>
            </div>
            <div className="space-y-2 ">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    activeChat?.id === chat.id
                      ? 'bg-[#3a4a5a] border border-blue-500'
                      : 'hover:bg-[#3a4a5a]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium mb-1">{chat.title}</p>
                      {chat.messages.length > 0 && (
                        <p className="text-gray-400 text-xs">
                          {chat.messages[chat.messages.length - 1].content.substring(0, 50)}...
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <button 
                        className="p-1 hover:bg-red-500/20 rounded transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                      >
                        <svg className="w-5 h-5 text-red-400 hover:text-red-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="pb-4">
            <PhotosGrid
              photoGroups={filteredPhotoGroups}
              onDeletePhoto={handleDeletePhoto}
              onViewPhoto={handleViewPhoto}
            />
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="pb-4">
            <DocumentsList
              documents={filteredDocuments}
              onViewDocument={handleViewDocument}
            />
          </div>
        )}
      </div>

      {/* Chat Detail Modal for Mobile */}
      {activeChat && (
        <div className="fixed inset-0 bg-[#1f2632] z-50 lg:hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#2a3441]">
            <button
              onClick={() => setActiveChat(null)}
              className="text-white hover:text-blue-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-white">{activeChat.title}</h2>
            <div></div>
          </div>
          <div className="p-4 space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto">
            {activeChat.messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white ml-4'
                    : 'bg-[#2a3441] text-white mr-4'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Overlay - Constrained to menu bar width */}
      {viewingPhoto && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingPhoto(null)}
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
                src={getPhotoImageUrl(viewingPhoto, 0)}
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
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
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
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
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
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
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
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1f2632] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <RecentHistoryContent />
    </Suspense>
  );
}