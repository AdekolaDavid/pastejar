# Pastejar

Cross-platform smart scratchpad — save, sync, and access your clipboard history across all devices.

## The Problem

You copy something on your phone, get distracted, and it's gone. Mobile OS clipboard restrictions make background clipboard access impossible. Pastejar makes saving so fast it feels automatic — via share sheets, widgets, and one-tap quick-save.

## Tech Stack

- **Expo** (SDK 52+) with Expo Router — single TypeScript codebase for iOS, Android, and web
- **NativeWind** — Tailwind CSS for React Native
- **Supabase** — Auth, Postgres with RLS, Realtime subscriptions, Storage

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file and add your Supabase credentials
cp .env.example .env

# Start the dev server
npx expo start
```

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── (auth)/             # Sign in / sign up
│   ├── (tabs)/             # Tab navigator (clips feed, settings)
│   └── clip/[id].tsx       # Clip detail modal
├── components/             # Shared UI components
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── hooks/              # useAuth, useClips
│   └── utils/              # Clipboard helpers, formatters
├── types/                  # TypeScript types
└── supabase/
    └── migrations/         # SQL schema migrations
```

## License

MIT
