// Time-of-day aligned breath patterns for each program
export const BREATH_PATTERNS = {
  calm: {
    morning: {
      phases: ["Inhale", "Hold", "Exhale"],
      times: [4, 2, 6],
      label: "Gentle Awakening",
      desc: "Soft activation breath — gradually brings your system online with safety.",
    },
    midday: {
      phases: ["Inhale", "Exhale"],
      times: [4, 6],
      label: "Calming Wave",
      desc: "Extended exhale activates your parasympathetic system mid-day.",
    },
    night: {
      phases: ["Inhale", "Exhale"],
      times: [4, 8],
      label: "Deep Settle",
      desc: "Extended exhale prepares your nervous system for restorative sleep.",
    },
  },
  focus: {
    morning: {
      phases: ["Inhale", "Hold", "Exhale"],
      times: [4, 4, 4],
      label: "Mental Ignition",
      desc: "Activating breath pattern sharpens morning cognition and alertness.",
    },
    midday: {
      phases: ["Inhale", "Hold", "Exhale", "Hold"],
      times: [4, 4, 4, 4],
      label: "Box Breathing",
      desc: "Equal-ratio breathing creates mental equilibrium and sustained attention.",
    },
    night: {
      phases: ["Inhale", "Hold", "Exhale"],
      times: [4, 4, 6],
      label: "Cognitive Wind-Down",
      desc: "Gradual descent from focused work to restful clarity.",
    },
  },
  confidence: {
    morning: {
      phases: ["Inhale", "Hold", "Exhale"],
      times: [5, 5, 5],
      label: "Power Activation",
      desc: "Strong balanced breath builds morning courage and readiness.",
    },
    midday: {
      phases: ["Inhale", "Hold", "Exhale"],
      times: [4, 4, 6],
      label: "Triangle Breath",
      desc: "Power breath — builds controlled activation, then steady release.",
    },
    night: {
      phases: ["Inhale", "Exhale"],
      times: [5, 7],
      label: "Self-Trust Seal",
      desc: "Gentle exhale anchors the day's courageous actions into your identity.",
    },
  },
  healing: {
    morning: {
      phases: ["Inhale", "Hold", "Exhale"],
      times: [4, 2, 6],
      label: "Tender Awakening",
      desc: "Soft breath that honors your pace and signals safety to begin.",
    },
    midday: {
      phases: ["Inhale", "Exhale"],
      times: [5, 8],
      label: "Parasympathetic Reset",
      desc: "Long slow exhale signals deep safety to your nervous system.",
    },
    night: {
      phases: ["Inhale", "Hold", "Exhale"],
      times: [5, 3, 10],
      label: "Release & Restore",
      desc: "Deep releasing breath to let go of the day and invite healing sleep.",
    },
  },
  discipline: {
    morning: {
      phases: ["Inhale", "Hold", "Exhale"],
      times: [4, 6, 4],
      label: "Iron Will",
      desc: "Strong hold builds morning resolve and commitment to execution.",
    },
    midday: {
      phases: ["Inhale", "Hold", "Exhale"],
      times: [4, 4, 6],
      label: "Steady Structure",
      desc: "Consistent breath pattern mirrors disciplined, deliberate execution.",
    },
    night: {
      phases: ["Inhale", "Exhale"],
      times: [4, 6],
      label: "Accountability Close",
      desc: "Evening breath to honor completion and release attachment to outcomes.",
    },
  },
  purpose: {
    morning: {
      phases: ["Inhale", "Hold", "Exhale"],
      times: [5, 4, 5],
      label: "Clarity Dawn",
      desc: "Balanced breath to connect with your deeper why before the day begins.",
    },
    midday: {
      phases: ["Inhale", "Exhale"],
      times: [5, 5],
      label: "Balanced Coherence",
      desc: "Equal breath ratio creates heart-brain coherence and clarity.",
    },
    night: {
      phases: ["Inhale", "Hold", "Exhale"],
      times: [5, 3, 7],
      label: "Meaning Integration",
      desc: "Reflective breath to integrate the day's purpose-driven moments.",
    },
  },
  habit: {
    morning: {
      phases: ["Inhale", "Hold", "Exhale"],
      times: [4, 3, 5],
      label: "Routine Primer",
      desc: "Activating breath that primes your brain for habit execution.",
    },
    midday: {
      phases: ["Inhale", "Hold", "Exhale"],
      times: [4, 4, 6],
      label: "Pattern Reinforcement",
      desc: "Steady breath that reinforces neural pathways for habit formation.",
    },
    night: {
      phases: ["Inhale", "Hold", "Exhale"],
      times: [4, 4, 8],
      label: "Deep Reset",
      desc: "Extended exhale clears residue and resets your behavioral baseline.",
    },
  },
};

