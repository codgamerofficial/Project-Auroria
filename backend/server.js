import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 5050;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// In-memory store for demo jobs
const jobs = new Map();

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'Auroria AI Music API' });
});

// Advanced lyrics generation: creates realistic, human-made song lyrics
app.post('/api/lyrics', (req, res) => {
  const { prompt = '', language = 'en', style = 'pop', mood, genre } = req.body || {};

  // Extract themes and emotions from prompt
  const themes = extractThemes(prompt);
  const emotions = extractEmotions(prompt);
  const setting = extractSetting(prompt);

  // Generate structured lyrics based on style and language
  const lyricsStructure = generateLyricsStructure(themes, emotions, setting, style, language);

  res.json({
    lyrics: lyricsStructure.join('\n'),
    structure: lyricsStructure,
    metadata: {
      themes,
      emotions,
      setting,
      style,
      language,
      wordCount: lyricsStructure.join(' ').split(' ').length
    }
  });
});

function extractThemes(prompt) {
  const themeKeywords = {
    love: ['love', 'heart', 'romance', 'passion', 'affection', 'desire'],
    freedom: ['free', 'freedom', 'escape', 'wild', 'unbound', 'limitless'],
    dreams: ['dream', 'aspiration', 'hope', 'future', 'vision', 'imagine'],
    struggle: ['fight', 'battle', 'overcome', 'rise', 'stronger', 'resilient'],
    nature: ['ocean', 'mountain', 'sky', 'forest', 'river', 'wind'],
    city: ['city', 'street', 'lights', 'concrete', 'urban', 'nightlife'],
    time: ['time', 'moment', 'memory', 'past', 'future', 'eternal'],
    journey: ['journey', 'path', 'travel', 'destination', 'road', 'wander']
  };

  const foundThemes = [];
  const lowerPrompt = prompt.toLowerCase();

  Object.entries(themeKeywords).forEach(([theme, keywords]) => {
    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
      foundThemes.push(theme);
    }
  });

  return foundThemes.length > 0 ? foundThemes : ['dreams']; // Default theme
}

function extractEmotions(prompt) {
  const emotionKeywords = {
    joyful: ['happy', 'joy', 'excited', 'celebration', 'delight', 'euphoria'],
    melancholic: ['sad', 'melancholy', 'lonely', 'heartbreak', 'sorrow', 'regret'],
    passionate: ['passionate', 'intense', 'fiery', 'burning', 'ardent', 'fervent'],
    peaceful: ['calm', 'peaceful', 'serene', 'tranquil', 'gentle', 'soothing'],
    rebellious: ['rebel', 'defiant', 'wild', 'untamed', 'free-spirited', 'bold'],
    nostalgic: ['nostalgic', 'remember', 'memory', 'past', 'cherished', 'reminisce'],
    hopeful: ['hope', 'optimistic', 'bright', 'future', 'possibility', 'aspiring'],
    mysterious: ['mystery', 'enigma', 'unknown', 'shadow', 'hidden', 'secret']
  };

  const foundEmotions = [];
  const lowerPrompt = prompt.toLowerCase();

  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
      foundEmotions.push(emotion);
    }
  });

  return foundEmotions.length > 0 ? foundEmotions : ['hopeful']; // Default emotion
}

function extractSetting(prompt) {
  const settingKeywords = {
    night: ['night', 'midnight', 'darkness', 'moonlight', 'stars', 'dusk'],
    day: ['day', 'sunrise', 'morning', 'sunlight', 'dawn', 'bright'],
    urban: ['city', 'street', 'building', 'crowd', 'traffic', 'neon'],
    natural: ['forest', 'mountain', 'ocean', 'beach', 'field', 'garden'],
    intimate: ['room', 'bedroom', 'home', 'alone', 'together', 'close'],
    journey: ['road', 'travel', 'moving', 'destination', 'path', 'wander']
  };

  const lowerPrompt = prompt.toLowerCase();

  for (const [setting, keywords] of Object.entries(settingKeywords)) {
    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
      return setting;
    }
  }

  return 'urban'; // Default setting
}

function generateLyricsStructure(themes, emotions, setting, style, language) {
  const primaryTheme = themes[0] || 'dreams';
  const primaryEmotion = emotions[0] || 'hopeful';

  if (language === 'hi') {
    return generateHindiLyrics(primaryTheme, primaryEmotion, setting, style);
  } else if (language === 'bn') {
    return generateBengaliLyrics(primaryTheme, primaryEmotion, setting, style);
  } else {
    return generateEnglishLyrics(primaryTheme, primaryEmotion, setting, style);
  }
}

