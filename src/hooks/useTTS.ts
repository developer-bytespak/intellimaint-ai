// // useTTS.ts - Using Browser's Web Speech API (more reliable)

// let isPlaying = false;
// let audioQueue: { text: string; resolve: () => void }[] = [];

// export async function speak(text: string): Promise<void> {
//   return new Promise((resolve) => {
//     const cleanText = text
//       .replace(/"/g, '')
//       .replace(/'/g, '')
//       .trim();

//     if (!cleanText) {
//       resolve();
//       return;
//     }

//     audioQueue.push({ text: cleanText, resolve });
    
//     if (!isPlaying) {
//       processQueue();
//     }
//   });
// }

// async function processQueue() {
//   if (audioQueue.length === 0) {
//     isPlaying = false;
//     console.log("✅ Queue empty");
//     return;
//   }

//   isPlaying = true;
//   const { text, resolve } = audioQueue.shift()!;

//   console.log(`🎯 Speaking: "${text}"`);

//   try {
//     await speakText(text);
//     resolve();
//   } catch (err) {
//     console.error("❌ Speech error:", err);
//     resolve(); // Continue anyway
//   }

//   processQueue();
// }

// function speakText(text: string): Promise<void> {
//   return new Promise((resolve) => {
//     // Check if browser supports speech synthesis
//     if (!('speechSynthesis' in window)) {
//       console.error("❌ Speech synthesis not supported");
//       resolve();
//       return;
//     }

//     const utterance = new SpeechSynthesisUtterance(text);
    
//     // Configure voice settings
//     utterance.rate = 1.0;     // Speed
//     utterance.pitch = 1.0;    // Pitch
//     utterance.volume = 1.0;   // Volume
    
//     // Try to use a female English voice
//     const voices = speechSynthesis.getVoices();
//     const englishVoice = voices.find(v => 
//       v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
//     ) || voices.find(v => v.lang.startsWith('en'));
    
//     if (englishVoice) {
//       utterance.voice = englishVoice;
//     }

//     utterance.onstart = () => {
//       console.log("▶️ Speaking...");
//     };

//     utterance.onend = () => {
//       console.log("✅ Speech finished");
//       resolve();
//     };

//     utterance.onerror = (err) => {
//       console.error("❌ Speech error:", err);
//       resolve();
//     };

//     window.speechSynthesis.speak(utterance);
//   });
// }

// export function stopAllAudio() {
//   audioQueue = [];
//   isPlaying = false;
  
//   if ('speechSynthesis' in window) {
//     window.speechSynthesis.cancel();
//   }
  
//   console.log("🛑 All audio stopped");
// }


// useTTS.ts - Using Browser's Web Speech API with queue completion callback

let isPlaying = false;
let audioQueue: { text: string; resolve: () => void }[] = [];
let onQueueEmptyCallback: (() => void) | null = null;
let queueEmptyTimeout: NodeJS.Timeout | null = null;

export async function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    const cleanText = text
      .replace(/"/g, '')
      .replace(/'/g, '')
      .trim();

    if (!cleanText) {
      resolve();
      return;
    }

    audioQueue.push({ text: cleanText, resolve });
    
    if (!isPlaying) {
      processQueue();
    }
  });
}

async function processQueue() {
  if (audioQueue.length === 0) {
    isPlaying = false;
    console.log("✅ Queue empty");
    
    // 🔓 Call the callback when queue is fully empty (with small delay to ensure all audio finished)
    if (onQueueEmptyCallback) {
      // Clear any existing timeout
      if (queueEmptyTimeout) {
        clearTimeout(queueEmptyTimeout);
      }
      
      // Set a small delay to ensure the last utterance fully finished
      queueEmptyTimeout = setTimeout(() => {
        if (onQueueEmptyCallback) {
          console.log("🔓 Calling queue empty callback");
          onQueueEmptyCallback();
          onQueueEmptyCallback = null; // Reset after calling
        }
      }, 100); // Small delay to ensure audio playback is complete
    }
    return;
  }

  isPlaying = true;
  const { text, resolve } = audioQueue.shift()!;

  console.log(`🎯 Speaking: "${text}" (${audioQueue.length} remaining in queue)`);

  try {
    await speakText(text);
    resolve();
  } catch (err) {
    console.error("❌ Speech error:", err);
    resolve(); // Continue anyway
  }

  processQueue();
}

function speakText(text: string): Promise<void> {
  return new Promise((resolve) => {
    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      console.error("❌ Speech synthesis not supported");
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 1.0;     // Speed
    utterance.pitch = 1.0;    // Pitch
    utterance.volume = 1.0;   // Volume
    
    // Try to use a female English voice
    const voices = speechSynthesis.getVoices();
    const englishVoice = voices.find(v => 
      v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      console.log("▶️ Speaking...");
    };

    utterance.onend = () => {
      console.log("✅ Speech finished");
      resolve();
    };

    utterance.onerror = (err) => {
      console.error("❌ Speech error:", err);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

export function stopAllAudio() {
  audioQueue = [];
  isPlaying = false;
  onQueueEmptyCallback = null; // Clear callback too
  
  // Clear timeout if exists
  if (queueEmptyTimeout) {
    clearTimeout(queueEmptyTimeout);
    queueEmptyTimeout = null;
  }
  
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  
  console.log("🛑 All audio stopped");
}

// ✅ NEW: Set a callback to be called when queue is fully empty
export function setOnQueueEmpty(callback: () => void) {
  console.log("📌 Queue empty callback registered");
  onQueueEmptyCallback = callback;
}

// ✅ NEW: Check if TTS is currently playing
export function isTTSPlaying(): boolean {
  return isPlaying || audioQueue.length > 0;
}