export const SESSION_TASKS = {
  // ═══════════════════════════════════════════════════════════════════════════
  // CALM PROGRAM - 9 Unique Tasks (3 days × 3 sessions)
  // Inspired by: The Power of Now, Radical Acceptance, 10% Happier
  // ═══════════════════════════════════════════════════════════════════════════
  calm: {
    day1: {
      morning: {
        title: "Sensory Grounding",
        steps: [
          "Find 5 objects in reach — name the color and texture of each",
          "Take 3 slow breaths before any screen contact",
          "Set one intention: how you want to FEEL today, not what to do",
        ],
      },
      midday: {
        title: "Deliberate Slowdown",
        steps: [
          "For 10 minutes, do everything at 70% your normal speed",
          "Before your next message or decision — pause 90 full seconds",
          "Notice what your body needs right now. Give it exactly that.",
        ],
        timer: 600,
      },
      night: {
        title: "Release & Settle",
        steps: [
          "Name one thing that is NOT your problem tonight",
          "Identify one tension you carry — then consciously set it aside",
          "Rate your calm today: low / building / present",
        ],
      },
    },
    day2: {
      morning: {
        title: "The Power of Pause",
        steps: [
          "Before rising, lie still for 60 seconds observing your breath",
          "Place both feet on the floor and feel the ground supporting you",
          "Say: 'I don't need to control everything. I only need to respond wisely.'",
        ],
      },
      midday: {
        title: "Acceptance Practice",
        steps: [
          "Identify one situation you wish were different right now",
          "For 5 minutes, practice accepting it exactly as it is — no fixing",
          "Notice what shifts when you stop fighting what is",
        ],
        timer: 300,
      },
      night: {
        title: "Body Scan Release",
        steps: [
          "Starting from your feet, scan upward noticing each body part",
          "At each area, consciously say 'release' and let tension soften",
          "Write: one worry I'm leaving in today, not carrying to tomorrow",
        ],
      },
    },
    day3: {
      morning: {
        title: "Non-Reactive Morning",
        steps: [
          "Check nothing for the first 30 minutes after waking",
          "When an urge to check arises, breathe through it instead",
          "Set your day's anchor phrase: 'Today I respond, I don't react.'",
        ],
      },
      midday: {
        title: "Stillness in Motion",
        steps: [
          "Walk for 8 minutes with nowhere to be — just walk",
          "Notice 3 things you normally rush past: a tree, a sound, a texture",
          "Return and write: what did slowness reveal?",
        ],
        timer: 480,
      },
      night: {
        title: "Grateful Letting Go",
        steps: [
          "Name 3 moments today when you successfully stayed calm",
          "Identify the trigger that tested you most — what did you learn?",
          "Complete: 'My nervous system is learning to...'",
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FOCUS PROGRAM - 9 Unique Tasks (3 days × 3 sessions)
  // Inspired by: Deep Work, Flow, Indistractable, Getting Things Done
  // ═══════════════════════════════════════════════════════════════════════════
  focus: {
    day1: {
      morning: {
        title: "Single Priority Lock",
        steps: [
          "Write ONE task that would make today a success — nothing else",
          "Close all unnecessary tabs and apps before you begin",
          "Speak your task aloud: 'Today I will complete: [task]'",
        ],
      },
      midday: {
        title: "25-Minute Deep Sprint",
        steps: [
          "Phone in another room. One tab open. Timer is running.",
          "Work on ONE thing only. Note every urge to switch — don't follow it",
          "After timer: write what you completed and what distracted you",
        ],
        timer: 1500,
      },
      night: {
        title: "Output Review",
        steps: [
          "Rate your focus today: drifting / partial / locked",
          "Name one specific behavior that reduced your focus",
          "Name one change you'll make tomorrow — be exact",
        ],
      },
    },
    day2: {
      morning: {
        title: "MIT Declaration",
        steps: [
          "Write your Most Important Task before touching any device",
          "Block your calendar: 90 minutes of 'deep work — unavailable'",
          "Create a physical barrier: put your phone in another room now",
        ],
      },
      midday: {
        title: "Flow State Entry",
        steps: [
          "Set a slightly challenging subtask — just beyond comfortable",
          "Work with zero interruptions. No checking anything.",
          "Notice when you lose yourself in the work — that's flow",
        ],
        timer: 1800,
      },
      night: {
        title: "Attention Audit",
        steps: [
          "List every interruption that broke your focus today",
          "Identify the top 2 attention thieves (apps, people, habits)",
          "Write one rule to protect tomorrow's focus time",
        ],
      },
    },
    day3: {
      morning: {
        title: "Environment Design",
        steps: [
          "Remove 3 distractions from your workspace before starting",
          "Set your phone to Do Not Disturb until noon",
          "Write: 'Between [time] and [time], I am unreachable for deep work.'",
        ],
      },
      midday: {
        title: "The Resistance Test",
        steps: [
          "Choose your hardest, most-avoided task",
          "Start it for just 15 minutes — no judgment on progress",
          "Log every thought that tried to pull you away",
        ],
        timer: 900,
      },
      night: {
        title: "Focus Identity Seal",
        steps: [
          "What was your longest uninterrupted work block this program?",
          "What conditions made deep focus possible?",
          "Complete: 'I am someone who protects their focus by...'",
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIDENCE PROGRAM - 9 Unique Tasks (3 days × 3 sessions)
  // Inspired by: Daring Greatly, The Confidence Code, Feel the Fear and Do It Anyway
  // ═══════════════════════════════════════════════════════════════════════════
  confidence: {
    day1: {
      morning: {
        title: "Bold Intention Setting",
        steps: [
          "Write one action you've been avoiding — commit to doing it today",
          "Say aloud: 'I am someone who follows through even when it's uncomfortable'",
          "List two decisions you've made recently — own them fully",
        ],
      },
      midday: {
        title: "Uncomfortable Action",
        steps: [
          "Have one conversation you've been putting off",
          "Take one action that requires you to be seen or heard",
          "Don't rehearse it — begin within 5 minutes of reading this",
        ],
        timer: 300,
      },
      night: {
        title: "Evidence Audit",
        steps: [
          "Write three things you DID today, even if small",
          "Name the moment you felt most like yourself",
          "What would tomorrow look like if you trusted yourself completely?",
        ],
      },
    },
    day2: {
      morning: {
        title: "Power Posture Practice",
        steps: [
          "Stand tall for 2 minutes: shoulders back, chin up, hands on hips",
          "Say: 'I take up space. My presence matters. My voice is valid.'",
          "Write one opinion you'll share today without apologizing for it",
        ],
      },
      midday: {
        title: "Rejection Immunity",
        steps: [
          "Ask for something you expect to be denied — practice hearing 'no'",
          "Make a request that feels slightly uncomfortable",
          "Note: how did you feel before, during, and after?",
        ],
        timer: 600,
      },
      night: {
        title: "Courage Inventory",
        steps: [
          "List 3 fears that held you back in the past month",
          "Circle one that shrank today — even slightly",
          "Write: 'The confident version of me would...'",
        ],
      },
    },
    day3: {
      morning: {
        title: "Speak First Protocol",
        steps: [
          "In your first meeting or conversation today, speak within the first 2 minutes",
          "Share an idea without prefacing it with 'This might be wrong, but...'",
          "Commit: 'Today I will not shrink. I will not apologize for existing.'",
        ],
      },
      midday: {
        title: "Visible Action",
        steps: [
          "Do something that puts you in front of others: post, present, or volunteer",
          "Send a message to someone you admire — introduce yourself",
          "Take the action you'd take if you knew you couldn't fail",
        ],
        timer: 900,
      },
      night: {
        title: "Self-Trust Ceremony",
        steps: [
          "List 5 times you followed through on what you said you'd do",
          "Name the part of yourself that showed up boldly these 3 days",
          "Complete: 'I now trust myself to...'",
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HEALING PROGRAM - 9 Unique Tasks (3 days × 3 sessions)
  // Inspired by: The Body Keeps the Score, Self-Compassion, When Things Fall Apart
  // ═══════════════════════════════════════════════════════════════════════════
  healing: {
    day1: {
      morning: {
        title: "Gentle Arrival",
        steps: [
          "Before checking anything — sit in 2 full minutes of stillness",
          "Place one hand on your chest. Feel your heartbeat.",
          "Say: 'I am safe. I am here. Today I begin gently.'",
        ],
      },
      midday: {
        title: "Nervous System Check",
        steps: [
          "Find a quiet spot — even for 8 minutes",
          "Notice where tension is held in your body right now",
          "Do nothing to fix it — only observe until it shifts",
        ],
        timer: 480,
      },
      night: {
        title: "Soften & Close",
        steps: [
          "Name one thing that felt heavy today — and release ownership of it",
          "What did your body need today that it didn't receive?",
          "Write: 'Tomorrow I will give myself permission to...'",
        ],
      },
    },
    day2: {
      morning: {
        title: "Compassionate Start",
        steps: [
          "Look in the mirror and say: 'I'm doing the best I can right now'",
          "Write 3 kind things you'd say to a friend going through what you are",
          "Choose one of those — say it to yourself out loud",
        ],
      },
      midday: {
        title: "Emotional Weather Report",
        steps: [
          "Name your current emotional state without judging it",
          "Where in your body do you feel this emotion?",
          "Sit with it for 5 minutes — emotions are visitors, not residents",
        ],
        timer: 300,
      },
      night: {
        title: "Grief & Gratitude",
        steps: [
          "Name one thing you're grieving — past or present",
          "Name one thing you're grateful for despite the pain",
          "Write: 'Both can be true. I can hold both.'",
        ],
      },
    },
    day3: {
      morning: {
        title: "Boundary Setting",
        steps: [
          "Identify one relationship or situation draining your energy",
          "Write one boundary you need — even if you can't enforce it yet",
          "Say: 'Protecting my peace is not selfish. It is necessary.'",
        ],
      },
      midday: {
        title: "Inner Child Check-In",
        steps: [
          "Close your eyes. Picture yourself at age 7.",
          "Ask that child: 'What do you need right now?'",
          "Give yourself that thing — rest, play, safety, or witness",
        ],
        timer: 600,
      },
      night: {
        title: "Integration Ceremony",
        steps: [
          "What did these 3 days surface that you were avoiding?",
          "What part of you feels slightly more safe now?",
          "Complete: 'I am healing because I chose to...'",
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DISCIPLINE PROGRAM - 9 Unique Tasks (3 days × 3 sessions)
  // Inspired by: Atomic Habits, Can't Hurt Me, The War of Art, Discipline Equals Freedom
  // ═══════════════════════════════════════════════════════════════════════════
  discipline: {
    day1: {
      morning: {
        title: "Execution Commitment",
        steps: [
          "Name the single most-avoided task on your list",
          "Set a time today — not a vague intention — to begin it",
          "Write: 'I start at [time]. No conditions. No negotiations.'",
        ],
      },
      midday: {
        title: "Do The Hard Thing",
        steps: [
          "Identify the task you're most likely to defer today",
          "Begin it now — not after this, not after that",
          "Run the timer. Start before you feel ready.",
        ],
        timer: 900,
      },
      night: {
        title: "Integrity Review",
        steps: [
          "Did you do the hard thing? Yes / Partially / No",
          "What story did you tell yourself to delay or avoid?",
          "Tomorrow: what's the FIRST thing you do within 60 seconds of waking?",
        ],
      },
    },
    day2: {
      morning: {
        title: "Non-Negotiables",
        steps: [
          "List 3 things you WILL do today — no matter what",
          "Rank them by difficulty. Start with the hardest.",
          "Say: 'Discipline is choosing what I want MOST over what I want NOW.'",
        ],
      },
      midday: {
        title: "Eat The Frog",
        steps: [
          "Your 'frog' is the task you dread most. Do it now.",
          "No preparation. No warm-up. Just execution.",
          "Track: how long from reading this to starting the task?",
        ],
        timer: 1200,
      },
      night: {
        title: "Excuse Elimination",
        steps: [
          "List every excuse you made today — no judgment, just honesty",
          "Circle the one that appeared most often",
          "Write a counter-statement that destroys that excuse for tomorrow",
        ],
      },
    },
    day3: {
      morning: {
        title: "5-Second Rule",
        steps: [
          "When you see what needs to be done today — count 5-4-3-2-1-GO",
          "Move your body toward the task within 5 seconds of the impulse",
          "Write: 'I act before my mind talks me out of it.'",
        ],
      },
      midday: {
        title: "Discomfort Tolerance",
        steps: [
          "Choose a physically or mentally uncomfortable task",
          "Stay in the discomfort for the full timer — no escape",
          "Note what your mind does when it wants to quit",
        ],
        timer: 900,
      },
      night: {
        title: "Discipline Identity Lock",
        steps: [
          "What did you do these 3 days that the old you would have avoided?",
          "What internal resistance did you overcome?",
          "Complete: 'I am someone who does hard things because...'",
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PURPOSE PROGRAM - 9 Unique Tasks (3 days × 3 sessions)
  // Inspired by: Man's Search for Meaning, Start With Why, The Alchemist, Ikigai
  // ═══════════════════════════════════════════════════════════════════════════
  purpose: {
    day1: {
      morning: {
        title: "Alignment Check",
        steps: [
          "Ask: does what I'm doing today connect to what matters to me?",
          "Write one value that should guide your decisions today",
          "Identify one thing you'll say NO to — because it costs you something real",
        ],
      },
      midday: {
        title: "Values-Led Decision",
        steps: [
          "Make one decision today using purpose — not convenience — as the filter",
          "Notice the gap between what you said matters and what you're doing",
          "Adjust one thing — even small — to close that gap",
        ],
        timer: 300,
      },
      night: {
        title: "Meaning Reflection",
        steps: [
          "What today felt purposeful — even for a moment?",
          "What felt hollow or off-track?",
          "Complete the sentence: 'My life is moving toward...'",
        ],
      },
    },
    day2: {
      morning: {
        title: "Why Excavation",
        steps: [
          "Write: 'Why do I want what I want?' — answer honestly",
          "Ask 'why' again. And again. Go 5 levels deep.",
          "At the core: what is the REAL purpose driving you?",
        ],
      },
      midday: {
        title: "Eulogy Exercise",
        steps: [
          "Write 3 sentences you'd want spoken about you at the end of your life",
          "Ask: is today's behavior earning those words?",
          "Adjust one action today to align with who you want to become",
        ],
        timer: 600,
      },
      night: {
        title: "Contribution Audit",
        steps: [
          "How did you contribute to others today — even in small ways?",
          "Purpose is often found in service. Where can you serve more?",
          "Write: 'I matter because I...'",
        ],
      },
    },
    day3: {
      morning: {
        title: "Legacy Visioning",
        steps: [
          "If you only had 3 years to live, what would you stop doing?",
          "What would you start doing immediately?",
          "Write the one project that would make those years meaningful",
        ],
      },
      midday: {
        title: "Purpose in Action",
        steps: [
          "Take one action that has no immediate personal benefit",
          "Help someone. Teach something. Give without expecting return.",
          "Notice how contribution affects your sense of meaning",
        ],
        timer: 900,
      },
      night: {
        title: "Direction Seal",
        steps: [
          "What did these 3 days reveal about what truly matters to you?",
          "Write your personal purpose statement in one sentence",
          "Complete: 'I know I'm on track when I feel...'",
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HABIT BUILDING PROGRAM - 9 Unique Tasks (3 days × 3 sessions)
  // Inspired by: Atomic Habits, The Power of Habit, Tiny Habits, The Compound Effect
  // ═══════════════════════════════════════════════════════════════════════════
  habit: {
    day1: {
      morning: {
        title: "Stack & Anchor",
        steps: [
          "Name the habit you're building — exactly",
          "Attach it to something you already do every morning",
          "Say: 'After I [anchor], I will [habit]. Every single day.'",
        ],
      },
      midday: {
        title: "Repetition Window",
        steps: [
          "This is your habit execution window — do it now",
          "Don't negotiate the timing or conditions",
          "Log: done / partial / missed — no judgment, just honest data",
        ],
        timer: 300,
      },
      night: {
        title: "Loop Review",
        steps: [
          "Did the habit happen today? Yes / Partly / No",
          "What made it easier today? What made it harder?",
          "Adjust one thing to make tomorrow's execution frictionless",
        ],
      },
    },
    day2: {
      morning: {
        title: "Environment Optimization",
        steps: [
          "Make your habit visible: put a physical reminder where you'll see it",
          "Make the opposite harder: add friction to bad habits",
          "Design your space so the right choice is the easy choice",
        ],
      },
      midday: {
        title: "Two-Minute Version",
        steps: [
          "Scale your habit down to 2 minutes or less",
          "Execute only the 2-minute version — nothing more",
          "Consistency matters more than intensity. Show up.",
        ],
        timer: 120,
      },
      night: {
        title: "Streak Tracking",
        steps: [
          "Mark today as done on a visible tracker (paper or digital)",
          "A streak broken isn't failure — missing twice in a row is",
          "Write: 'Tomorrow I protect my streak by...'",
        ],
      },
    },
    day3: {
      morning: {
        title: "Identity Reinforcement",
        steps: [
          "Don't say 'I'm trying to build a habit.' Say 'I am someone who [habit].'",
          "Write your new identity statement: 'I am a person who...'",
          "Every action is a vote for the person you're becoming",
        ],
      },
      midday: {
        title: "Habit Graduation",
        steps: [
          "Increase your habit slightly: more time, more reps, more depth",
          "If you walked 5 minutes, walk 7. If you read 1 page, read 2.",
          "Small progressions compound into transformation",
        ],
        timer: 420,
      },
      night: {
        title: "System Lock-In",
        steps: [
          "Write your complete habit system: Cue → Routine → Reward",
          "What will you do when motivation disappears? (It will.)",
          "Complete: 'This habit is now part of who I am because...'",
        ],
      },
    },
  },
};

export const QUOTES = {
  calm: [
    "Stillness is not the absence of action. It is the foundation of it.",
    "You cannot pour from an empty vessel. Rest is not retreat.",
    "The quieter you become, the more you can hear.",
  ],
  focus: [
    "Where attention goes, energy flows. Choose deliberately.",
    "One thing done deeply beats ten things done halfway.",
    "Clarity is not a gift. It is a practice.",
  ],
  confidence: [
    "Action is the antidote to every hesitation you've ever felt.",
    "The version of you that acts is always stronger than the one that waits.",
    "Confidence is built in the moments you chose to move anyway.",
  ],
  healing: [
    "You don't have to rush your becoming.",
    "The wound does not define you. What you do with it does.",
    "Gentle progress is still progress.",
  ],
  discipline: [
    "What you do when you don't feel like it defines who you are.",
    "Systems protect you from the version of yourself that wants to quit.",
    "Execute first. Motivation follows action — not the other way around.",
  ],
  purpose: [
    "A life without direction is a life spent reacting.",
    "Your actions are your autobiography. Write deliberately.",
    "Purpose is not found. It is built, decision by decision.",
  ],
  habit: [
    "You don't rise to the level of your goals. You fall to your systems.",
    "Repetition is not boring. It is how excellence is built.",
    "Small disciplines, repeated, produce extraordinary results.",
  ],
};

export const NOTIF_MSGS = {
  morning: { title: "Start your morning ritual.", body: "Your day begins with intention. Start now." },
  midday: { title: "Your midday reset is ready.", body: "Pause. Reset. Act." },
  night: { title: "Close your day with clarity.", body: "Your night session is now unlocked." },
  streak: { title: "You're building momentum.", body: "Consistency builds transformation." },
};
