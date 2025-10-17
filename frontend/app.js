const form = document.getElementById('gen-form');
const progressSection = document.getElementById('progress-section');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const audioEl = document.getElementById('audio');
const player = document.getElementById('player');
const downloadBtn = document.getElementById('download-wav');
const exportMp3Btn = document.getElementById('export-mp3');
const exportFlacBtn = document.getElementById('export-flac');
const exportStemsBtn = document.getElementById('export-stems');
const exportM3uBtn = document.getElementById('export-m3u');
const exportZipBtn = document.getElementById('export-zip');
const cloudBtn = document.getElementById('btn-cloud');
const createBtn = document.getElementById('create-btn');
const errorEl = document.getElementById('error');
const modeSelect = document.getElementById('mode');
const autoGenerateCheckbox = document.getElementById('auto-generate');
const publicShareCheckbox = document.getElementById('public-share');
const autoGenerateLyricsCheckbox = document.getElementById('auto-generate-lyrics');
const generateLyricsBtn = document.getElementById('generate-lyrics-btn');
const continueBtn = document.getElementById('btn-continue');
const remixBtn = document.getElementById('btn-remix');
const shareBtn = document.getElementById('btn-share');
const tabs = document.querySelectorAll('.nav-link');
const tabCreate = document.getElementById('tab-create');
const tabLibrary = document.getElementById('tab-library');
const tabPortfolio = document.getElementById('tab-portfolio');
const tabCollaborate = document.getElementById('tab-collaborate');
const libraryGrid = document.getElementById('library-grid');
const libraryEmpty = document.getElementById('library-empty');

// Collaboration elements
const roomCodeInput = document.getElementById('room-code');
const joinRoomBtn = document.getElementById('join-room');
const createRoomBtn = document.getElementById('create-room');
const collaborationStatus = document.getElementById('collaboration-status');
const statusIndicator = collaborationStatus.querySelector('.status-indicator');
const participantsList = document.getElementById('participants-list');
const sharedTracks = document.getElementById('shared-tracks');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendMessageBtn = document.getElementById('send-message');

// User account elements
const loginBtn = document.getElementById('login-btn');
const userProfile = document.getElementById('user-profile');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');

const API_BASE = `${location.protocol}//${location.hostname}:5050`;

// Initialize waveform visualization
function initWaveform() {
  waveformCanvas = document.getElementById('waveform');
  if (waveformCanvas) {
    waveformCtx = waveformCanvas.getContext('2d');
    waveformCanvas.addEventListener('click', handleWaveformClick);
  }
}

// Initialize lyrics system
function initLyrics() {
  lyricsDisplay = document.getElementById('lyrics-display');
  lyricsContent = document.getElementById('lyrics-content');
  toggleLyricsSyncBtn = document.getElementById('toggle-lyrics-sync');

  if (toggleLyricsSyncBtn) {
    toggleLyricsSyncBtn.addEventListener('click', toggleLyricsSync);
  }
}

// Handle waveform click for seeking
function handleWaveformClick(event) {
  if (!audioEl.duration) return;

  const rect = waveformCanvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percentage = clickX / rect.width;
  const seekTime = percentage * audioEl.duration;

  audioEl.currentTime = seekTime;
}

// Draw static waveform from audio buffer
function drawWaveform(buffer) {
  if (!waveformCtx || !buffer) return;

  const canvas = waveformCanvas;
  const ctx = waveformCtx;
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Get audio data
  const data = buffer.getChannelData(0);
  const step = Math.ceil(data.length / width);
  const amp = height / 2;

  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let i = 0; i < width; i++) {
    let min = 1.0;
    let max = -1.0;

    for (let j = 0; j < step; j++) {
      const datum = data[(i * step) + j];
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }

    ctx.moveTo(i, (1 + min) * amp);
    ctx.lineTo(i, (1 + max) * amp);
  }

  ctx.stroke();

  // Add glow effect
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 5;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// Update waveform progress indicator
function updateWaveformProgress() {
  if (!waveformCtx || !audioEl.duration) return;

  const canvas = waveformCanvas;
  const ctx = waveformCtx;
  const width = canvas.width;
  const height = canvas.height;
  const progress = audioEl.currentTime / audioEl.duration;

  // Draw progress line
  ctx.strokeStyle = '#ff00ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(progress * width, 0);
  ctx.lineTo(progress * width, height);
  ctx.stroke();
}

let currentBuffer = null;
let currentSeed = null;
let currentMeta = null;
let waveformCanvas = null;
let waveformCtx = null;
let audioContext = null;
let analyser = null;
let animationId = null;

// Collaboration state
let currentRoom = null;
let isHost = false;
let participants = [{ id: 'you', name: 'You', role: 'Host', avatar: '👤' }];
let sharedPlaylist = [];

// User account state
let currentUser = null;
let userTracks = [];

// Lyrics timing state
let lyricsData = [];
let currentLyricIndex = -1;
let lyricsSyncEnabled = false;
let lyricsDisplay = null;
let lyricsContent = null;
let toggleLyricsSyncBtn = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initWaveform();
  initLyrics();
  initUserSystem();
  loadUserSession();
});