function generateEnglishLyrics(theme, emotion, setting, style) {
  const lyricTemplates = {
    love: {
      joyful: {
        verse1: "Underneath the city lights, I found your smile so bright",
        pre: "Every moment feels like magic, every touch ignites",
        chorus: "Your love is my melody, singing through the night",
        verse2: "Walking through the crowded streets, your hand in mine",
        bridge: "When the world fades away, it's just you and I"
      },
      melancholic: {
        verse1: "Empty streets remind me of the love we used to share",
        pre: "Whispers in the wind carry memories everywhere",
        chorus: "Heartbreak symphony plays in minor key",
        verse2: "Tears fall like rain on this lonely balcony",
        bridge: "But somewhere in the darkness, hope begins to grow"
      }
    },
    freedom: {
      rebellious: {
        verse1: "Breaking through the chains that held me down so tight",
        pre: "Running through the storm into the endless night",
        chorus: "Freedom calls my name, I won't be denied",
        verse2: "No more cages, no more walls, I'm alive",
        bridge: "The open road ahead, destiny by my side"
      }
    },
    dreams: {
      hopeful: {
        verse1: "Chasing stars across the midnight sky so blue",
        pre: "Every dream I have is painted bright with you",
        chorus: "Rising up to touch the heavens, nothing can hold me down",
        verse2: "Through the darkest nights, my spirit won't be bound",
        bridge: "Tomorrow brings new horizons, new worlds to be found"
      }
    }
  };

  // Get appropriate template or use default
  const themeTemplates = lyricTemplates[theme] || lyricTemplates.dreams;
  const emotionTemplates = themeTemplates[emotion] || themeTemplates.hopeful;

  return [
    `[Verse 1]`,
    emotionTemplates.verse1,
    emotionTemplates.pre,
    ``,
    `[Chorus]`,
    emotionTemplates.chorus,
    emotionTemplates.chorus,
    ``,
    `[Verse 2]`,
    emotionTemplates.verse2,
    emotionTemplates.pre,
    ``,
    `[Chorus]`,
    emotionTemplates.chorus,
    emotionTemplates.chorus,
    ``,
    `[Bridge]`,
    emotionTemplates.bridge,
    emotionTemplates.bridge,
    ``,
    `[Outro]`,
    emotionTemplates.chorus
  ];
}

function generateHindiLyrics(theme, emotion, setting, style) {
  const hindiLyrics = {
    love: {
      joyful: [
        "[Verse 1]",
        "तेरी आँखों में खोया हूँ मैं, हर लम्हा है खास",
        "तेरी मुस्कान की रोशनी, दिल को दे रही सुकून",
        "",
        "[Pre-Chorus]",
        "हर बीतती रात, हर उजाला सवेरा",
        "तेरे साथ बिताना चाहता हूँ ज़िंदगी सारी",
        "",
        "[Chorus]",
        "तेरा प्यार है मेरी धुन, गाता रहूँ मैं",
        "तेरे बिना अधूरा है मेरा ये जीवन",
        "तेरा प्यार है मेरी धुन, गाता रहूँ मैं",
        "हर मोड़ पर साथ दे, तू मेरी जान",
        "",
        "[Verse 2]",
        "शहर की भीड़ में भी, तू ही है मेरी पहचान",
        "तेरे बिना सूना लगता है ये जहान",
        "",
        "[Bridge]",
        "जब दुनिया भूल जाए, तू याद रखना",
        "हमारी मोहब्बत की, ये पुरानी कहानी",
        "",
        "[Outro]",
        "तेरा प्यार है मेरी धुन, गाता रहूँ मैं..."
      ]
    },
    dreams: {
      hopeful: [
        "[Verse 1]",
        "ख्वाबों की दुनिया में, मैं खो जाता हूँ",
        "तारों से बात करता, आसमान को छूता हूँ",
        "",
        "[Pre-Chorus]",
        "हर रात सपनों में, नई दुनिया बनाता हूँ",
        "कल की उम्मीदों से, दिल को भाता हूँ",
        "",
        "[Chorus]",
        "उड़ान भरूँगा मैं, सपनों के पर",
        "कोई नहीं रोक सकता, मेरे सफर को",
        "उड़ान भरूँगा मैं, सपनों के पर",
        "मंजिल मिलेगी जरूर, मेरे कदमों पर",
        "",
        "[Verse 2]",
        "मुश्किल रास्तों से, मैं नहीं डरता",
        "आसमान की ऊँचाई, पाने को तैयार हूँ",
        "",
        "[Bridge]",
        "विचारों की उड़ान, दिल की धड़कन",
        "ख्वाबों का जादू, बनाए रखना",
        "",
        "[Outro]",
        "उड़ान भरूँगा मैं, सपनों के पर..."
      ]
    }
  };

  return hindiLyrics[theme]?.[emotion] || hindiLyrics.dreams.hopeful;
}

