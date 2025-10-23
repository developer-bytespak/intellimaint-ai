import { Chat, Photo, Document, PhotoGroup } from '@/types/chat';

// Mock chat data with realistic generator troubleshooting conversations
export const mockChats: Chat[] = [
  {
    id: '1',
    title: 'My generator won\'t start after...',
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T10:45:00'),
    messages: [
      {
        id: '1-1',
        content: 'My generator won\'t start after sitting for a few weeks. It was working fine before. What could be the issue?',
        role: 'user',
        timestamp: new Date('2024-01-15T10:30:00')
      },
      {
        id: '1-2',
        content: 'There are several common reasons why a generator won\'t start after sitting idle. Let me help you troubleshoot this step by step.\n\n1. **Fuel Issues**: Old or contaminated fuel can cause starting problems. Check if the fuel is fresh (less than 6 months old).\n\n2. **Battery Problems**: If your generator has an electric start, the battery might be dead or weak. Check the battery voltage.\n\n3. **Oil Level**: Ensure the oil level is adequate and not contaminated.\n\nCan you tell me what type of generator you have and how long it\'s been sitting?',
        role: 'assistant',
        timestamp: new Date('2024-01-15T10:31:00')
      },
      {
        id: '1-3',
        content: 'It\'s a Honda EU2200i portable generator, been sitting for about 3 weeks. I checked the oil and it looks fine.',
        role: 'user',
        timestamp: new Date('2024-01-15T10:32:00')
      },
      {
        id: '1-4',
        content: 'For the Honda EU2200i, the most likely culprit is the fuel system. This generator is sensitive to fuel quality. Here\'s what to check:\n\n1. **Fuel Stabilizer**: Did you add fuel stabilizer before storing it?\n2. **Fuel Valve**: Make sure the fuel valve is in the "ON" position\n3. **Choke**: Set the choke to "CLOSED" for cold starts\n4. **Prime the Carburetor**: Pull the starter cord 3-4 times with the choke closed\n\nTry these steps and let me know what happens when you attempt to start it.',
        role: 'assistant',
        timestamp: new Date('2024-01-15T10:33:00')
      }
    ]
  },
  {
    id: '2',
    title: 'The image you proved is a Rugged...',
    createdAt: new Date('2024-01-14T14:20:00'),
    updatedAt: new Date('2024-01-14T14:35:00'),
    messages: [
      {
        id: '2-1',
        content: 'The image you proved is a Rugged generator. I\'m having trouble with the voltage output. It\'s showing inconsistent readings.',
        role: 'user',
        timestamp: new Date('2024-01-14T14:20:00')
      },
      {
        id: '2-2',
        content: 'I can help you troubleshoot the voltage output issues with your Rugged generator. Inconsistent voltage readings can indicate several problems:\n\n1. **Load Imbalance**: Check if you\'re running too many appliances simultaneously\n2. **Engine Speed**: The engine might not be running at the correct RPM\n3. **Voltage Regulator**: Could be a faulty voltage regulator\n4. **Loose Connections**: Check all electrical connections\n\nWhat voltage readings are you seeing, and what loads are you running?',
        role: 'assistant',
        timestamp: new Date('2024-01-14T14:21:00')
      }
    ]
  },
  {
    id: '3',
    title: 'What could be causing this generator...',
    createdAt: new Date('2024-01-13T09:15:00'),
    updatedAt: new Date('2024-01-13T09:30:00'),
    messages: [
      {
        id: '3-1',
        content: 'What could be causing this generator to make a loud knocking sound when it starts?',
        role: 'user',
        timestamp: new Date('2024-01-13T09:15:00')
      },
      {
        id: '3-2',
        content: 'A loud knocking sound during startup is concerning and could indicate serious engine problems. Here are the most likely causes:\n\n1. **Low Oil Level**: Check oil level immediately - this is the most common cause\n2. **Wrong Oil Type**: Using incorrect oil viscosity can cause knocking\n3. **Carbon Buildup**: Excessive carbon deposits in the combustion chamber\n4. **Timing Issues**: Engine timing problems\n5. **Worn Bearings**: Internal engine component wear\n\n**Important**: If you hear knocking, stop the generator immediately to prevent further damage. Check the oil level first, then consult a professional if the problem persists.',
        role: 'assistant',
        timestamp: new Date('2024-01-13T09:16:00')
      }
    ]
  },
  {
    id: '4',
    title: 'Something\'s wrong with the machine',
    createdAt: new Date('2024-01-12T16:45:00'),
    updatedAt: new Date('2024-01-12T17:00:00'),
    messages: [
      {
        id: '4-1',
        content: 'Something\'s wrong with the machine. It\'s running but not producing power to the outlets.',
        role: 'user',
        timestamp: new Date('2024-01-12T16:45:00')
      },
      {
        id: '4-2',
        content: 'If your generator is running but not producing power to the outlets, this is typically an electrical issue. Here\'s what to check:\n\n1. **Circuit Breakers**: Check if any circuit breakers have tripped\n2. **GFCI Outlets**: Test and reset GFCI outlets if present\n3. **Load Switch**: Ensure the load switch is in the "ON" position\n4. **Voltage Selector**: Check if there\'s a voltage selector switch\n5. **Wiring**: Inspect outlet wiring for damage\n\nCan you tell me what type of generator this is and if you see any warning lights?',
        role: 'assistant',
        timestamp: new Date('2024-01-12T16:46:00')
      }
    ]
  },
  {
    id: '5',
    title: 'Why is my generator shutting down...',
    createdAt: new Date('2024-01-11T11:30:00'),
    updatedAt: new Date('2024-01-11T11:45:00'),
    messages: [
      {
        id: '5-1',
        content: 'Why is my generator shutting down after running for only 10 minutes?',
        role: 'user',
        timestamp: new Date('2024-01-11T11:30:00')
      },
      {
        id: '5-2',
        content: 'A generator shutting down after 10 minutes usually indicates an overheating or fuel delivery issue. Common causes include:\n\n1. **Overheating**: Check if the generator is in a well-ventilated area\n2. **Low Oil Shutdown**: Many generators have low oil shutdown protection\n3. **Fuel Filter**: Clogged fuel filter restricting fuel flow\n4. **Air Filter**: Dirty air filter causing rich fuel mixture\n5. **Overload**: Running too many appliances causing automatic shutdown\n\nCheck the oil level first, then examine the air and fuel filters. Is the generator in an enclosed space?',
        role: 'assistant',
        timestamp: new Date('2024-01-11T11:31:00')
      }
    ]
  },
  {
    id: '6',
    title: 'Why is my generator shutting down...',
    createdAt: new Date('2024-01-11T11:30:00'),
    updatedAt: new Date('2024-01-11T11:45:00'),
    messages: [
      {
        id: '5-1',
        content: 'Why is my generator shutting down after running for only 10 minutes?',
        role: 'user',
        timestamp: new Date('2024-01-11T11:30:00')
      },
      {
        id: '5-2',
        content: 'A generator shutting down after 10 minutes usually indicates an overheating or fuel delivery issue. Common causes include:\n\n1. **Overheating**: Check if the generator is in a well-ventilated area\n2. **Low Oil Shutdown**: Many generators have low oil shutdown protection\n3. **Fuel Filter**: Clogged fuel filter restricting fuel flow\n4. **Air Filter**: Dirty air filter causing rich fuel mixture\n5. **Overload**: Running too many appliances causing automatic shutdown\n\nCheck the oil level first, then examine the air and fuel filters. Is the generator in an enclosed space?',
        role: 'assistant',
        timestamp: new Date('2024-01-11T11:31:00')
      }
    ]
  },
  {
    id: '7',
    title: 'Why is my generator shutting down...',
    createdAt: new Date('2024-01-11T11:30:00'),
    updatedAt: new Date('2024-01-11T11:45:00'),
    messages: [
      {
        id: '5-1',
        content: 'Why is my generator shutting down after running for only 10 minutes?',
        role: 'user',
        timestamp: new Date('2024-01-11T11:30:00')
      },
      {
        id: '5-2',
        content: 'A generator shutting down after 10 minutes usually indicates an overheating or fuel delivery issue. Common causes include:\n\n1. **Overheating**: Check if the generator is in a well-ventilated area\n2. **Low Oil Shutdown**: Many generators have low oil shutdown protection\n3. **Fuel Filter**: Clogged fuel filter restricting fuel flow\n4. **Air Filter**: Dirty air filter causing rich fuel mixture\n5. **Overload**: Running too many appliances causing automatic shutdown\n\nCheck the oil level first, then examine the air and fuel filters. Is the generator in an enclosed space?',
        role: 'assistant',
        timestamp: new Date('2024-01-11T11:31:00')
      }
    ]
  },
  {
    id: '8',
    title: 'Why is my generator shutting down...',
    createdAt: new Date('2024-01-11T11:30:00'),
    updatedAt: new Date('2024-01-11T11:45:00'),
    messages: [
      {
        id: '5-1',
        content: 'Why is my generator shutting down after running for only 10 minutes?',
        role: 'user',
        timestamp: new Date('2024-01-11T11:30:00')
      },
      {
        id: '5-2',
        content: 'A generator shutting down after 10 minutes usually indicates an overheating or fuel delivery issue. Common causes include:\n\n1. **Overheating**: Check if the generator is in a well-ventilated area\n2. **Low Oil Shutdown**: Many generators have low oil shutdown protection\n3. **Fuel Filter**: Clogged fuel filter restricting fuel flow\n4. **Air Filter**: Dirty air filter causing rich fuel mixture\n5. **Overload**: Running too many appliances causing automatic shutdown\n\nCheck the oil level first, then examine the air and fuel filters. Is the generator in an enclosed space?',
        role: 'assistant',
        timestamp: new Date('2024-01-11T11:31:00')
      }
    ]
  },
  {
    id: '9',
    title: 'Why is my generator shutting down...',
    createdAt: new Date('2024-01-11T11:30:00'),
    updatedAt: new Date('2024-01-11T11:45:00'),
    messages: [
      {
        id: '5-1',
        content: 'Why is my generator shutting down after running for only 10 minutes?',
        role: 'user',
        timestamp: new Date('2024-01-11T11:30:00')
      },
      {
        id: '5-2',
        content: 'A generator shutting down after 10 minutes usually indicates an overheating or fuel delivery issue. Common causes include:\n\n1. **Overheating**: Check if the generator is in a well-ventilated area\n2. **Low Oil Shutdown**: Many generators have low oil shutdown protection\n3. **Fuel Filter**: Clogged fuel filter restricting fuel flow\n4. **Air Filter**: Dirty air filter causing rich fuel mixture\n5. **Overload**: Running too many appliances causing automatic shutdown\n\nCheck the oil level first, then examine the air and fuel filters. Is the generator in an enclosed space?',
        role: 'assistant',
        timestamp: new Date('2024-01-11T11:31:00')
      }
    ]
  },
  {
    id: '10',
    title: 'Why is my generator shutting down...',
    createdAt: new Date('2024-01-11T11:30:00'),
    updatedAt: new Date('2024-01-11T11:45:00'),
    messages: [
      {
        id: '5-1',
        content: 'Why is my generator shutting down after running for only 10 minutes?',
        role: 'user',
        timestamp: new Date('2024-01-11T11:30:00')
      },
      {
        id: '5-2',
        content: 'A generator shutting down after 10 minutes usually indicates an overheating or fuel delivery issue. Common causes include:\n\n1. **Overheating**: Check if the generator is in a well-ventilated area\n2. **Low Oil Shutdown**: Many generators have low oil shutdown protection\n3. **Fuel Filter**: Clogged fuel filter restricting fuel flow\n4. **Air Filter**: Dirty air filter causing rich fuel mixture\n5. **Overload**: Running too many appliances causing automatic shutdown\n\nCheck the oil level first, then examine the air and fuel filters. Is the generator in an enclosed space?',
        role: 'assistant',
        timestamp: new Date('2024-01-11T11:31:00')
      }
    ]
  },
];

