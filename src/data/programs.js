export const PROGRAMS = [
  {
    id: "calm",
    label: "Calm",
    icon: "◎",
    desc: "Quiet the reactive mind",
    color: "#9BB5B8",
    bg: "#EBF3F4",
    identity: "The Steady Seeker",
    identityDesc:
      "You carry quiet weight daily. Your nervous system deserves a deliberate reset. This program builds the capacity to regulate, respond — not react — and find stillness as your default state.",
  },
  {
    id: "focus",
    label: "Focus",
    icon: "⟡",
    desc: "Build sustained attention",
    color: "#8E9EC4",
    bg: "#ECEEF5",
    identity: "The Scattered Mind",
    identityDesc:
      "You have depth and capability — but attention scatters before execution completes. This program rebuilds single-task focus and the discipline to finish what you begin.",
  },
  {
    id: "confidence",
    label: "Confidence",
    icon: "◈",
    desc: "Rebuild self-trust",
    color: "#C4A882",
    bg: "#F5F0E8",
    identity: "The Confidence Seeker",
    identityDesc:
      "You hold strong potential but hesitate before bold action. This program strengthens decisiveness, self-trust, and the ability to move through uncertainty with full clarity.",
  },
  {
    id: "healing",
    label: "Healing",
    icon: "❧",
    desc: "Restore nervous system safety",
    color: "#A8B89E",
    bg: "#EDF2EB",
    identity: "The Quiet Recoverer",
    identityDesc:
      "Beneath the surface, you carry unprocessed weight. This program creates structured space to release, process, and return to a grounded baseline — gently but deliberately.",
  },
  {
    id: "discipline",
    label: "Discipline",
    icon: "▣",
    desc: "Close the intention-action gap",
    color: "#7A8EA0",
    bg: "#EBF0F5",
    identity: "The Stalled Executor",
    identityDesc:
      "The gap between knowing and doing costs you daily. This program installs the behavioral structures that convert intention into consistent, repeatable action.",
  },
  {
    id: "purpose",
    label: "Purpose",
    icon: "◉",
    desc: "Align actions with deeper values",
    color: "#B89EC4",
    bg: "#F2EDF5",
    identity: "The Direction Seeker",
    identityDesc:
      "You move fast but sometimes question where you're going. This program clarifies what matters, realigns your daily actions, and anchors you to a compelling direction.",
  },
  {
    id: "habit",
    label: "Habit Building",
    icon: "⌘",
    desc: "Install durable behaviors",
    color: "#9EB8A0",
    bg: "#EDF5EE",
    identity: "The Inconsistent Builder",
    identityDesc:
      "You start strong and fade. This program targets the exact phase where habits collapse — and builds the repetition structures that make new behaviors automatic.",
  },
];

export const PAID_PROGRAMS = {
  calm: [
    { title: "7-Day Nervous System Reset", dur: "7 Days", desc: "Deep somatic regulation with escalating breath protocols." },
    { title: "21-Day Calm Architecture", dur: "21 Days", desc: "Rebuild your stress baseline through structured daily rituals." },
    { title: "30-Day Regulation Master", dur: "30 Days", desc: "Full nervous system rewire with weekly AI behavioral reports." },
  ],
  focus: [
    { title: "5-Day Attention Rebuild", dur: "5 Days", desc: "Intensive focus restoration with progressive sprint sessions." },
    { title: "21-Day Deep Work Protocol", dur: "21 Days", desc: "Install deep work as your default operating mode." },
    { title: "30-Day Focus Transformation", dur: "30 Days", desc: "Complete cognitive performance overhaul with adaptive tasks." },
  ],
  confidence: [
    { title: "5-Day Bold Reset", dur: "5 Days", desc: "Five days of discomfort exposure and self-trust building." },
    { title: "7-Day Inner Authority", dur: "7 Days", desc: "Build the decision-making muscle and reduce self-doubt." },
    { title: "21-Day Identity Rewire", dur: "21 Days", desc: "Root-level confidence reconstruction over 21 structured days." },
  ],
  healing: [
    { title: "7-Day Gentle Reset", dur: "7 Days", desc: "Slow, safe, trauma-informed daily ritual sequence." },
    { title: "21-Day Restoration Arc", dur: "21 Days", desc: "Systematic emotional processing and nervous system healing." },
  ],
  discipline: [
    { title: "5-Day Execution Intensive", dur: "5 Days", desc: "Close the intention-action gap in five focused days." },
    { title: "30-Day Discipline Engine", dur: "30 Days", desc: "Build iron behavioral consistency with escalating challenge." },
  ],
  purpose: [
    { title: "7-Day Clarity Sprint", dur: "7 Days", desc: "Structured values clarification and daily alignment exercises." },
    { title: "21-Day Purpose Architecture", dur: "21 Days", desc: "Build a life structure anchored to what genuinely matters." },
  ],
  habit: [
    { title: "5-Day Habit Forge", dur: "5 Days", desc: "Install one core habit with scientific precision." },
    { title: "21-Day Habit Stack", dur: "21 Days", desc: "Stack three durable habits using behavioral chaining." },
    { title: "30-Day Behavior Overhaul", dur: "30 Days", desc: "Full behavioral ecosystem design and installation." },
  ],
};

export default PROGRAMS;