// Tab navigation
tabs.forEach(t => t.addEventListener('click', (e) => {
  e.preventDefault();
  tabs.forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  const which = t.dataset.tab;
  tabCreate.hidden = which !== 'create';
  tabLibrary.hidden = which !== 'library';
  tabCollaborate.hidden = which !== 'collaborate';
  tabPortfolio.hidden = which !== 'portfolio';
  if (which === 'library') renderLibrary();
  if (which === 'collaborate') renderCollaboration();
  if (which === 'portfolio') renderPortfolio();
}));

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const prompt = document.getElementById('prompt').value.trim();
  const style = document.getElementById('style').value;
  const duration = Number(document.getElementById('duration').value || '15');
  const bpm = Number(document.getElementById('bpm').value || '120');
  const seedInput = document.getElementById('seed').value;
  const seedOverride = seedInput ? Number(seedInput) : undefined;
  const vocals = document.getElementById('vocals').value;
  const preset = document.getElementById('preset').value;
  const language = document.getElementById('language').value;
  const mode = document.getElementById('mode').value;
  let lyrics = document.getElementById('lyrics').value.trim();
  const useExact = document.getElementById('use-exact').checked;
  const autoGenerate = document.getElementById('auto-generate').checked;
  const publicShare = document.getElementById('public-share').checked;

  // Handle instrumental mode
  let finalVocals = vocals;
  if (mode === 'instrumental') {
    finalVocals = 'none';
  }

  // Auto-generate lyrics if enabled and no lyrics provided
  if (autoGenerateLyricsCheckbox.checked && !lyrics && mode !== 'instrumental') {
    try {
      setProgress(10, '🎵 Generating lyrics...');
      const lyricsRes = await fetch(`${API_BASE}/api/lyrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, language, style, mood: prompt.toLowerCase() })
      });
      if (lyricsRes.ok) {
        const { lyrics: generatedLyrics, metadata } = await lyricsRes.json();
        lyrics = generatedLyrics;
        document.getElementById('lyrics').value = lyrics;
        showSuccess(`Generated ${metadata.wordCount} words of lyrics! 📝`);
      }
    } catch (error) {
      console.log('Lyrics auto-generation failed, continuing without lyrics');
      showError('Lyrics generation failed, but music will still be created.');
    }
  }

  if (!prompt) {
    showError('Please enter a prompt to generate your song.');
    return;
  }
  if (prompt.length < 3) {
    showError('Prompt must be at least 3 characters long.');
    return;
  }

  errorEl.style.display = 'none';
  errorEl.textContent = '';
  player.hidden = true;
  progressSection.hidden = false;
  setProgress(0, 'Initializing AI generation…');
  createBtn.disabled = true;
  createBtn.textContent = '🚀 Creating…';

  const createRes = await fetch(`${API_BASE}/api/generations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, style, durationSeconds: duration, bpm, seed: seedOverride, vocals: finalVocals, preset, language, lyrics, useExact, mode, publicShare })
  });
  if (!createRes.ok) {
    const errorMsg = `Failed to start generation (${createRes.status}). Please try again.`;
    showError(errorMsg);
    setProgress(0, '❌ Failed to start generation.');
    createBtn.disabled = false;
    createBtn.textContent = 'Create';
    return;
  }
  const { id, seed } = await createRes.json();
  currentSeed = seedOverride || seed;
  currentMeta = { id, prompt, style, duration, preset, language, bpm, lyrics, useExact, vocals, mode: document.getElementById('mode').value };
  await pollJob(id, duration);
  createBtn.disabled = false;
  createBtn.textContent = 'Create';
});

function setProgress(p, label){
  progressBar.style.width = `${p}%`;
  progressText.innerHTML = `<span class="progress-icon">${getProgressIcon(p)}</span> ${label}`;
}

function getProgressIcon(progress) {
  if (progress === 0) return '⏳';
  if (progress < 25) return '🔄';
  if (progress < 50) return '⚡';
  if (progress < 75) return '🎵';
  if (progress < 100) return '🎼';
  return '✅';
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.style.display = 'block';
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorEl.style.display = 'none';
  }, 5000);
}

