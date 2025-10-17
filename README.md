# Auroria AI - Song Maker & Portfolio

A futuristic AI-powered music generation platform with an integrated developer portfolio, featuring advanced audio synthesis, collaborative tools, and a cyberpunk-inspired design.

## 🌟 Features

### 🎵 AI Music Generation
- **Realistic Song Creation**: Generate complete songs with lyrics and instrumentation
- **Multiple Styles**: Pop, Hip Hop, EDM, Rock, Jazz, Lo-Fi
- **Custom Parameters**: BPM, duration, vocals, presets
- **Lyrics Integration**: Auto-generate or input custom lyrics
- **Audio Export**: WAV, MP3, FLAC, M3U8, ZIP formats

### 👥 Collaborative Studio
- **Real-time Collaboration**: Work with other creators
- **Shared Playlists**: Collaborative music collections
- **Live Chat**: Communicate during sessions
- **Room-based Sessions**: Private collaborative spaces

### 📊 Advanced Features
- **Waveform Visualization**: Real-time audio visualization
- **Lyrics Sync**: Timed lyrics display
- **Variation Generation**: Create song variations
- **Song Continuation**: Extend existing tracks
- **Remixing Tools**: Modify and remix songs

### 🚀 Developer Portfolio
- **Interactive Resume**: Futuristic widget-based resume
- **Project Showcase**: Featured projects with live demos
- **Skills Visualization**: Interactive tech stack display
- **Experience Timeline**: Professional journey visualization
- **Contact Integration**: Multiple contact methods

## 🎨 Design

### Cyberpunk Theme
- **Neon Colors**: Cyan (#00ffff) and Magenta (#ff00ff) accents
- **Dark Backgrounds**: Deep space-inspired color palette
- **Glowing Effects**: Animated shadows and borders
- **Orbitron Font**: Futuristic typography
- **Glass Morphism**: Semi-transparent panels with blur effects

### Responsive Design
- **Mobile-First**: Optimized for phones and tablets
- **Progressive Web App**: Installable on mobile devices
- **Touch Interactions**: Native app-like experience
- **Adaptive Layouts**: Perfect on all screen sizes

## 🛠️ Technology Stack

### Frontend
- **HTML5/CSS3**: Modern web standards
- **Vanilla JavaScript**: No frameworks for maximum performance
- **Web Audio API**: Real-time audio synthesis and visualization
- **Canvas API**: Waveform rendering and graphics
- **Service Workers**: Offline functionality

### Backend
- **Node.js**: Server-side JavaScript
- **Express.js**: RESTful API framework
- **WebSocket**: Real-time collaboration
- **File Processing**: Audio encoding and export

### AI Integration
- **Hugging Face**: MusicGen integration for cloud generation
- **Custom Algorithms**: Local audio synthesis
- **Lyrics Generation**: AI-powered text generation

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/codgamerofficial/Project-Auroria.git
   cd Project-Auroria
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📱 Mobile App

### Android APK Build

To build the Android APK, you need:

1. **Install Java JDK** (version 11 or higher)
   - Download from: https://adoptium.net/
   - Set JAVA_HOME environment variable

2. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android SDK and build tools

3. **Build the APK**
   ```bash
   # Install Capacitor (already done)
   npm install @capacitor/core @capacitor/cli @capacitor/android

   # Initialize Capacitor
   npx cap init "Auroria AI" "com.auroria.ai" --web-dir=frontend

   # Add Android platform
   npx cap add android

   # Sync web assets
   npx cap sync android

   # Build APK
   cd android
   ./gradlew assembleDebug
   ```

4. **Find the APK**
   - Location: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Install on Android device for testing

### Progressive Web App

The website is already configured as a PWA:
- Add to home screen on mobile devices
- Offline functionality
- App-like experience

## 🌐 Live Deployment

### Netlify (Current)
- **URL**: https://auroriia.netlify.app
- **Backend**: Serverless functions
- **CDN**: Global content delivery

### Alternative Deployments
- **Vercel**: `vercel --prod`
- **Railway**: Docker deployment
- **Heroku**: Traditional hosting

## 📁 Project Structure

```
SunoAI/
├── frontend/                 # Web application
│   ├── index.html           # Main HTML file
│   ├── styles.css           # Cyberpunk styles
│   ├── app.js              # Application logic
│   └── server.js           # Development server
├── backend/                 # API server
│   ├── server.js           # Express server
│   └── package.json        # Dependencies
├── android/                 # Android app (generated)
├── images/                  # Resume images
├── capacitor.config.json    # Capacitor configuration
└── package.json            # Root dependencies
```

## 🎵 API Endpoints

### Music Generation
- `POST /api/generations` - Create new song
- `GET /api/generations/:id` - Check generation status
- `POST /api/generations/cloud` - Cloud-based generation

### Lyrics
- `POST /api/lyrics` - Generate lyrics

### Collaboration
- WebSocket connections for real-time features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Suno AI**: Inspiration for the music generation concept
- **Hugging Face**: MusicGen model for cloud generation
- **Capacitor**: Cross-platform app development
- **Web Audio API**: Browser-based audio synthesis

## 📞 Contact

**Saswata Dey**
- **Email**: saswatadey700@gmail.com
- **Portfolio**: https://saswata-portfolio.lovable.app
- **GitHub**: https://github.com/codgamerofficial
- **LinkedIn**: https://linkedin.com/in/saswat-kumar

---

**Made with ⚡ Auroria AI** - *Building the future of creative technology*
