// useTTS.ts - Using Browser's Web Speech API (more reliable)

let isPlaying = false;
let audioQueue: { text: string; resolve: () => void }[] = [];

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
    return;
  }

  isPlaying = true;
  const { text, resolve } = audioQueue.shift()!;

  console.log(`🎯 Speaking: "${text}"`);

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
  
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  
  console.log("🛑 All audio stopped");
}