// Mock photos data organized by month
export const mockPhotos: Photo[] = [
  // June 2025
  {
    id: 'photo-1',
    url: '/images/generator1.jpg',
    filename: 'generator_red_portable.jpg',
    date: new Date('2025-06-15T10:30:00'),
    size: 2450000
  },
  {
    id: 'photo-2',
    url: '/images/generator2.jpg',
    filename: 'industrial_generator_orange.jpg',
    date: new Date('2025-06-14T14:20:00'),
    size: 3200000
  },
  {
    id: 'photo-3',
    url: '/images/generator3.jpg',
    filename: 'grey_industrial_generator.jpg',
    date: new Date('2025-06-13T09:15:00'),
    size: 2800000
  },
  {
    id: 'photo-4',
    url: '/images/generator4.jpg',
    filename: 'white_industrial_generator.jpg',
    date: new Date('2025-06-12T16:45:00'),
    size: 3100000
  },
  {
    id: 'photo-5',
    url: '/images/generator5.jpg',
    filename: 'orange_black_portable.jpg',
    date: new Date('2025-06-11T11:30:00'),
    size: 2750000
  },
  {
    id: 'photo-6',
    url: '/images/generator6.jpg',
    filename: 'white_industrial_generator_2.jpg',
    date: new Date('2025-06-10T13:20:00'),
    size: 2900000
  },
  // May 2025
  {
    id: 'photo-7',
    url: '/images/generator7.jpg',
    filename: 'teal_industrial_generator.jpg',
    date: new Date('2025-05-25T15:10:00'),
    size: 2600000
  },
  {
    id: 'photo-8',
    url: '/images/generator8.jpg',
    filename: 'yellow_industrial_machine.jpg',
    date: new Date('2025-05-24T12:00:00'),
    size: 3300000
  },
  {
    id: 'photo-9',
    url: '/images/generator9.jpg',
    filename: 'grey_industrial_generator_2.jpg',
    date: new Date('2025-05-23T14:30:00'),
    size: 2850000
  },
  {
    id: 'photo-10',
    url: '/images/generator10.jpg',
    filename: 'orange_black_portable_top.jpg',
    date: new Date('2025-05-22T10:15:00'),
    size: 2400000
  },
  {
    id: 'photo-11',
    url: '/images/generator11.jpg',
    filename: 'white_structure_partial.jpg',
    date: new Date('2025-05-21T16:45:00'),
    size: 2200000
  },
  {
    id: 'photo-12',
    url: '/images/generator12.jpg',
    filename: 'teal_structure_partial.jpg',
    date: new Date('2025-05-20T08:30:00'),
    size: 2100000
  }
];

