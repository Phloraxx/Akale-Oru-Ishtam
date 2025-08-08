# Akale Oru Istham 💕
*A social discovery platform for lonely inanimate objects*

## 🎭 What is this?

Akale Oru Istham (Malayalam for "There is someone over there") is a playful dating app for inanimate objects found around your campus. Using AI, it creates witty, Gen Z dating profiles for everyday objects, turning the mundane into the magical.

## ✨ Features

- **📸 Object Capture**: Take photos of lonely objects around campus
- **🤖 AI Profile Generation**: Automatically create witty dating profiles
- **💫 Vibe Selection**: Choose the perfect personality vibe for each object
- **❤️ Swipe Interface**: Tinder-style swiping for object discovery
- **🏫 Campus Integration**: Location-based object finding
- **✏️ Manual Creation**: Create profiles without camera
- **🎪 Joyful Inefficiency**: Embracing the absurd with style

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Emulator (or physical device)
- Supabase account (for backend)
- OpenAI API key (for AI generation)

### Installation

1. **Clone and setup**
   ```bash
   cd AkaleOruIstham
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CameraView.tsx   # Camera interface
│   ├── VibeSelector.tsx # Vibe selection component
│   ├── LoadingProfile.tsx # AI generation loading
│   └── ObjectCard.tsx   # Swipeable profile card
├── screens/             # App screens
│   ├── HomeScreen.tsx   # Main swiping interface
│   ├── CaptureScreen.tsx # Object capture flow
│   ├── ProfileCreationScreen.tsx # Manual profile creation
│   └── SettingsScreen.tsx # App settings
├── services/            # External service integrations
│   ├── aiService.ts     # AI profile generation
│   ├── supabaseClient.ts # Database operations
│   └── locationService.ts # Location handling
├── types/               # TypeScript interfaces
│   └── ObjectProfile.ts # Core data types
└── utils/               # Utilities and constants
    ├── constants.ts     # App constants
    └── prompts.ts       # AI prompt templates
```

## 🛠️ Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the database schema:

```sql
-- Objects table
CREATE TABLE objects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  bio TEXT NOT NULL,
  passions TEXT[],
  prompt_question TEXT,
  prompt_answer TEXT,
  image_url TEXT,
  location_description TEXT,
  vibe VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID
);

-- Swipes table (for future matching)
CREATE TABLE swipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  object_id UUID REFERENCES objects(id),
  direction VARCHAR CHECK (direction IN ('left', 'right')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. Update `.env` with your Supabase URL and anon key

### AI Service Setup

The app supports multiple AI providers:

- **OpenAI**: Add `OPENAI_API_KEY` to `.env`
- **Google Gemini**: Add `GEMINI_API_KEY` to `.env`

If no API key is provided, the app will use mock profiles for demonstration.

## 🎨 Customization

### Vibe Categories

Edit `src/utils/constants.ts` to customize available vibes:

```typescript
export const VIBE_CATEGORIES = {
  aesthetic: ['minimalist', 'chaotic', 'vintage', 'futuristic'],
  emotional: ['hopeful', 'melancholic', 'anxious', 'confident'],
  personality: ['introverted', 'dramatic', 'mysterious', 'cheerful'],
  campus: ['academic', 'procrastinating', 'caffeinated', 'stressed']
};
```

### Campus Locations

Update campus-specific locations in `src/utils/constants.ts`:

```typescript
export const CAMPUS_LOCATIONS = [
  { name: 'Library', description: 'The place where dreams go to die' },
  { name: 'Cafeteria', description: 'Sustenance for the soul' },
  // Add your campus locations...
];
```

### AI Prompts

Customize AI personality generation in `src/utils/prompts.ts`

## 📱 Building for Production

### Android

```bash
npx expo build:android
```

### iOS

```bash
npx expo build:ios
```

## 🎭 Philosophy

Akale Oru Istham embraces "joyful inefficiency" - the idea that not everything needs to be productive or meaningful. Sometimes, the most delightful experiences come from the absurd, the playful, and the wonderfully pointless.

This app transforms everyday campus objects into characters with personalities, stories, and dating profiles. It's about finding magic in the mundane and creating connections (however silly) in unexpected places.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the absurdist humor of Gen Z
- Built with the amazing Expo and React Native ecosystem
- AI magic powered by OpenAI/Google
- Backend powered by Supabase
- Icons and inspiration from the campus community

---

*"In a world full of meaningful apps, sometimes you just need to help a lonely chair find love." ✨*