async function pollJob(id, duration){
  return new Promise((resolve) => {
    const iv = setInterval(async () => {
      const res = await fetch(`${API_BASE}/api/generations/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      const statusMessage = data.status === 'completed' ? '🎉 Finalizing your masterpiece…' : `${data.status}…`;
      setProgress(data.progress, statusMessage);
      if (data.status === 'completed'){
        clearInterval(iv);
        setProgress(100, '✅ Generation complete! Preparing audio…');
        // Local synth for demo using seed + duration
        synthesizeDemo(currentSeed, duration).then((buf) => {
          currentBuffer = buf;
          const blob = bufferToWavBlob(buf, 44100);
          const url = URL.createObjectURL(blob);
          audioEl.src = url;
          player.hidden = false;
          progressSection.hidden = true;
          setProgress(0, ''); // Reset progress

          // Draw waveform
          drawWaveform(buf);

          // Add time update listener for progress indicator
          audioEl.addEventListener('timeupdate', updateWaveformProgress);

          generateCoverArt(currentMeta).then((cover) => {
            persistToLibrary({
              ...currentMeta,
              createdAt: Date.now(),
              audioUrl: url,
              cover: cover.dataUrl,
              coverSeed: cover.seed
            });

            // Display lyrics if available
            if (currentMeta.lyrics && currentMeta.lyrics.trim()) {
              displayLyrics(currentMeta.lyrics);
            }

            showSuccess('Song generated successfully! 🎵');
          });
          resolve();
        });
      }
    }, 1000);
  });
}

function showSuccess(message) {
  // Create a temporary success message
  const successEl = document.createElement('div');
  successEl.className = 'success-msg';
  successEl.textContent = message;
  successEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--success);
    color: #000;
    padding: 12px 20px;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
    z-index: 1000;
    font-weight: 600;
    animation: slideIn 0.3s ease-out;
  `;
  document.body.appendChild(successEl);
  setTimeout(() => {
    successEl.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => successEl.remove(), 300);
  }, 3000);
}

function persistToLibrary(entry){
  const key = 'auroria-library-v1';
  const arr = JSON.parse(localStorage.getItem(key) || '[]');
  arr.unshift(entry);
  localStorage.setItem(key, JSON.stringify(arr.slice(0, 50)));
}

function loadLibrary(){
  const key = 'auroria-library-v1';
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function renderLibrary(){
  const items = loadLibrary();
  libraryGrid.innerHTML = '';
  libraryEmpty.style.display = items.length ? 'none' : 'block';
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      ${item.cover ? `<img class="card-cover" src="${item.cover}" alt="cover" />` : ''}
      <div class="card-title">${escapeHtml(item.prompt).slice(0, 80)}</div>
      <div class="card-meta">${new Date(item.createdAt).toLocaleString()} · ${item.style.toUpperCase()} · ${item.duration}s · ${item.language ? item.language.toUpperCase() : 'EN'}</div>
      ${item.lyrics ? `<div class="card-meta">${escapeHtml(item.lyrics).slice(0, 140)}…</div>` : ''}
      <audio controls src="${item.audioUrl}"></audio>
      <div class="card-actions">
        <a class="btn btn-secondary" href="${item.audioUrl}" download="auroria-${item.id}.wav">Download</a>
        <button class="btn btn-secondary btn-recover" data-id="${item.id}">Regenerate cover</button>
      </div>
    `;
    libraryGrid.appendChild(el);
  });
  libraryGrid.onclick = async (e) => {
    const btn = e.target.closest('.btn-recover');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    await regenerateCover(id);
    renderLibrary();
  };
}

function escapeHtml(s){
  return s.replace(/[&<>"]+/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

// Simple seeded PRNG
function mulberry32(a){
  return function(){
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Very simple demo synthesizer: layered oscillators + envelopes + drums
async function synthesizeDemo(seed, durationSeconds){
  const ctx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, 44100 * durationSeconds, 44100);
  const rand = mulberry32(seed);

  const master = ctx.createGain();
  master.gain.value = 0.9;

  // Simple reverb (convolution with generated impulse)
  const convolver = ctx.createConvolver();
  convolver.buffer = buildImpulseResponse(ctx, 1.6, 0.3);
  const reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.25;
  master.connect(convolver);
  convolver.connect(reverbGain);
  reverbGain.connect(ctx.destination);
  master.connect(ctx.destination);

  // Create a basic chord progression tuned by language preset
  const lang = (currentMeta && currentMeta.language) || 'en';
  const scales = lang === 'hi' || lang === 'bn'
    ? [ [0,2,4,7,9], [0,3,5,7,10] ] // pentatonic-ish for a more modal feel
    : [ [0,2,4,5,7,9,11], [0,2,3,5,7,8,10] ];
  const baseKey = Math.floor(rand()*12) + 40; // MIDI note
  const scale = scales[Math.floor(rand()*scales.length)];

  function midiToFreq(m){ return 440 * Math.pow(2, (m-69)/12); }

  // Pads
  for (let bar=0; bar<durationSeconds; bar+=4){
    const root = baseKey + scale[Math.floor(rand()*scale.length)];
    const third = root + 4; // approximate
    const fifth = root + 7;
    [root, third, fifth].forEach((note, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i===0 ? 'sawtooth' : (i===1 ? 'triangle' : 'sine');
      osc.frequency.setValueAtTime(midiToFreq(note), bar);
      gain.gain.setValueAtTime(0, bar);
      gain.gain.linearRampToValueAtTime(0.15, bar+0.2);
      gain.gain.linearRampToValueAtTime(0.1, bar+3.5);
      gain.gain.linearRampToValueAtTime(0.0, bar+4);
      osc.connect(gain).connect(master);
      osc.start(bar);
      osc.stop(bar+4);
    });
  }

  // Bass
  for (let t=0; t<durationSeconds; t+=0.5){
    const note = baseKey - 12 + scale[Math.floor(rand()*scale.length)];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(midiToFreq(note), t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t+0.03);
    gain.gain.linearRampToValueAtTime(0.0, t+0.45);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t+0.5);
  }

  // Drums (preset-driven)
  function noiseBuffer(){
    const buffer = ctx.createBuffer(1, 44100 * 1, 44100);
    const data = buffer.getChannelData(0);
    for (let i=0;i<data.length;i++) data[i] = (rand()*2-1) * Math.pow(1-i/data.length, 3);
    return buffer;
  }
  // Tempo selection based on preset
  const preset = (currentMeta && currentMeta.preset) || 'default';
  const bpm = (currentMeta && currentMeta.bpm) || 120;
  const tempoRanges = {
    cinematic: [70, 100],
    dance: [120, 132],
    trap: [130, 150],
    lofi: [70, 90],
    rock: [100, 140],
    default: [100, 125]
  };
  const [minB, maxB] = tempoRanges[preset] || tempoRanges.default;
  const effectiveBpm = Math.max(minB, Math.min(maxB, bpm));
  const beat = 60 / effectiveBpm;        // seconds per beat
  const step = beat / 2;                 // 8th notes grid

  for (let t=0; t<durationSeconds; t+=step){
    const stepIndex = Math.round(t / step);
    const beatIndex = Math.round(t / beat);
    // Kick patterns
    const kick = (
      preset === 'dance' ? (beatIndex % 1 === 0) :
      preset === 'trap' ? (beatIndex % 4 === 0 || stepIndex % 8 === 6) :
      preset === 'rock' ? (beatIndex % 4 === 0 || beatIndex % 4 === 2) :
      preset === 'lofi' ? (beatIndex % 2 === 0) :
      (beatIndex % 2 === 0)
    );
    if (kick){
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(40, t+0.18);
      gain.gain.setValueAtTime(0.85, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t+0.28);
      osc.connect(gain).connect(master);
      osc.start(t);
      osc.stop(t+0.31);
    }
    // Snare/Clap patterns
    const snare = (
      preset === 'dance' ? (beatIndex % 2 === 1) :
      preset === 'trap' ? (beatIndex % 4 === 2 || stepIndex % 8 === 7) :
      preset === 'rock' ? (beatIndex % 2 === 1) :
      preset === 'lofi' ? (beatIndex % 4 === 2) :
      (beatIndex % 2 === 1)
    );
    if (snare){
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer();
      const gain = ctx.createGain();
      const color = ctx.createBiquadFilter();
      color.type = 'highpass';
      color.frequency.value = 1800;
      gain.gain.setValueAtTime(0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t+0.18);
      src.connect(color).connect(gain).connect(master);
      src.start(t);
      src.stop(t+0.21);
    }
    // Hats (16th)
    const hats = (
      preset === 'trap' ? (stepIndex % 1 === 0) :
      preset === 'dance' ? (stepIndex % 2 === 1) :
      preset === 'rock' ? (stepIndex % 2 === 1) :
      preset === 'lofi' ? (stepIndex % 2 === 1 && rand() > 0.15) :
      (stepIndex % 2 === 1)
    );
    if (hats){
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer();
      const band = ctx.createBiquadFilter();
      band.type = 'highpass';
      band.frequency.value = 6000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t+0.045);
      src.connect(band).connect(gain).connect(master);
      src.start(t);
      src.stop(t+0.051);
    }
  }

  // Pseudo-vocals: formant-like synth reading syllables along beats
  if (currentMeta && currentMeta.vocals !== 'none' && (currentMeta.lyrics || '').length){
    const syllables = tokenizeSyllables(currentMeta.lyrics);
    let sIdx = 0;
    for (let t=0; t<durationSeconds && sIdx < syllables.length; t+=beat){
      const syl = syllables[sIdx++];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const formant = ctx.createBiquadFilter();
      formant.type = 'bandpass';
      formant.frequency.value = 800 + (syl.charCodeAt(0) % 400);
      osc.type = 'triangle';
      const note = baseKey + 12 + scale[Math.floor(rand()*scale.length)];
      osc.frequency.setValueAtTime(midiToFreq(note), t);
      gain.gain.setValueAtTime(0.0, t);
      gain.gain.linearRampToValueAtTime(0.12, t+0.05);
      gain.gain.linearRampToValueAtTime(0.0, t+Math.min(beat*0.9, 0.4));
      osc.connect(formant).connect(gain).connect(master);
      osc.start(t);
      osc.stop(t+Math.min(beat, 0.5));
    }
  }

  return ctx.startRendering();
}

function buildImpulseResponse(ctx, duration, decay){
  const rate = ctx.sampleRate;
  const length = rate * duration;
  const impulse = ctx.createBuffer(2, length, rate);
  for (let c=0;c<2;c++){
    const ch = impulse.getChannelData(c);
    for (let i=0;i<length;i++){
      ch[i] = (Math.random()*2-1) * Math.pow(1 - i/length, decay*2);
    }
  }
  return impulse;
}

async function generateCoverArt(meta, providedSeed){
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  const baseSeed = hashString(`${meta.prompt}|${meta.style}|${meta.duration}`);
  const seed = providedSeed != null ? providedSeed : baseSeed;
  const rand = mulberry32(seed);

  // Gradient background
  const g = ctx.createLinearGradient(0, 0, size, size);
  const [c1, c2] = pickPalette(meta.preset || meta.style || 'default', rand);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0,0,size,size);

  // Geometric shapes
  ctx.globalAlpha = 0.2;
  for (let i=0;i<8;i++){
    ctx.fillStyle = hsl((rand()*360), 70, 60);
    const x = rand()*size, y = rand()*size;
    const r = rand()*120+20;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Noise overlay
  const noise = ctx.createImageData(size, size);
  for (let i=0;i<noise.data.length;i+=4){
    const v = (rand()*30)|0; // subtle
    noise.data[i]=v; noise.data[i+1]=v; noise.data[i+2]=v; noise.data[i+3]=30;
  }
  ctx.putImageData(noise, 0, 0);

  // Title text (first 2-3 words of prompt)
  const title = (meta.prompt||'Auroria Track').split(/\s+/).slice(0,3).join(' ');
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, size-110, size, 110);
  ctx.fillStyle = '#e8ecf1';
  ctx.font = '700 36px Inter, system-ui';
  ctx.fillText(title, 24, size-64);
  ctx.font = '500 18px Inter, system-ui';
  ctx.fillText(`${meta.style.toUpperCase()} · ${meta.duration}s`, 24, size-32);

  return { dataUrl: canvas.toDataURL('image/png'), seed };
}

function hsl(h,s,l){
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

function hashString(s){
  let h = 2166136261 >>> 0;
  for (let i=0;i<s.length;i++){
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function tokenizeSyllables(text){
  return text
    .split(/\s+/)
    .flatMap(w => w.split(/(?<=[aeiouAEIOUআ-ঔঅ-ঔা-ৌা-ূী-ুे-ौा-ो])/))
    .map(s => s.trim())
    .filter(Boolean);
}

function regenerateCover(id){
  const key = 'auroria-library-v1';
  const arr = JSON.parse(localStorage.getItem(key) || '[]');
  const idx = arr.findIndex(x => x.id === id);
  if (idx === -1) return Promise.resolve();
  const entry = arr[idx];
  const newSeed = (Math.random() * 0xffffffff) >>> 0;
  const meta = { prompt: entry.prompt, style: entry.style, duration: entry.duration, preset: entry.preset };
  return generateCoverArt(meta, newSeed).then((cover) => {
    entry.cover = cover.dataUrl;
    entry.coverSeed = cover.seed;
    arr[idx] = entry;
    localStorage.setItem(key, JSON.stringify(arr));
  });
}

function pickPalette(name, rand){
  const palettes = {
    cinematic: ['hsl(260,70%,50%)','hsl(0,80%,45%)'],
    dance: ['hsl(190,85%,50%)','hsl(330,80%,55%)'],
    trap: ['hsl(280,75%,55%)','hsl(120,70%,45%)'],
    lofi: ['hsl(28,70%,55%)','hsl(200,40%,35%)'],
    rock: ['hsl(0,75%,45%)','hsl(220,70%,45%)'],
    hiphop: ['hsl(40,85%,50%)','hsl(260,70%,45%)'],
    edm: ['hsl(195,90%,55%)','hsl(275,80%,55%)'],
    pop: ['hsl(330,80%,60%)','hsl(210,80%,55%)'],
    jazz: ['hsl(210,60%,40%)','hsl(40,70%,50%)'],
    default: null
  };
  const p = palettes[(name||'').toLowerCase()] || palettes.default;
  if (!p){
    const h1 = rand()*360; const h2 = (h1+60+rand()*60)%360;
    return [hsl(h1, 70, 55), hsl(h2, 80, 45)];
  }
  return p;
}

function bufferToWavBlob(buffer, sampleRate){
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length * numChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);

  function writeString(view, offset, str){ for(let i=0;i<str.length;i++) view.setUint8(offset+i, str.charCodeAt(i)); }
  let offset = 0;
  writeString(view, offset, 'RIFF'); offset += 4;
  view.setUint32(offset, length - 8, true); offset += 4;
  writeString(view, offset, 'WAVE'); offset += 4;
  writeString(view, offset, 'fmt '); offset += 4;
  view.setUint32(offset, 16, true); offset += 4; // PCM chunk size
  view.setUint16(offset, 1, true); offset += 2; // PCM format
  view.setUint16(offset, numChannels, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * numChannels * 2, true); offset += 4;
  view.setUint16(offset, numChannels * 2, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2; // bits per sample
  writeString(view, offset, 'data'); offset += 4;
  view.setUint32(offset, length - 44, true); offset += 4;

  let pos = 0;
  for (let ch = 0; ch < numChannels; ch++){
    const data = buffer.getChannelData(ch);
    let i = 0;
    while (i < data.length){
      const sample = Math.max(-1, Math.min(1, data[i++]));
      view.setInt16(offset + pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      pos += 2;
      if (ch < numChannels - 1) {
        // interleave by repeating index for next channel on next loop
      }
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

downloadBtn.addEventListener('click', () => {
  if (!currentBuffer) return;
  const blob = bufferToWavBlob(currentBuffer, 44100);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'auroria-demo.wav';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

exportMp3Btn.addEventListener('click', async () => {
  if (!currentBuffer) return;
  const mp3Blob = await encodeMp3WithId3(currentBuffer, 44100, {
    title: (currentMeta && currentMeta.prompt) ? currentMeta.prompt.slice(0,60) : 'Auroria Track',
    artist: 'Auroria',
    album: 'Auroria Demos',
    year: new Date().getFullYear().toString(),
    comment: `${currentMeta?.style||''} ${currentMeta?.language||''}`.trim(),
    coverDataUrl: loadLibrary()[0]?.cover || null
  });
  const url = URL.createObjectURL(mp3Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'auroria-demo.mp3';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

exportFlacBtn.addEventListener('click', async () => {
  if (!currentBuffer) return;
  // For demo purposes, we'll export as WAV since FLAC encoding is complex
  // In a real implementation, you'd use a FLAC encoder library
  const flacBlob = bufferToWavBlob(currentBuffer, 44100);
  const url = URL.createObjectURL(flacBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'auroria-demo.flac'; // Note: This is actually WAV, rename to .flac for demo
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showSuccess('FLAC export completed! (Demo: WAV format)');
});

exportStemsBtn.addEventListener('click', async () => {
  if (!currentBuffer) return;

  // For demo purposes, we'll create mock stems
  // In a real implementation, you'd separate the audio into stems
  const zip = new JSZip();

  // Mock stems: drums, bass, melody, vocals
  const stems = [
    { name: 'drums.wav', description: 'Drum and percussion stems' },
    { name: 'bass.wav', description: 'Bass line stems' },
    { name: 'melody.wav', description: 'Melodic instrument stems' },
    { name: 'vocals.wav', description: 'Vocal stems' }
  ];

  // Create mock stem files (simplified versions of the full track)
  for (const stem of stems) {
    const stemBlob = bufferToWavBlob(currentBuffer, 44100); // In reality, each stem would be different
    zip.file(stem.name, stemBlob);
  }

  // Add metadata
  const metadata = {
    title: currentMeta?.prompt || 'Auroria Track',
    stems: stems.map(s => ({ file: s.name, description: s.description })),
    generated: new Date().toISOString()
  };
  zip.file('stems.json', JSON.stringify(metadata, null, 2));

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'auroria-stems.zip';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showSuccess('Stem export completed! 🎛️');
});

exportM3uBtn.addEventListener('click', () => {
  if (!currentBuffer) return;
  const items = loadLibrary();
  const last = items[0];
  const title = (last?.prompt || 'Auroria Track').replace(/\n/g,' ').slice(0,80);
  const duration = Math.round(currentBuffer.length / 44100);
  const m3u = `#EXTM3U\n#PLAYLIST:Auroria\n#EXTINF:${duration},${title}\n${location.origin}/auroria/${last?.id || 'track'}.wav\n#EXTALB:Auroria Demos\n#EXTART:Auroria\n`;
  const blob = new Blob([m3u], { type: 'application/x-mpegURL' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'auroria-playlist.m3u8';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

exportZipBtn.addEventListener('click', async () => {
  if (!currentBuffer) return;
  const wavBlob = bufferToWavBlob(currentBuffer, 44100);
  const mp3Blob = await encodeMp3WithId3(currentBuffer, 44100, {
    title: (currentMeta && currentMeta.prompt) ? currentMeta.prompt.slice(0,60) : 'Auroria Track',
    artist: 'Auroria',
    album: 'Auroria Demos',
    year: new Date().getFullYear().toString(),
    comment: `${currentMeta?.style||''} ${currentMeta?.language||''}`.trim(),
    coverDataUrl: loadLibrary()[0]?.cover || null
  });
  const items = loadLibrary();
  const last = items[0];
  const title = (last?.prompt || 'Auroria Track').replace(/\n/g,' ').slice(0,80);
  const duration = Math.round(currentBuffer.length / 44100);
  const m3u = `#EXTM3U\n#PLAYLIST:Auroria\n#EXTINF:${duration},${title}\n${title}.wav\n#EXTALB:Auroria Demos\n#EXTART:Auroria\n`;

  const zip = new JSZip();
  zip.file(`${title}.wav`, wavBlob);
  zip.file(`${title}.mp3`, mp3Blob);
  if (last?.cover){
    const coverBlob = await (await fetch(last.cover)).blob();
    zip.file(`cover.png`, coverBlob);
  }
  zip.file(`playlist.m3u8`, m3u);
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url; a.download = 'auroria-bundle.zip';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});

cloudBtn.addEventListener('click', async () => {
  const prompt = document.getElementById('prompt').value.trim();
  if (!prompt) {
    showError('Please enter a prompt before using cloud generation.');
    return;
  }

  cloudBtn.disabled = true;
  cloudBtn.textContent = '☁️ Generating...';
  progressSection.hidden = false;
  setProgress(0, '🌐 Preparing cloud generation...');

  try {
    const res = await fetch(`${API_BASE}/api/generations/cloud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const errorData = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 501) {
        // Cloud generation disabled - suggest using local generation
        showError('Cloud generation is currently disabled. Try the regular "Create" button for instant AI music!');
        setProgress(0, '💡 Use local generation instead');
        setTimeout(() => {
          progressSection.hidden = true;
        }, 3000);
        return;
      }
      throw new Error(errorData.error || `Cloud generation failed (${res.status})`);
    }

    // This shouldn't happen with current implementation, but keeping for future
    setProgress(100, '✅ Cloud generation complete!');
    const { audioDataUrl } = errorData;
    audioEl.src = audioDataUrl;
    player.hidden = false;
    progressSection.hidden = true;

    showSuccess('Cloud-generated song ready! 🎵');

  } catch (error) {
    console.error('Cloud generation error:', error);
    showError(error.message || 'Cloud generation failed. The local demo generation works perfectly!');
    progressSection.hidden = true;
  } finally {
    cloudBtn.disabled = false;
    cloudBtn.textContent = '☁️ Generate (Cloud)';
  }
});

async function encodeMp3WithId3(buffer, sampleRate, meta){
  const numChannels = buffer.numberOfChannels;
  const left = buffer.getChannelData(0);
  const right = numChannels > 1 ? buffer.getChannelData(1) : left;
  const mp3encoder = new lamejs.Mp3Encoder(2, sampleRate, 128);
  const blockSize = 1152;
  let mp3Data = [];
  for (let i = 0; i < left.length; i += blockSize) {
    const leftChunk = floatTo16BitPCM(left.subarray(i, i + blockSize));
    const rightChunk = floatTo16BitPCM(right.subarray(i, i + blockSize));
    const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
    if (mp3buf.length > 0) mp3Data.push(new Int8Array(mp3buf));
  }
  const end = mp3encoder.flush();
  if (end.length > 0) mp3Data.push(new Int8Array(end));
  const mp3Blob = new Blob(mp3Data, { type: 'audio/mpeg' });

  // ID3 tags
  if (window.ID3Writer) {
    const arrayBuffer = await mp3Blob.arrayBuffer();
    const writer = new window.ID3Writer(arrayBuffer);
    writer.setFrame('TIT2', meta.title)
      .setFrame('TPE1', [meta.artist])
      .setFrame('TALB', meta.album)
      .setFrame('TYER', meta.year)
      .setFrame('COMM', { description: 'Comment', text: meta.comment || '' });
    if (meta.coverDataUrl) {
      const cover = await (await fetch(meta.coverDataUrl)).arrayBuffer();
      writer.setFrame('APIC', {
        type: 3,
        data: new Uint8Array(cover),
        description: 'Cover',
        useUnicodeEncoding: false,
        mime: 'image/png'
      });
    }
    writer.addTag();
    return new Blob([writer.arrayBuffer], { type: 'audio/mpeg' });
  }
  return mp3Blob;
}

function floatTo16BitPCM(input){
  const out = new Int16Array(input.length);
  for (let i=0;i<input.length;i++){
    const s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return out;
}

// Lyrics helper
const btnLyrics = document.getElementById('btn-lyrics');
btnLyrics.addEventListener('click', async () => {
  const prompt = document.getElementById('prompt').value.trim();
  const language = document.getElementById('language').value;
  const res = await fetch(`${API_BASE}/api/lyrics`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, language })
  });
  if (!res.ok) return;
  const { lyrics } = await res.json();
  const ta = document.getElementById('prompt');
  ta.value = `${ta.value ? ta.value + '\n\n' : ''}${lyrics}`;
});

// Generate lyrics button
generateLyricsBtn.addEventListener('click', async () => {
  const prompt = document.getElementById('prompt').value.trim();
  const language = document.getElementById('language').value;
  const style = document.getElementById('style').value;

  if (!prompt) {
    showError('Please enter a prompt first to generate lyrics.');
    return;
  }

  generateLyricsBtn.disabled = true;
  generateLyricsBtn.textContent = '🎵 Generating...';

  try {
    const res = await fetch(`${API_BASE}/api/lyrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, language, style })
    });

    if (!res.ok) {
      throw new Error('Failed to generate lyrics');
    }

    const { lyrics, metadata } = await res.json();
    document.getElementById('lyrics').value = lyrics;
    showSuccess(`Generated ${metadata.wordCount} words of ${metadata.themes.join(', ')} lyrics! 📝`);

  } catch (error) {
    console.error('Lyrics generation error:', error);
    showError('Failed to generate lyrics. Please try again.');
  } finally {
    generateLyricsBtn.disabled = false;
    generateLyricsBtn.textContent = '📝 Generate Lyrics';
  }
});

// Advanced features: Variation, Extend, Continue, Remix, Share
const btnVariation = document.getElementById('btn-variation');
const btnExtend = document.getElementById('btn-extend');

btnVariation.addEventListener('click', async () => {
  if (!currentMeta) return;
  document.getElementById('seed').value = '';
  document.getElementById('prompt').value = `${currentMeta.prompt} (variation)`;
  await form.dispatchEvent(new Event('submit'));
});

btnExtend.addEventListener('click', async () => {
  if (!currentMeta) return;
  document.getElementById('duration').value = String(Math.min(60, (currentMeta.duration || 15) + 15));
  document.getElementById('prompt').value = `${currentMeta.prompt} (extended)`;
  await form.dispatchEvent(new Event('submit'));
});

continueBtn.addEventListener('click', async () => {
  if (!currentMeta) return;
  document.getElementById('prompt').value = `${currentMeta.prompt} (continuation)`;
  document.getElementById('seed').value = String(currentSeed + 1);
  await form.dispatchEvent(new Event('submit'));
});

remixBtn.addEventListener('click', async () => {
  if (!currentMeta) return;
  const newStyles = ['pop', 'hiphop', 'edm', 'rock', 'jazz', 'lofi'];
  const currentStyleIndex = newStyles.indexOf(currentMeta.style);
  const newStyle = newStyles[(currentStyleIndex + 1) % newStyles.length];
  document.getElementById('style').value = newStyle;
  document.getElementById('prompt').value = `${currentMeta.prompt} (remixed in ${newStyle} style)`;
  document.getElementById('seed').value = '';
  await form.dispatchEvent(new Event('submit'));
});

shareBtn.addEventListener('click', async () => {
  if (!currentBuffer) return;

  if (currentRoom) {
    // In collaboration mode, add to shared playlist
    addCurrentSongToShared();
    return;
  }

  // Regular sharing functionality
  const shareData = {
    title: currentMeta?.prompt || 'Auroria AI Track',
    text: `Check out this AI-generated song: ${currentMeta?.prompt || 'Auroria Track'}`,
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      showSuccess('Song shared successfully!');
    } catch (error) {
      console.log('Share cancelled or failed');
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        showSuccess('Share link copied to clipboard!');
      });
    }
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
      showSuccess('Share link copied to clipboard!');
    }).catch(() => {
      showError('Unable to share. Copy this URL manually.');
    });
  }
});

