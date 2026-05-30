// 7-Day Nervous System Reset (Calm) — Deep somatic regulation
// Goal: Reset stress baseline through breath protocols and regulation practices

const paidProgramCalm7 = [
  {
    day: 1,
    morning: {
      title: "Grounding Foundation",
      desc: "Establish your baseline and create internal safety.",
      steps: [
        "Sit with feet flat on the floor",
        "Notice where your body makes contact with the ground",
        "Breathe: Inhale 4, hold 2, exhale 6 for 5 minutes",
        "Say aloud: 'I am safe in this moment'",
        "Set intention: Today I prioritize my nervous system",
      ],
      timer: 300,
    },
    midday: {
      title: "Sensory Grounding Practice",
      desc: "Use your senses to anchor into the present moment.",
      steps: [
        "Pause wherever you are",
        "Notice 5 things you can see",
        "4 things you can touch or feel",
        "3 things you can hear",
        "2 things you can smell",
        "1 thing you can taste",
        "Take 3 deep breaths between each sense",
      ],
      timer: 600,
    },
    night: {
      title: "Baseline Stress Assessment",
      desc: "Establish your starting point for the week.",
      steps: [
        {
          type: 'multiChoice',
          text: 'Rate your overall stress today:',
          options: ['1-2 (Very Calm)', '3-4 (Mostly Calm)', '5-6 (Moderate)', '7-8 (High)', '9-10 (Overwhelmed)']
        },
        {
          type: 'text',
          text: 'Where do you feel tension in your body?',
          placeholder: 'Example: jaw, shoulders, chest, stomach...'
        },
        {
          type: 'text',
          text: 'What triggered your stress response most today?',
          placeholder: 'Describe the trigger...'
        },
        {
          type: 'text',
          text: 'Write: One moment today when I felt calm',
          placeholder: 'Describe that peaceful moment...'
        },
        {
          type: 'checkbox',
          text: 'I acknowledge this is my starting baseline, and it will shift'
        },
      ],
    },
  },

  {
    day: 2,
    morning: {
      title: "Extended Exhale Activation",
      desc: "Activate your parasympathetic nervous system.",
      steps: [
        "Sit comfortably with spine straight",
        "Breathe: Inhale for 4 counts through nose",
        "Exhale for 8 counts through mouth (twice as long)",
        "Repeat for 8 cycles without rushing",
        "Notice: Your body begins to settle when exhales lengthen",
      ],
      timer: 480,
    },
    midday: {
      title: "Deliberate Slowdown",
      desc: "Move at 50% speed to interrupt urgency patterns.",
      steps: [
        "For the next hour, do everything at half your normal pace",
        "Walk slower, type slower, speak slower, eat slower",
        "Notice the urge to speed up — breathe through it",
        {
          type: 'text',
          text: 'What do you normally miss when rushing?',
          placeholder: 'What details, feelings, or moments pass you by...'
        },
        {
          type: 'checkbox',
          text: 'I allow slowness to feel safe, not lazy'
        },
      ],
      timer: 3600,
    },
    night: {
      title: "Body Tension Scan",
      desc: "Map and release held stress in your body.",
      steps: [
        "Lie down or sit comfortably",
        "Starting from your head, scan slowly down to your toes",
        "Notice each area: jaw, neck, shoulders, chest, belly, legs",
        "When you find tension, breathe into it for 30 seconds",
        "On each exhale, consciously release and soften",
        {
          type: 'text',
          text: 'Write: Where I hold the most stress today',
          placeholder: 'Which body part holds the most tension?'
        },
      ],
    },
  },

  {
    day: 3,
    morning: {
      title: "Box Breathing Reset",
      desc: "Create equilibrium and mental calm through equal breathing.",
      steps: [
        "Breathe in a square pattern:",
        "Inhale for 4 counts",
        "Hold for 4 counts",
        "Exhale for 4 counts",
        "Hold empty for 4 counts",
        "Repeat for 10 cycles",
        "Notice: Equal breathing creates equal mind state",
      ],
      timer: 600,
    },
    midday: {
      title: "Nature Regulation",
      desc: "Let nature regulate your nervous system.",
      steps: [
        "Go outside for 10 minutes (or look out a window)",
        "Find something natural: tree, sky, plant, bird",
        "Match your breath to its rhythm",
        "Trees sway slowly — breathe slowly",
        "Notice your system synchronizing with nature",
        "Return feeling more regulated",
      ],
      timer: 600,
    },
    night: {
      title: "Worry Release Ritual",
      desc: "Consciously set aside what you cannot control tonight.",
      steps: [
        {
          type: 'text',
          text: 'List each worry on paper (one per line)',
          placeholder: 'Write your worries here, one per line...'
        },
        "For each: Ask 'Can I solve this right now?'",
        "If no, fold the paper and set it aside",
        {
          type: 'checkbox',
          text: 'I release these worries until tomorrow'
        },
        "Notice: Your job is not to carry everything at once",
      ],
    },
  },

  {
    day: 4,
    morning: {
      title: "Coherence Breathing",
      desc: "Optimize heart rate variability for regulation.",
      steps: [
        "Breathe at 5 seconds in, 5 seconds out",
        "This creates 6 breaths per minute (optimal HRV)",
        "Continue for 10 minutes",
        "Let thoughts come and go, just breathe",
        "Notice: Coherent breathing = coherent nervous system",
      ],
      timer: 600,
    },
    midday: {
      title: "Midday Pause Practice",
      desc: "Install regulation checkpoints throughout your day.",
      steps: [
        "Set 3 alarms at random times this afternoon",
        "When each rings: Stop everything",
        "Take 3 deep belly breaths",
        "Check: Where is tension? Release shoulders, jaw, belly",
        "Continue your day from a calmer baseline",
      ],
      timer: 180,
    },
    night: {
      title: "Calm Moments Journal",
      desc: "Train your brain to notice calm, not just stress.",
      steps: [
        {
          type: 'text',
          text: 'List 5 calm moments from today (even 10-second moments count)',
          placeholder: '1.\n2.\n3.\n4.\n5.'
        },
        {
          type: 'text',
          text: 'For each: What made it calm?',
          placeholder: 'What created that peaceful feeling?'
        },
        {
          type: 'multiChoice',
          text: 'Can you recreate that feeling right now with breath?',
          options: ['Yes, I feel it now', 'Partially', 'Not yet, but trying'],
          note: 'Optional: Describe the sensation'
        },
      ],
    },
  },

  {
    day: 5,
    morning: {
      title: "Alternate Nostril Breathing",
      desc: "Balance nervous system hemispheres for deep calm.",
      steps: [
        "Sit comfortably, close your eyes",
        "Close right nostril, inhale through left for 4",
        "Close both, hold for 4",
        "Close left nostril, exhale through right for 6",
        "Inhale through right for 4, hold 4, exhale left for 6",
        "Repeat for 5 minutes",
        "Notice: Mind quiets, system balances",
      ],
      timer: 300,
    },
    midday: {
      title: "Screen-Free Window",
      desc: "Give your nervous system a break from digital stimulation.",
      steps: [
        "Put all devices in another room for 1 hour",
        "Do something analog: read, walk, draw, write",
        "Notice your body's response to disconnection",
        "What discomfort arises? Breathe through it",
        "Feel the relief as your system settles",
      ],
      timer: 3600,
    },
    night: {
      title: "Stress Shift Reflection",
      desc: "Notice how your baseline has shifted.",
      steps: [
        "Compare your stress now to Day 1",
        {
          type: 'text',
          text: 'What practices are helping most?',
          placeholder: 'Which techniques resonate with you?'
        },
        {
          type: 'text',
          text: 'Which regulation tools feel natural?',
          placeholder: 'What feels easy and intuitive now?'
        },
        {
          type: 'multiChoice',
          text: 'Rate your overall calm: (notice the shift from Day 1)',
          options: ['1-2 (Very Calm)', '3-4 (Mostly Calm)', '5-6 (Moderate)', '7-8 (High)', '9-10 (Overwhelmed)']
        },
      ],
    },
  },

  {
    day: 6,
    morning: {
      title: "Resonant Frequency Breathing",
      desc: "Find your personal optimal breath rate.",
      steps: [
        "Experiment with different breath patterns:",
        "Try 4 in / 6 out for 2 minutes",
        "Try 5 in / 5 out for 2 minutes",
        "Try 6 in / 6 out for 2 minutes",
        "Notice which feels most calming to YOUR system",
        "Practice your optimal pattern for 5 more minutes",
        "This is your personal regulation breath",
      ],
      timer: 660,
    },
    midday: {
      title: "Somatic Shaking Release",
      desc: "Release stored stress through gentle movement.",
      steps: [
        "Stand with feet shoulder-width apart",
        "Gently shake your whole body for 3 minutes",
        "Start small, let it build naturally",
        "Shake out your hands, arms, legs, torso",
        "Stop abruptly and notice the stillness",
        "Your nervous system just released stored activation",
      ],
      timer: 360,
    },
    night: {
      title: "Calm Anchor Creation",
      desc: "Design a personal regulation ritual you can use anytime.",
      steps: [
        "Choose your 3 favorite practices from this week",
        {
          type: 'text',
          text: 'Write your custom 5-minute ritual (Example: 3 deep breaths + body scan + calm phrase)',
          placeholder: 'My ritual: 1.\n2.\n3.'
        },
        "Practice your custom ritual now",
        {
          type: 'checkbox',
          text: 'I commit to using this calm anchor when I need it'
        },
        "This is your portable calm anchor",
      ],
    },
  },

  {
    day: 7,
    morning: {
      title: "Integration Breath Practice",
      desc: "Anchor your new regulated baseline.",
      steps: [
        "Practice your personal regulation breath for 10 minutes",
        "With each inhale, think: 'I am safe'",
        "With each exhale, think: 'I release tension'",
        "Notice how natural regulation feels now",
        "This is your new baseline",
      ],
      timer: 600,
    },
    midday: {
      title: "Real-World Regulation Test",
      desc: "Apply your tools during actual stress.",
      steps: [
        "When stress appears today, use your full toolkit",
        "Pause, breathe, ground, notice, release",
        "See how automatic these responses are becoming",
        "Trust your nervous system's new capacity",
        "You can regulate yourself — you've proven it",
      ],
    },
    night: {
      title: "Week Completion Reflection",
      desc: "Celebrate your nervous system transformation.",
      steps: [
        {
          type: 'text',
          text: 'Compare Day 7 you to Day 1 you — what shifted?',
          placeholder: 'What changes do you notice in yourself?'
        },
        {
          type: 'multiChoice',
          text: 'Rate your stress baseline now vs. Day 1',
          options: ['Much calmer', 'Noticeably calmer', 'Slightly calmer', 'About the same']
        },
        {
          type: 'text',
          text: 'Which practices will you continue?',
          placeholder: 'List the practices you want to keep...'
        },
        {
          type: 'text',
          text: "Write: 'My nervous system has learned to...'",
          placeholder: 'Complete the sentence...'
        },
        {
          type: 'checkbox',
          text: 'I acknowledge: I showed up for myself for 7 days'
        },
      ],
    },
  },
];

export default paidProgramCalm7;
