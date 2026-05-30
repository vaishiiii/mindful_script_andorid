// 7-Day Healing Reset — structured program data
// Goal: Reduce emotional weight, increase internal safety, build gentle strength.

const paidProgramHealing7 = [
  {
    day: 1,
    morning: {
      title: "Name an Avoided Emotion",
      desc: "Create safety by acknowledging what you've been avoiding.",
      steps: [
        "Breathe: Inhale 4, hold 2, exhale 6 for 5 minutes",
        {
          type: 'text',
          text: 'What emotion have you been avoiding lately?',
          placeholder: 'Type the emotion here (e.g., sadness, anger, fear)...'
        },
        "Acknowledge it without judgment",
        {
          type: 'checkbox',
          text: 'I commit to noticing this emotion when it arises today'
        },
      ],
      timer: 300,
    },
    midday: {
      title: "Tidy a Small Space",
      desc: "External order creates internal calm.",
      steps: [
        "Take 3 deep breaths first",
        "Clean or organize one small physical space",
        "Move slowly and mindfully",
        {
          type: 'text',
          text: 'How does your body feel after organizing this space?',
          placeholder: 'Describe the sensation...'
        },
      ],
      timer: 300,
    },
    night: {
      title: "Daily Emotional Check-in",
      desc: "Reflect on your emotional experience today.",
      steps: [
        "Breathe deeply for 6 minutes first",
        {
          type: 'multiChoice',
          text: 'Did I allow myself to feel today?',
          options: ['Yes, I felt fully', 'Sometimes', 'No, I resisted']
        },
        {
          type: 'text',
          text: 'What emotion showed up most?',
          placeholder: 'Name the emotion...'
        },
        {
          type: 'multiChoice',
          text: 'Did I resist or allow it?',
          options: ['I allowed it', 'I resisted it', 'Both at different times'],
          note: 'Optional: What helped you allow it, or what made you resist?'
        },
      ],
    },
  },

  {
    day: 2,
    morning: {
      title: "Self-Compassion Practice",
      desc: "Learn to speak kindly to yourself.",
      steps: [
        "Breathe: Inhale 4, hold 2, exhale 6 for 5 minutes",
        "Say out loud: 'I am allowed to be healing at my own pace'",
        "Write one area where you're being too hard on yourself",
        "Imagine what you'd say to a friend in this situation",
        "Speak those words to yourself",
      ],
      timer: 300,
    },
    midday: {
      title: "Kind Act or Message",
      desc: "Practice giving and receiving kindness.",
      steps: [
        "Take 3 deep breaths",
        "Send a kind message to someone OR do one small act of care for yourself",
        "Notice any resistance to being kind",
        "Do it anyway",
      ],
      timer: 420,
    },
    night: {
      title: "Compassion Reflection",
      desc: "Notice how self-compassion changes your experience.",
      steps: [
        "Breathe deeply for 6 minutes",
        "Was I kinder to myself today?",
        "Where did self-criticism appear?",
        "Did compassion change anything?",
      ],
    },
  },

  {
    day: 3,
    morning: {
      title: "Notice Uncontrollable Thoughts",
      desc: "Release control and find peace.",
      steps: [
        "Breathe: Inhale 4, hold 2, exhale 6 for 5 minutes",
        "Write one thing you cannot control but keep thinking about",
        "Circle it on the paper",
        "Acknowledge: this is beyond my control",
      ],
      timer: 300,
    },
    midday: {
      title: "Take Controllable Action",
      desc: "Shift from helplessness to agency.",
      steps: [
        "Take 3 deep breaths",
        "Identify one small thing you CAN control today",
        "Do one action on it right now",
        "Notice how agency feels different from worry",
      ],
      timer: 300,
    },
    night: {
      title: "Control Release Reflection",
      desc: "Notice the lightness that comes with letting go.",
      steps: [
        "Breathe deeply for 6 minutes",
        "What did I try to control today?",
        "What happened when I released it?",
        "Did I feel lighter?",
      ],
    },
  },

  {
    day: 4,
    morning: {
      title: "Unsent Expression",
      desc: "Give voice to what needs to be said.",
      steps: [
        "Breathe: Inhale 4, hold 2, exhale 6 for 5 minutes",
        "Write one sentence you wish you could say to someone",
        "No sending required - this is just for you",
        "Read it aloud to yourself",
      ],
      timer: 300,
    },
    midday: {
      title: "Express a Small Truth",
      desc: "Practice authentic expression in real time.",
      steps: [
        "Take 3 deep breaths",
        "Express one small truth today",
        "Set a boundary, say no, or share an honest opinion",
        "Notice the fear that shows up",
        "Do it anyway with kindness",
      ],
      timer: 600,
    },
    night: {
      title: "Expression Reflection",
      desc: "Honor your courage in speaking your truth.",
      steps: [
        "Breathe deeply for 6 minutes",
        "Did I express myself authentically?",
        "What fear showed up?",
        "How did it feel after?",
      ],
    },
  },

  {
    day: 5,
    morning: {
      title: "Name a Past Moment",
      desc: "Identify what you're still carrying from the past.",
      steps: [
        "Breathe: Inhale 4, hold 2, exhale 6 for 5 minutes",
        "Write one past moment you still carry with you",
        "Be honest about its weight",
        "Fold the paper",
      ],
      timer: 300,
    },
    midday: {
      title: "Symbolic Release Ritual",
      desc: "Create physical closure for emotional healing.",
      steps: [
        "Take 3 deep breaths",
        "Tear the paper from this morning and throw it away",
        "OR place it somewhere final as a closure gesture",
        "Say: 'I release this'",
        "Notice what you feel",
      ],
      timer: 300,
    },
    night: {
      title: "Release Reflection",
      desc: "Honor what you've let go of.",
      steps: [
        "Breathe deeply for 6 minutes",
        "Did the release feel real?",
        "What emotion surfaced?",
        "What am I ready to let go of next?",
      ],
    },
  },

  {
    day: 6,
    morning: {
      title: "Identify Energy Drains",
      desc: "Protect your energy by knowing what depletes you.",
      steps: [
        "Breathe: Inhale 4, hold 2, exhale 6 for 5 minutes",
        "Write one situation that drains your energy",
        "Be specific about what makes it draining",
        "Consider: what boundary would protect me here?",
      ],
      timer: 300,
    },
    midday: {
      title: "Take a Boundary Action",
      desc: "Protect your energy with clear boundaries.",
      steps: [
        "Take 3 deep breaths",
        "Delay responding, say no, reduce engagement, or protect your time",
        "Choose one boundary action related to your morning's insight",
        "Notice the discomfort - it means you're changing",
      ],
      timer: 600,
    },
    night: {
      title: "Boundary Reflection",
      desc: "Notice the strength in protecting yourself.",
      steps: [
        "Breathe deeply for 6 minutes",
        "Did I protect my energy today?",
        "Was it uncomfortable?",
        "Did I feel stronger after?",
      ],
    },
  },

  {
    day: 7,
    morning: {
      title: "Write Your Healed Identity",
      desc: "Claim the version of you that has done this healing work.",
      steps: [
        "Breathe: Inhale 4, hold 2, exhale 6 for 6 minutes",
        "Write: 'The healed version of me is someone who...'",
        "Complete the sentence honestly",
        "Read it aloud three times",
        "Feel yourself becoming this person",
      ],
      timer: 360,
    },
    midday: {
      title: "Act Like Your Healed Self",
      desc: "Embody your healing through aligned action.",
      steps: [
        "Take 3 deep breaths",
        "Do one small action your 'healed self' would take",
        "Not dramatic - just aligned with who you're becoming",
        "Notice how it feels to act from your healing",
      ],
      timer: 300,
    },
    night: {
      title: "Week Integration",
      desc: "Reflect on your transformation this week.",
      steps: [
        "Breathe deeply for 8 minutes",
        "What changed this week?",
        "What resistance reduced?",
        "What strength increased?",
        "Who am I becoming?",
        "Celebrate your courage in showing up",
      ],
    },
  },
];

// Simple report structure guidance (directional insights only)
export const healing7ReportStructure = {
  show: [
    "emotionalAvoidanceTrend",
    "selfCompassionGrowth",
    "boundaryExecutionRate",
    "actionCompletionPercent",
  ],
  recommendedNextProgram: "21-Day Emotional Resilience",
  notes: "Keep analytics minimal — directional insights, not heavy numbers.",
};

export default paidProgramHealing7;
