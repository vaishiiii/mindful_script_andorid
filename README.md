# Mindscript

**Rewire your mind. One mindful script at a time.**

A React-based mindfulness and behavioral change application with a 3-day personalized program.

## Features

- **7 Programs**: Calm, Focus, Confidence, Healing, Discipline, Purpose, Habit Building
- **Personalized Onboarding**: Goal selection, questionnaire, and schedule setup
- **Daily Sessions**: Morning, Midday, and Night rituals
- **Program-specific Breathwork**: Animated breathing exercises tailored to each goal
- **Action Tasks**: Real-world behavioral exercises with timers
- **Nightly Reflections**: Track your progress and insights
- **Progress Tracking**: Streak counts, session stats, and 3-day overview
- **Behavioral Pattern Report**: Personalized analysis after completing the program
- **Local Storage Persistence**: Your progress is saved automatically

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **CSS-in-JS** - Inline styles with design system

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Project Structure

```
mindscript/
├── src/
│   ├── components/
│   │   ├── ui/           # Shared UI components (Buttons, Cards, Icons, etc.)
│   │   ├── onboarding/   # Onboarding flow screens
│   │   ├── app/          # Main app tabs and navigation
│   │   └── session/      # Session, breathing, and timer components
│   ├── data/             # Program data, questions, breath patterns
│   ├── hooks/            # Custom React hooks (future)
│   ├── utils/            # Helper functions
│   ├── styles/           # Design system and global styles
│   ├── App.jsx           # Root component
│   └── main.jsx          # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## Design System

The app uses a cohesive design system with:

- **Colors**: Sage green primary, neutral backgrounds, program-specific accents
- **Typography**: Cormorant Garamond (serif) for headings, DM Sans for body
- **Animations**: Smooth transitions, breathing animations, celebration effects

## Future Improvements

- [ ] Backend integration for user accounts
- [ ] Push notifications
- [ ] More programs and longer durations
- [ ] Audio-guided sessions
- [ ] Social features and community
- [ ] Analytics dashboard

## License

MIT