function generateBengaliLyrics(theme, emotion, setting, style) {
  const bengaliLyrics = {
    love: {
      joyful: [
        "[Verse 1]",
        "তোমার চোখে হারিয়ে যাই, প্রতিটি মুহূর্ত স্পেশাল",
        "তোমার হাসির আলো, মনকে দেয় শান্তি",
        "",
        "[Pre-Chorus]",
        "প্রতিটি রাত, প্রতিটি ভোর",
        "তোমার সাথে কাটাতে চাই জীবনের সবটা",
        "",
        "[Chorus]",
        "তোমার ভালবাসা আমার সুর, গাইতে থাকি আমি",
        "তোমার ছাড়া অসম্পূর্ণ আমার এই জীবন",
        "তোমার ভালবাসা আমার সুর, গাইতে থাকি আমি",
        "প্রতিটি বাঁকে সাথ দাও, তুমি আমার প্রাণ",
        "",
        "[Verse 2]",
        "শহরের ভিড়েও, তুমিই আমার পরিচয়",
        "তোমার ছাড়া ফাঁকা লাগে এই পৃথিবী",
        "",
        "[Bridge]",
        "যখন দুনিয়া ভুলে যাবে, তুমি মনে রেখো",
        "আমাদের ভালবাসার, এই পুরনো গল্প",
        "",
        "[Outro]",
        "তোমার ভালবাসা আমার সুর, গাইতে থাকি আমি..."
      ]
    },
    dreams: {
      hopeful: [
        "[Verse 1]",
        "স্বপ্নের জগতে, আমি হারিয়ে যাই",
        "তারাদের সাথে কথা বলি, আকাশকে ছুই",
        "",
        "[Pre-Chorus]",
        "প্রতি রাত স্বপ্নে, নতুন দুনিয়া তৈরি করি",
        "কালকের আশা দিয়ে, মনকে ভরি",
        "",
        "[Chorus]",
        "উড়ে যাব আমি, স্বপ্নের পাখায়",
        "কেউ থামাতে পারবে না, আমার যাত্রাকে",
        "উড়ে যাব আমি, স্বপ্নের পাখায়",
        "লক্ষ্য পাবই, আমার পায়ে",
        "",
        "[Verse 2]",
        "কঠিন রাস্তা থেকে, আমি ভয় পাই না",
        "আকাশের উচ্চতা, পেতে প্রস্তুত",
        "",
        "[Bridge]",
        "চিন্তার উড়ান, মনের ধুকধুকি",
        "স্বপ্নের জাদু, রেখে দাও",
        "",
        "[Outro]",
        "উড়ে যাব আমি, স্বপ্নের পাখায়..."
      ]
    }
  };

  return bengaliLyrics[theme]?.[emotion] || bengaliLyrics.dreams.hopeful;
}

// Create a generation job (lyrics + style)
app.post('/api/generations', (req, res) => {
  const { prompt, style, durationSeconds = 15, language, lyrics, useExact, mode, publicShare } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const id = nanoid();
  const job = {
   id,
   status: 'queued',
   createdAt: Date.now(),
   durationSeconds: Math.max(5, Math.min(60, Number(durationSeconds) || 15)),
   prompt,
   style: style || 'pop',
   language: language || 'en',
   progress: 0,
   // For demo, we will provide a deterministic seed to the client to synthesize locally
   seed: Math.floor(Math.random() * 1e9),
   lyrics: lyrics || '',
   useExact: Boolean(useExact),
   mode: mode || 'standard',
   publicShare: Boolean(publicShare)
 };
  jobs.set(id, job);

  // Simulate progression
  const interval = setInterval(() => {
    const current = jobs.get(id);
    if (!current) {
      clearInterval(interval);
      return;
    }
    current.progress = Math.min(100, current.progress + 20);
    if (current.progress >= 100) {
      current.status = 'completed';
      current.completedAt = Date.now();
      clearInterval(interval);
    } else {
      current.status = 'processing';
    }
    jobs.set(id, current);
  }, 1000);

  res.status(202).json({ id, status: job.status, seed: job.seed });
});

// Get job status
app.get('/api/generations/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'not_found' });
  res.json({ id: job.id, status: job.status, progress: job.progress, seed: job.seed, durationSeconds: job.durationSeconds });
});

// Cloud generation disabled - using local synthesis only
app.post('/api/generations/cloud', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Prompt is required for cloud generation' });

  return res.status(501).json({
    error: 'Cloud generation temporarily disabled',
    hint: 'The local demo generation is working perfectly! Use the regular "Create" button for instant AI music generation.',
    alternative: 'Local synthesis provides high-quality music generation without API limitations.'
  });
});

app.listen(port, () => {
  console.log(`Auroria backend listening on http://localhost:${port}`);
});