// Mock documents data
export const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    title: 'Operational Fault Report',
    type: 'PDF',
    size: '3MB',
    date: new Date('2022-08-15T10:30:00'),
    url: '/documents/operational-fault-report.pdf'
  },
  {
    id: 'doc-2',
    title: 'Equipment Diagnostic File',
    type: 'PPT',
    size: '3MB',
    date: new Date('2022-08-16T14:20:00'),
    url: '/documents/equipment-diagnostic-file.ppt'
  },
  {
    id: 'doc-3',
    title: 'Machine Health Summary',
    type: 'DOC',
    size: '3MB',
    date: new Date('2022-08-15T09:15:00'),
    url: '/documents/machine-health-summary.doc'
  }
];

// Helper function to group photos by month
export const getPhotoGroups = (photos: Photo[]): PhotoGroup[] => {
  const groups = photos.reduce((acc, photo) => {
    const month = photo.date.toLocaleDateString('en-US', { month: 'long' });
    const year = photo.date.getFullYear();
    const key = `${month} ${year}`;
    
    if (!acc[key]) {
      acc[key] = {
        month,
        year,
        photos: []
      };
    }
    acc[key].photos.push(photo);
    return acc;
  }, {} as Record<string, PhotoGroup>);

  // Sort groups by date (newest first)
  return Object.values(groups).sort((a, b) => {
    const dateA = new Date(a.year, new Date(`${a.month} 1`).getMonth());
    const dateB = new Date(b.year, new Date(`${b.month} 1`).getMonth());
    return dateB.getTime() - dateA.getTime();
  });
};