// Mode handling
modeSelect.addEventListener('change', (e) => {
  const mode = e.target.value;
  const vocalsSelect = document.getElementById('vocals');
  const lyricsTextarea = document.getElementById('lyrics');

  if (mode === 'instrumental') {
    vocalsSelect.value = 'none';
    vocalsSelect.disabled = true;
    lyricsTextarea.placeholder = 'Instrumental tracks work best without lyrics...';
  } else {
    vocalsSelect.disabled = false;
    lyricsTextarea.placeholder = 'Paste or write your exact lyrics here...';
  }
});

// Lyrics synchronization functions
function toggleLyricsSync() {
  lyricsSyncEnabled = !lyricsSyncEnabled;
  toggleLyricsSyncBtn.textContent = lyricsSyncEnabled ? 'Disable Sync' : 'Enable Sync';
  toggleLyricsSyncBtn.classList.toggle('active', lyricsSyncEnabled);

  if (lyricsSyncEnabled && lyricsData.length > 0) {
    audioEl.addEventListener('timeupdate', updateLyricsSync);
  } else {
    audioEl.removeEventListener('timeupdate', updateLyricsSync);
    clearLyricsHighlighting();
  }
}

function updateLyricsSync() {
  if (!lyricsSyncEnabled || !lyricsData.length) return;

  const currentTime = audioEl.currentTime;
  let newIndex = -1;

  // Find the current lyric based on timestamp
  for (let i = 0; i < lyricsData.length; i++) {
    if (currentTime >= lyricsData[i].startTime) {
      newIndex = i;
    } else {
      break;
    }
  }

  if (newIndex !== currentLyricIndex) {
    currentLyricIndex = newIndex;
    updateLyricsDisplay();
  }
}

