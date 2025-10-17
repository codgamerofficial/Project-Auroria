# Auroria AI - Professional Music Generation Platform

A cutting-edge AI-powered music creation platform with advanced features for songwriting, collaboration, and professional music production.

## 🚀 Features

### Core Music Generation
- **AI-Powered Music Creation**: Generate unique songs using advanced AI models
- **Multiple Styles**: Pop, Hip-Hop, EDM, Rock, Jazz, Lo-Fi, and more
- **Custom Parameters**: BPM control, duration settings, seed-based generation
- **Instrumental Mode**: Create backing tracks without vocals
- **Multi-Language Support**: English, Hindi, and Bengali lyrics

### Advanced Lyrics System
- **Realistic Song Lyrics**: Human-made quality lyrics with proper structure
- **Theme Detection**: Automatically detects themes, emotions, and settings
- **Synchronized Playback**: Karaoke-style lyrics that sync with music
- **Professional Structure**: Verse, Chorus, Bridge, and Outro sections

### Professional Audio Features
- **Waveform Visualization**: Interactive audio waveform with click-to-seek
- **Multiple Export Formats**: WAV, MP3, FLAC, Stem separation, ZIP bundles
- **High-Quality Audio**: 44.1kHz stereo output with professional mixing
- **Metadata Embedding**: ID3 tags, cover art, and playlist generation

### Collaboration Tools
- **Real-Time Collaboration**: Create rooms for team music production
- **Shared Playlists**: Add and manage collaborative tracks
- **Live Chat**: Communicate with collaborators in real-time
- **Version Control**: Track changes and iterations

### User Management
- **User Accounts**: Personal profiles with statistics and preferences
- **Data Export**: Backup and migrate your music library
- **Social Sharing**: Share tracks across platforms
- **Analytics**: Track your music creation statistics

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **Web Audio API** for synthesis
- **Hugging Face API** for AI music generation
- **OpenAI API** for enhanced lyrics (optional)
- **PostgreSQL/MongoDB** for data persistence
- **Redis** for caching and sessions

### Frontend
- **Vanilla JavaScript** with modern ES6+ features
- **HTML5 Web Audio** for real-time audio processing
- **Canvas API** for waveform visualization
- **CSS3** with advanced animations and effects
- **Responsive Design** for all devices

### APIs & Services
- **Hugging Face**: Music generation models
- **OpenAI**: Enhanced lyrics generation
- **Firebase**: Real-time collaboration
- **Stripe**: Premium features and payments
- **AWS S3/Google Cloud**: File storage
- **SendGrid**: Email notifications

## 📋 Prerequisites

- Node.js 18+ and npm
- Valid API keys (see configuration section)
- Modern web browser with Web Audio API support

## 🔧 Installation & Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd auroria-ai
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure API Keys
Edit `backend/.env` with your API keys:

```env
# Required
HF_API_TOKEN=your-huggingface-token

# Optional (for enhanced features)
OPENAI_API_KEY=your-openai-key
FIREBASE_API_KEY=your-firebase-key
STRIPE_PUBLISHABLE_KEY=your-stripe-key
# ... see .env file for complete list
```

### 3. Start Development Server
```bash
# From project root
npm run dev
```

This starts both backend (port 5050) and frontend (port 5173).

### 4. Production Deployment

#### Using Docker
```bash
docker build -t auroria-ai .
docker run -p 5050:5050 -p 5173:5173 auroria-ai
```

#### Manual Production Setup
```bash
# Backend
cd backend
NODE_ENV=production npm start

# Frontend (in another terminal)
cd frontend
npm run build
# Serve built files with nginx/apache
```

## 🔑 API Keys & Configuration

### Required APIs

#### 1. Hugging Face (Music Generation)
- **URL**: https://huggingface.co/settings/tokens
- **Cost**: Free tier available, paid for higher usage
- **Purpose**: AI-powered music generation using MusicGen models

```env
HF_API_TOKEN=hf_your_token_here
```

### Optional APIs (Enhanced Features)

#### 2. OpenAI (Enhanced Lyrics)
- **URL**: https://platform.openai.com/api-keys
- **Cost**: Pay-per-use
- **Purpose**: More sophisticated lyrics generation

```env
OPENAI_API_KEY=sk-your-key-here
```

#### 3. Firebase (Real-time Collaboration)
- **URL**: https://console.firebase.google.com/
- **Cost**: Generous free tier
- **Purpose**: Real-time collaboration features

```env
FIREBASE_API_KEY=your-firebase-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
```

#### 4. Stripe (Premium Features)
- **URL**: https://dashboard.stripe.com/apikeys
- **Cost**: Transaction fees
- **Purpose**: Payment processing for premium features

```env
STRIPE_PUBLISHABLE_KEY=pk_test_your-key
STRIPE_SECRET_KEY=sk_test_your-key
```

#### 5. AWS S3 (File Storage)
- **URL**: https://console.aws.amazon.com/iam/
- **Cost**: Pay-per-use storage
- **Purpose**: Cloud storage for user files

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket
```

#### 6. SendGrid (Email Notifications)
- **URL**: https://app.sendgrid.com/settings/api_keys
- **Cost**: Free tier available
- **Purpose**: User notifications and marketing

```env
SENDGRID_API_KEY=SG.your-key-here
```

## 📊 API Endpoints

### Music Generation
- `POST /api/generations` - Create new song
- `GET /api/generations/:id` - Check generation status

### Lyrics
- `POST /api/lyrics` - Generate song lyrics

### Cloud Generation
- `POST /api/generations/cloud` - Generate using Hugging Face

### User Management
- `POST /api/auth/login` - User authentication
- `GET /api/user/profile` - Get user profile
- `POST /api/user/library` - Save to library

## 🎵 Usage Guide

### Creating Your First Song
1. Enter a descriptive prompt (e.g., "upbeat pop song about summer love")
2. Select style, duration, and other parameters
3. Optionally generate or write lyrics
4. Click "Create" and wait for AI generation
5. Use waveform to navigate and export in multiple formats

### Collaboration Features
1. Click "Collaborate" tab
2. Create or join a room with a code
3. Share your generated tracks
4. Chat with collaborators in real-time

### Export Options
- **WAV**: Uncompressed, highest quality
- **MP3**: Compressed with ID3 metadata
- **FLAC**: Lossless compression
- **Stems**: Individual instrument tracks
- **ZIP**: Complete bundle with all formats

## 🔒 Security & Privacy

- All API keys are server-side only
- User data encrypted in transit and at rest
- No audio files stored without user consent
- GDPR compliant data handling
- Regular security audits recommended

## 📈 Performance Optimization

- Audio synthesis uses Web Audio API for real-time processing
- Waveform rendering optimized for smooth scrolling
- Lazy loading for large libraries
- CDN integration recommended for production
- Redis caching for improved response times

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Use GitHub Issues for bug reports
- **Discussions**: Join our community forum
- **Email**: support@auroria.ai

## 🚀 Roadmap

- [ ] Mobile app development
- [ ] Advanced AI models integration
- [ ] Social features and communities
- [ ] Professional studio tools
- [ ] API for third-party integrations
- [ ] Multi-track editing interface

---

**Made with ❤️ by the Auroria AI Team**

Transform your musical ideas into reality with the power of artificial intelligence.