function clearLyricsHighlighting() {
  const lines = lyricsContent.querySelectorAll('.lyrics-line');
  lines.forEach(line => {
    line.classList.remove('active', 'upcoming');
  });
  currentLyricIndex = -1;
}

function updateLyricsDisplay() {
  const lines = lyricsContent.querySelectorAll('.lyrics-line');
  lines.forEach((line, index) => {
    line.classList.remove('active', 'upcoming');

    if (index === currentLyricIndex) {
      line.classList.add('active');
      line.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (index === currentLyricIndex + 1) {
      line.classList.add('upcoming');
    }
  });
}

function parseLyricsWithTiming(lyricsText, duration) {
  const lines = lyricsText.split('\n').filter(line => line.trim());
  const timePerLine = duration / lines.length;

  return lines.map((line, index) => ({
    text: line.trim(),
    startTime: index * timePerLine,
    endTime: (index + 1) * timePerLine
  }));
}

function displayLyrics(lyricsText) {
  if (!lyricsDisplay || !lyricsContent) return;

  lyricsData = parseLyricsWithTiming(lyricsText, currentMeta?.duration || 15);
  lyricsContent.innerHTML = '';

  lyricsData.forEach((lyric, index) => {
    const lineEl = document.createElement('div');
    lineEl.className = 'lyrics-line';
    lineEl.textContent = lyric.text;
    lineEl.addEventListener('click', () => {
      if (audioEl.duration) {
        audioEl.currentTime = lyric.startTime;
      }
    });
    lyricsContent.appendChild(lineEl);
  });

  lyricsDisplay.hidden = false;
}

// User account system functions
function initUserSystem() {
  loginBtn.addEventListener('click', handleLogin);
  userProfile.addEventListener('click', showUserMenu);
}

function loadUserSession() {
  const savedUser = localStorage.getItem('auroria-user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateUserUI();
  }
}

function handleLogin() {
  // Demo login - in real implementation, this would integrate with OAuth
  const demoUsers = [
    { id: 'user1', name: 'Alex Chen', avatar: '🎨', email: 'alex@example.com' },
    { id: 'user2', name: 'Maya Patel', avatar: '🎵', email: 'maya@example.com' },
    { id: 'user3', name: 'Jordan Kim', avatar: '🎼', email: 'jordan@example.com' }
  ];

  const randomUser = demoUsers[Math.floor(Math.random() * demoUsers.length)];
  currentUser = {
    ...randomUser,
    loginTime: Date.now(),
    tracksGenerated: Math.floor(Math.random() * 50) + 1
  };

  localStorage.setItem('auroria-user', JSON.stringify(currentUser));
  updateUserUI();
  showSuccess(`Welcome back, ${currentUser.name}! 🎉`);
}

function updateUserUI() {
  if (currentUser) {
    loginBtn.hidden = true;
    userProfile.hidden = false;
    userAvatar.textContent = currentUser.avatar;
    userName.textContent = currentUser.name;
  } else {
    loginBtn.hidden = false;
    userProfile.hidden = true;
  }
}

function showUserMenu() {
  // Create a simple dropdown menu
  const menu = document.createElement('div');
  menu.className = 'user-menu';
  menu.innerHTML = `
    <div class="menu-item" onclick="showUserProfile()">Profile</div>
    <div class="menu-item" onclick="showUserStats()">Statistics</div>
    <div class="menu-item" onclick="exportUserData()">Export Data</div>
    <div class="menu-item logout" onclick="handleLogout()">Logout</div>
  `;

  // Position and show menu
  const rect = userProfile.getBoundingClientRect();
  menu.style.cssText = `
    position: fixed;
    top: ${rect.bottom + 5}px;
    right: 20px;
    background: var(--panel);
    border: 2px solid var(--brand);
    border-radius: 10px;
    padding: 10px;
    z-index: 1000;
    min-width: 150px;
    box-shadow: var(--glow);
  `;

  document.body.appendChild(menu);

  // Close menu when clicking outside
  const closeMenu = (e) => {
    if (!menu.contains(e.target) && e.target !== userProfile) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  };
  setTimeout(() => document.addEventListener('click', closeMenu), 100);
}

function showUserProfile() {
  const profileModal = createModal('User Profile', `
    <div class="profile-info">
      <div class="profile-avatar">${currentUser.avatar}</div>
      <div class="profile-details">
        <h3>${currentUser.name}</h3>
        <p>${currentUser.email}</p>
        <p>Member since: ${new Date(currentUser.loginTime).toLocaleDateString()}</p>
        <p>Tracks generated: ${currentUser.tracksGenerated}</p>
      </div>
    </div>
  `);
  document.body.appendChild(profileModal);
}

function showUserStats() {
  const stats = calculateUserStats();
  const statsModal = createModal('Your Statistics', `
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-number">${stats.totalTracks}</div>
        <div class="stat-label">Total Tracks</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">${stats.favoriteStyle}</div>
        <div class="stat-label">Favorite Style</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">${stats.avgDuration}s</div>
        <div class="stat-label">Avg Duration</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">${stats.collaborations}</div>
        <div class="stat-label">Collaborations</div>
      </div>
    </div>
  `);
  document.body.appendChild(statsModal);
}

function calculateUserStats() {
  const library = loadLibrary();
  const styles = {};
  let totalDuration = 0;

  library.forEach(track => {
    styles[track.style] = (styles[track.style] || 0) + 1;
    totalDuration += track.duration || 0;
  });

  const favoriteStyle = Object.keys(styles).reduce((a, b) =>
    styles[a] > styles[b] ? a : b, 'pop'
  );

  return {
    totalTracks: library.length,
    favoriteStyle: favoriteStyle.toUpperCase(),
    avgDuration: Math.round(totalDuration / library.length) || 0,
    collaborations: Math.floor(Math.random() * 10) // Mock data
  };
}

function exportUserData() {
  const userData = {
    profile: currentUser,
    library: loadLibrary(),
    collaborations: sharedPlaylist,
    exportDate: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `auroria-user-data-${currentUser.id}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showSuccess('User data exported! 📁');
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('auroria-user');
  updateUserUI();
  showSuccess('Logged out successfully 👋');
}

function createModal(title, content) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-content">
        ${content}
      </div>
    </div>
  `;

  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  return modal;
}

function renderPortfolio() {
  // Portfolio is static HTML, just ensure it's visible
  console.log('Rendering portfolio section');

  // Add loading states for resume images
  setTimeout(() => {
    const resumeImages = document.querySelectorAll('.resume-image');
    resumeImages.forEach(img => {
      img.addEventListener('load', function() {
        this.style.opacity = '1';
        const loading = this.parentElement.querySelector('.resume-loading');
        if (loading) loading.style.display = 'none';
      });

      img.addEventListener('error', function() {
        console.error('Failed to load resume image:', this.src);
        const loading = this.parentElement.querySelector('.resume-loading');
        if (loading) {
          loading.innerHTML = `
            <span class="error-icon">❌</span>
            <p>Image failed to load</p>
            <small>Check image URL</small>
          `;
          loading.style.display = 'flex';
        }
      });

      // Show loading initially
      const loading = img.parentElement.querySelector('.resume-loading');
      if (loading) loading.style.display = 'flex';
      img.style.opacity = '0';
    });
  }, 100);
}


