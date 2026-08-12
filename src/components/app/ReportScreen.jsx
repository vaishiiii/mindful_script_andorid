import React, { useMemo, useState } from 'react';
import { Card, Tag } from '@/components/ui';
import { PROGRAMS, PAID_PROGRAMS } from '@/data/programs';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { jsPDF } from 'jspdf';

// ─── Expanded Word Banks ──────────────────────────────────────────────────────
const WORD_BANK = {
  positive: ['calm', 'peaceful', 'relaxed', 'happy', 'grateful', 'content', 'confident', 'strong',
    'focused', 'clear', 'better', 'good', 'joy', 'hopeful', 'energized', 'motivated', 'proud',
    'inspired', 'balanced', 'centered', 'present', 'grounded', 'alive', 'refreshed', 'free'],
  challenging: ['anxious', 'stressed', 'worried', 'overwhelmed', 'difficult', 'hard', 'struggle',
    'tired', 'confused', 'frustrated', 'angry', 'sad', 'fear', 'lonely', 'distracted', 'procrastinat',
    'numb', 'stuck', 'resistance', 'doubt', 'exhausted', 'drained', 'unmotivated'],
  clarity: ['realized', 'noticed', 'understand', 'insight', 'clarity', 'aware', 'pattern', 'learned',
    'shift', 'breakthrough', 'perspective', 'recognition', 'aha', 'see now', 'finally', 'connected'],
  growth: ['growing', 'improving', 'progress', 'developing', 'building', 'stronger', 'changed', 'transformed'],
};

const PROGRAM_GUIDANCE = {
  calm: {
    focus: 'nervous system regulation',
    nextProgram: '21-Day Calm Architecture',
    nextDesc: 'Deepen regulation through advanced somatic practices and stress inoculation.',
    suggestions: [
      'Use a 2-minute downshift before high-stress transitions: longer exhale than inhale to lower activation.',
      'Create a nightly wind-down boundary: no stimulating inputs for 20 minutes before sleep.',
      'Name the feeling, then name the need — this reduces emotional reactivity and improves recovery speed.',
    ],
    psychInsight: 'Your nervous system has begun recalibrating its threat baseline. The calm you practise is neurologically encoding itself as your new default — not a temporary state you visit, but a capacity you own.',
  },
  focus: {
    focus: 'attention stability',
    nextProgram: '21-Day Deep Work Protocol',
    nextDesc: 'Install deep work as your default cognitive operating mode.',
    suggestions: [
      'Run one 25-minute single-task sprint daily with all notifications off and one clear outcome.',
      'Before each session, write your next most important action in one sentence to reduce drift.',
      'Use "start small" entries: if resistance appears, commit to just 5 minutes, then continue if momentum builds.',
    ],
    psychInsight: 'Sustained attention is a trainable muscle, not a fixed trait. The focus you have been practising is rebuilding the prefrontal circuits responsible for deep work — the neural basis of your most meaningful output.',
  },
  confidence: {
    focus: 'self-trust and decisive action',
    nextProgram: '21-Day Identity Rewire',
    nextDesc: 'Root-level confidence reconstruction — rewire the self-concept, not just the behaviour.',
    suggestions: [
      'Capture one small daily promise and complete it the same day to build self-trust evidence.',
      'When self-doubt appears, replace it with one fact from your recent wins journal.',
      'Use action-first confidence: take one visible step before overthinking the full result.',
    ],
    psychInsight: 'Confidence is not a personality trait — it is a pattern of kept promises to yourself. Every session you completed is an entry in your internal evidence file that says: "I do what I say I will do."',
  },
  healing: {
    focus: 'emotional safety and recovery',
    nextProgram: '21-Day Restoration Arc',
    nextDesc: 'Systematic emotional processing and deep nervous system repair.',
    suggestions: [
      'Practice gentle pacing: alternate emotionally heavy work with grounding activities in the same day.',
      'When difficult feelings arise, use self-compassion language: "This is hard, and I can support myself through it."',
      'Track triggers and soothing responses together so recovery becomes intentional, not accidental.',
    ],
    psychInsight: 'Healing is not linear — it moves in spirals. What feels like revisiting the same territory is often deeper processing at a new level of capacity. Your willingness to stay present with discomfort is itself the medicine.',
  },
  discipline: {
    focus: 'follow-through consistency',
    nextProgram: '30-Day Discipline Engine',
    nextDesc: 'Build iron behavioural consistency with escalating challenge tiers.',
    suggestions: [
      'Attach practice to a non-negotiable anchor (wake-up, first coffee, or desk-start) to reduce missed days.',
      'Use implementation intentions: "If it is 7:00 AM, then I begin my first session."',
      'Score your daily execution on process, not mood — discipline must not depend on motivation.',
    ],
    psychInsight: 'Discipline is the bridge between intention and identity. You are no longer someone who wants to be consistent — you are building the neural grooves of someone who simply is. The gap closes one session at a time.',
  },
  purpose: {
    focus: 'values-aligned direction',
    nextProgram: '21-Day Purpose Architecture',
    nextDesc: 'Build a life structure anchored to what genuinely matters most.',
    suggestions: [
      'At day start, choose one action that expresses your core value today, not just urgent work.',
      'Review weekly: which activities gave energy versus drained meaning, then rebalance next week.',
      'Turn insights into commitments with a "why-this-matters" sentence before each key task.',
    ],
    psychInsight: 'Clarity of purpose acts as an internal GPS — it does not remove the obstacles but makes the direction unmistakable. The reflection work you have done is beginning to surface what was always true but buried under noise.',
  },
  habit: {
    focus: 'automatic behaviour formation',
    nextProgram: '21-Day Habit Stack',
    nextDesc: 'Stack three durable habits using behavioural chaining and identity anchoring.',
    suggestions: [
      'Use cue-routine-reward: keep the cue fixed, make the routine tiny, and celebrate immediately.',
      'Lower friction for good habits by preparing the environment the night before.',
      'Track streak resilience: focus on never missing twice rather than chasing a perfect streak.',
    ],
    psychInsight: "A habit is a decision you no longer have to make. Your basal ganglia — the brain's habit engine — is encoding your repetitions as automatic responses. The 40–66 day mark is where the real automaticity locks in.",
  },
};

const PROGRAM_SCORING = {
  calm:       { actionWeight: 0.62, reflectionWeight: 0.28, sessionWeight: 0.1, reflectionMultiplier: 1.1,  emphasis: 'Regulation improves when evening decompression stays consistent.' },
  focus:      { actionWeight: 0.7,  reflectionWeight: 0.2,  sessionWeight: 0.1, reflectionMultiplier: 1.05, emphasis: 'Morning execution is the strongest predictor for focus outcomes.' },
  confidence: { actionWeight: 0.72, reflectionWeight: 0.18, sessionWeight: 0.1, reflectionMultiplier: 1.0,  emphasis: 'Visible daily action compounds self-trust quickly.' },
  healing:    { actionWeight: 0.5,  reflectionWeight: 0.4,  sessionWeight: 0.1, reflectionMultiplier: 1.25, emphasis: 'Depth of reflection matters as much as session completion.' },
  discipline: { actionWeight: 0.78, reflectionWeight: 0.12, sessionWeight: 0.1, reflectionMultiplier: 0.95, emphasis: 'Reliability and repetition are the core discipline signals.' },
  purpose:    { actionWeight: 0.56, reflectionWeight: 0.34, sessionWeight: 0.1, reflectionMultiplier: 1.2,  emphasis: 'Clarity language and reflection depth indicate stronger alignment.' },
  habit:      { actionWeight: 0.74, reflectionWeight: 0.16, sessionWeight: 0.1, reflectionMultiplier: 1.0,  emphasis: 'Stable repetition across days is the key habit marker.' },
  default:    { actionWeight: 0.65, reflectionWeight: 0.25, sessionWeight: 0.1, reflectionMultiplier: 1.0,  emphasis: 'Balanced execution and reflection drive progress.' },
};

const PROGRAM_THEME_WORDS = {
  calm:       ['calm', 'peace', 'soft', 'ease', 'grounded', 'breathe'],
  focus:      ['focus', 'clarity', 'deep work', 'attention', 'single-task', 'distracted'],
  confidence: ['confident', 'bold', 'courage', 'trust', 'speak up', 'decide'],
  healing:    ['heal', 'grief', 'pain', 'gentle', 'safe', 'release'],
  discipline: ['consistent', 'routine', 'commit', 'show up', 'follow through', 'execute'],
  purpose:    ['purpose', 'meaning', 'value', 'direction', 'aligned', 'mission'],
  habit:      ['habit', 'repeat', 'automatic', 'cue', 'routine', 'streak'],
};

const countMatches = (text, words) => words.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);

// ─── Behavioural Archetype ────────────────────────────────────────────────────
const getBehavioralArchetype = (program, completionRate, signals) => {
  const a = {
    disciplinedExecutor:  { name: 'The Disciplined Executor',   icon: '⚡', desc: 'You show up with precision. High action, low verbal processing — your growth language is doing, not describing. You thrive on systems and reliable outputs.',                                              trait1: 'Action-oriented',   trait2: 'Systematic',       trait3: 'Reliable'        },
    reflectiveProcessor:  { name: 'The Reflective Processor',   icon: '🌀', desc: 'You think your way into transformation. Rich inner language, nuanced reflection, and pattern recognition are your growth instruments. You need space to integrate.',                                       trait1: 'Introspective',     trait2: 'Pattern-aware',    trait3: 'Depth-seeking'   },
    resilientPusher:      { name: 'The Resilient Pusher',       icon: '🔥', desc: 'You do the work even when it hurts. High challenge language paired with continued action signals exceptional psychological resilience and a tolerance for discomfort.',                                    trait1: 'Resilient',         trait2: 'Gritty',           trait3: 'Persistent'      },
    breakthroughSeeker:   { name: 'The Breakthrough Seeker',    icon: '💡', desc: 'You are chasing transformation, not just results. Clarity-dense language and insight moments define your arc. You are drawn to the why beneath the what.',                                              trait1: 'Insight-driven',    trait2: 'Curious',          trait3: 'Growth-hungry'   },
    emergingStabilizer:   { name: 'The Emerging Stabilizer',    icon: '🌱', desc: 'You are building your foundation. The early phase of any deep change brings friction — your data shows you are still in the initiation arc. Every session is a deposit.',                              trait1: 'Building',          trait2: 'Committed',        trait3: 'Learning'        },
    consistentBuilder:    { name: 'The Consistent Builder',     icon: '🏗', desc: 'Steady, measured, reliable. Your progress may not feel dramatic but the neurological accumulation is significant. You are the profile most likely to sustain change long term.',                         trait1: 'Steady',            trait2: 'Long-term focused', trait3: 'Process-oriented' },
  };
  if (completionRate >= 80 && signals.clarity >= 3)                                   return a.breakthroughSeeker;
  if (completionRate >= 80 && signals.positive > signals.challenging)                  return a.disciplinedExecutor;
  if (completionRate >= 70 && signals.challenging >= signals.positive)                 return a.resilientPusher;
  if (signals.totalEntries >= 5 && signals.clarity >= 2 && completionRate >= 50)       return a.reflectiveProcessor;
  if (completionRate >= 60)                                                             return a.consistentBuilder;
  return a.emergingStabilizer;
};

// ─── Transformation Stage ─────────────────────────────────────────────────────
const getTransformationStage = (readinessScore, completionRate, reflectionDepth) => {
  const stages = [
    { name: 'Awareness',       color: '#A67B7B', pct: 10, desc: 'You have begun to map the territory of change. The most important step — starting — is complete.',                                                                        next: 'Build a non-negotiable daily anchor session.' },
    { name: 'Experimentation', color: '#B5956A', pct: 30, desc: 'You are testing what works. Your system is absorbing new inputs and beginning to differentiate response patterns.',                                                         next: 'Increase consistency in your highest-impact session time.' },
    { name: 'Integration',     color: '#8E9EC4', pct: 56, desc: 'New behaviours are merging with your existing identity. Resistance is decreasing. You are consolidating gains.',                                                          next: 'Begin layering complexity — add one intentional challenge per week.' },
    { name: 'Consolidation',   color: '#9BB5B8', pct: 78, desc: 'The practices are becoming automatic. Your baseline state has measurably shifted. You are rewiring, not just practising.',                                               next: 'Prepare for the next programme level to sustain the trajectory.' },
    { name: 'Mastery',         color: '#7A9E87', pct: 94, desc: 'You have embodied the practice. The change is not what you do — it is who you are. The next frontier is depth, not breadth.',                                           next: 'Move to advanced-level programming to continue neurological deepening.' },
  ];
  const score = Math.round((readinessScore + completionRate + Math.min(reflectionDepth, 100)) / 3);
  if (score >= 87) return stages[4];
  if (score >= 75) return stages[3];
  if (score >= 60) return stages[2];
  if (score >= 40) return stages[1];
  return stages[0];
};

// ─── Emotional Intelligence Score ────────────────────────────────────────────
const getEQScore = (signals, journalEntries, activeProgramDuration) => {
  const selfAwareness    = Math.min(30, (signals.clarity * 5) + (journalEntries.length * 2));
  const emotionVocab     = Math.min(25, ((signals.positive + signals.challenging) * 2));
  const regulationSignal = Math.min(25, signals.positive >= signals.challenging ? 20 + signals.positive : 10 + signals.positive);
  const engagement       = Math.min(20, Math.round((journalEntries.length / Math.max(1, activeProgramDuration)) * 20));
  return Math.min(100, selfAwareness + emotionVocab + regulationSignal + engagement);
};

// ─── Resilience Index ─────────────────────────────────────────────────────────
const getResilienceIndex = (allDayCompletions) => {
  let recoveries = 0; let gaps = 0;
  for (let i = 1; i < allDayCompletions.length; i++) {
    const prev = allDayCompletions[i - 1];
    const cur  = allDayCompletions[i];
    const pS = prev ? (prev.morning?1:0)+(prev.midday?1:0)+(prev.night?1:0) : 0;
    const cS = cur  ? (cur.morning ?1:0)+(cur.midday ?1:0)+(cur.night ?1:0) : 0;
    if (pS < 2 && cS >= 2) recoveries++;
    if (pS < 2) gaps++;
  }
  if (gaps === 0) return 95;
  return Math.min(100, Math.round(50 + (recoveries / gaps) * 50));
};

// ─── Emotional Trajectory ─────────────────────────────────────────────────────
const getEmotionalTrajectory = (journalEntries) => {
  if (journalEntries.length < 2) return { trend: 'insufficient data', change: 0 };
  const half = Math.ceil(journalEntries.length / 2);
  const early   = journalEntries.slice(0, half).map(e => e.text.toLowerCase()).join(' ');
  const recent  = journalEntries.slice(half).map(e => e.text.toLowerCase()).join(' ');
  const change  = (countMatches(recent, WORD_BANK.positive) - countMatches(recent, WORD_BANK.challenging))
                - (countMatches(early,  WORD_BANK.positive) - countMatches(early,  WORD_BANK.challenging));
  if (change > 2)  return { trend: 'strongly improving',  change };
  if (change > 0)  return { trend: 'gradually improving', change };
  if (change === 0)return { trend: 'stable',              change };
  if (change > -2) return { trend: 'mild regression',     change };
  return               { trend: 'stress-heavy period', change };
};

const getMitigationSuggestions = (signals, program) => {
  const suggestions = [];
  const pack = PROGRAM_GUIDANCE[program];
  if (signals.challenging >= signals.positive)
    suggestions.push('When stress spikes, run a 60-second reset: inhale for 4, exhale for 6, repeat 6 rounds before responding.');
  if (signals.focusSessions < 2)
    suggestions.push('Anchor your practice to one fixed daily trigger (e.g., right after brushing teeth) to reduce decision fatigue.');
  if (signals.clarity < 2)
    suggestions.push('End each night with one prompt: "What pattern did I notice today, and what one action will I repeat tomorrow?"');
  if (pack?.suggestions?.length) suggestions.push(...pack.suggestions);
  if (suggestions.length === 0)
    suggestions.push('Your trend is strong. Keep the same rhythm and add one intentional pause before your most stressful moment each day.');
  return Array.from(new Set(suggestions)).slice(0, 4);
};

const getSessionConsistencyScore = (program, completionRates) => {
  const r = completionRates;
  if (program === 'focus')                         return Math.round((r.morning*0.5)+(r.midday*0.35)+(r.night*0.15));
  if (program === 'discipline'||program === 'habit') return Math.round((r.morning+r.midday+r.night)/3);
  if (program === 'healing'||program === 'calm')   return Math.round((r.morning*0.2)+(r.midday*0.3)+(r.night*0.5));
  if (program === 'purpose')                       return Math.round((r.morning*0.25)+(r.midday*0.25)+(r.night*0.5));
  return Math.round((r.morning*0.4)+(r.midday*0.35)+(r.night*0.25));
};

const buildDailyMoodLog = (moodHistory = [], totalDays = 3) => {
  const latestByDay = new Map();

  moodHistory.forEach((entry) => {
    const day = Number(entry?.day || 0);
    if (!day || day < 1 || day > totalDays) {
      return;
    }
    const existing = latestByDay.get(day);
    const incomingTs = new Date(entry?.timestamp || 0).getTime();
    const existingTs = new Date(existing?.timestamp || 0).getTime();
    if (!existing || incomingTs >= existingTs) {
      latestByDay.set(day, {
        day,
        moodLabel: entry?.moodLabel || 'Unknown',
        moodEmoji: entry?.moodEmoji || '•',
        timestamp: entry?.timestamp || null,
      });
    }
  });

  const moodRows = [];
  for (let day = 1; day <= totalDays; day += 1) {
    const hit = latestByDay.get(day);
    moodRows.push({
      day,
      moodLabel: hit?.moodLabel || 'Not logged',
      moodEmoji: hit?.moodEmoji || '—',
      timestamp: hit?.timestamp || null,
    });
  }
  return moodRows;
};


// ─── Comprehensive PDF-grade HTML Report ─────────────────────────────────────
const generateReportHTML = ({
  prog, program, activeProgramDuration, rate, patterns,
  challengeTrend, dominantTheme, programFocus, total, reflectionSignals,
  mitigation, journalEntries, readinessScore, programTitle, gc,
  archetype, transformationStage, eqScore, resilienceIndex,
  emotionalTrajectory, completionRates, reflectionDepthScore, allDayCompletions, moodDailyLog,
}) => {
  const date    = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  const color   = prog?.color || '#7A9E87';
  const bg      = prog?.bg    || '#E8F0EB';
  const guidance = PROGRAM_GUIDANCE[program] || {};

  const scoreBar = (label, val, note, c) => `
    <div style="margin-bottom:18px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
        <div style="flex:1"><div style="font-size:13px;font-weight:600;color:#2C3530">${label}</div>
          <div style="font-size:11px;color:#9BA8A0;margin-top:2px;line-height:1.4">${note}</div></div>
        <div style="text-align:right;margin-left:12px;flex-shrink:0">
          <div style="font-size:20px;font-weight:700;color:${c};font-family:'Cormorant Garamond',Georgia,serif">${val}</div>
          <div style="font-size:9px;font-weight:700;border:1px solid ${c};color:${c};border-radius:20px;padding:1px 8px;text-transform:uppercase;letter-spacing:0.04em;display:inline-block;margin-top:2px">${val>=70?'Strength':val>=45?'Developing':'Growth Edge'}</div>
        </div>
      </div>
      <div style="height:7px;background:#E8F0EB;border-radius:4px;overflow:hidden">
        <div style="width:${val}%;height:100%;background:${c};border-radius:4px"></div>
      </div>
    </div>`;

  const dayHeatmap = allDayCompletions.map((d, i) => {
    const s  = d ? (d.morning?1:0)+(d.midday?1:0)+(d.night?1:0) : 0;
    const bg2 = s===3 ? color : s===2 ? color+'aa' : s===1 ? color+'55' : '#E8E4DC';
    const tc  = s > 0 ? '#fff' : '#9BA8A0';
    return `<div style="display:inline-flex;flex-direction:column;align-items:center;gap:3px;margin:0 3px 6px">
      <div style="width:30px;height:30px;border-radius:8px;background:${bg2};display:flex;align-items:center;justify-content:center">
        <span style="font-size:11px;font-weight:700;color:${tc}">${s}</span>
      </div>
      <span style="font-size:9px;color:#9BA8A0">D${i+1}</span>
    </div>`;
  }).join('');

  const reflRows = journalEntries.map((e, idx) => {
    const d = new Date(e.timestamp||Date.now());
    return `<div style="margin-bottom:${idx<journalEntries.length-1?'14px':'0'};padding-bottom:${idx<journalEntries.length-1?'14px':'0'};border-bottom:${idx<journalEntries.length-1?'1px solid #EDE9E0':'none'}">
      <div style="font-size:11px;color:#9BA8A0;margin-bottom:5px">Day ${e.day||'-'}${e.sessionType?` · ${e.sessionType}`:''} · ${d.toLocaleDateString()}</div>
      <p style="font-size:13px;color:#5E6B64;line-height:1.6;font-style:italic">"${(e.text||'').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}"</p>
    </div>`;
  }).join('');

  const actionItems = mitigation.map((tip, i) =>
    `<div style="display:flex;gap:10px;margin-bottom:${i<mitigation.length-1?'12px':'0'}">
      <div style="min-width:22px;height:22px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:1px">${i+1}</div>
      <p style="font-size:13px;color:#5E6B64;line-height:1.65">${tip}</p>
    </div>`).join('');

  const moodRows = (moodDailyLog || []).map((entry, idx) => {
    const stamp = entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : null;
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:${idx < (moodDailyLog.length - 1) ? '10px 0' : '10px 0 0'};border-bottom:${idx < (moodDailyLog.length - 1) ? '1px solid #EDE9E0' : 'none'}">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:12px;color:#9BA8A0;min-width:40px">Day ${entry.day}</span>
        <span style="font-size:16px">${entry.moodEmoji}</span>
        <span style="font-size:13px;color:#2C3530;font-weight:600">${entry.moodLabel}</span>
      </div>
      <span style="font-size:11px;color:#9BA8A0">${stamp || ''}</span>
    </div>`;
  }).join('');

  const trajColor = emotionalTrajectory.change > 0 ? '#7A9E87' : emotionalTrajectory.change < 0 ? '#A67B7B' : '#B5956A';
  const trajIcon  = emotionalTrajectory.change > 0 ? '↗' : emotionalTrajectory.change < 0 ? '↘' : '→';

  const para1 = `Over the course of your ${activeProgramDuration}-day <strong>${prog?.label||''}</strong> programme, you completed <strong>${total} of a possible ${activeProgramDuration*3} sessions</strong> — a <strong>${rate}% completion rate</strong> that places you in the ${rate>=80?'top tier of programme adherence':rate>=50?'solid mid-range of engagement':'early adoption phase of behaviour change'}. Your profile is that of <em>${archetype.name}</em> — ${archetype.desc.split('.')[0].toLowerCase()}.`;
  const para2 = `Your emotional signature across this programme was predominantly <strong>${challengeTrend}</strong>, with <strong>${dominantTheme}</strong> emerging as the dominant psychological theme in your reflections. Your Emotional Trajectory shows a <strong>${emotionalTrajectory.trend}</strong> arc — the language you used to describe your inner states ${emotionalTrajectory.change>0?'became progressively more positive and grounded as the programme advanced':emotionalTrajectory.change<0?'reflected increasing challenge as the programme deepened — a sign of honest engagement, not failure':'remained stable throughout, indicating solid baseline regulation'}.`;
  const para3 = `Your Behavioural Readiness Score of <strong>${readinessScore}/100</strong> and EQ Score of <strong>${eqScore}/100</strong> place you at the <strong>${transformationStage.name}</strong> stage of transformation. ${transformationStage.desc} ${guidance.psychInsight||''} <strong>Recommended next action:</strong> ${transformationStage.next}`;

  const stagePercents = { Awareness:10, Experimentation:30, Integration:56, Consolidation:78, Mastery:94 };
  const stagePct = stagePercents[transformationStage.name] || 10;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>MindScript — ${programTitle} Psychological Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'DM Sans',system-ui,sans-serif;background:#F7F6F2;color:#2C3530;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  html,body{max-width:100%;overflow-x:hidden}
  h1,h2,h3{font-family:'Cormorant Garamond',Georgia,serif;font-weight:500}
  .cover{background:${bg};padding:52px 36px 40px;border-bottom:2px solid ${color}33}
  .body{max-width:740px;margin:0 auto;padding:36px 36px 48px}
  .section{margin-bottom:28px}
  .card{background:#fff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #EDE9E0;overflow:hidden}
  .card-label{font-size:10px;font-weight:700;color:#9BA8A0;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;border-bottom:1px solid #F0EDE8;padding-bottom:10px}
  .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
  .triple-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
  .tile{min-width:0;word-break:break-word}
  .stat-box{background:#fff;border-radius:14px;padding:18px 10px;text-align:center;border:1px solid #EDE9E0}
  .stat-num{font-family:'Cormorant Garamond',Georgia,serif;font-size:34px;font-weight:500;color:${color};line-height:1}
  .stat-lbl{font-size:10px;color:#9BA8A0;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-top:6px}
  .trait-chip{display:inline-block;background:${color}18;border:1px solid ${color}44;border-radius:20px;padding:3px 12px;font-size:11px;font-weight:600;color:#2C3530;margin:0 4px 6px 0}
  .psych-insight{background:linear-gradient(135deg,${bg} 0%,#fff 100%);border-left:3px solid ${color};padding:16px 20px;margin-bottom:20px}
  .psych-insight p{font-family:'Cormorant Garamond',Georgia,serif;font-size:15px;line-height:1.8;color:#2C3530;font-style:italic}
  .narrative{background:${bg};border-radius:16px;padding:26px;margin-bottom:20px}
  .narrative p{font-family:'Cormorant Garamond',Georgia,serif;font-size:15.5px;line-height:1.82;color:#2C3530;margin-bottom:14px}
  .narrative p:last-child{margin-bottom:0}
  .heatmap{display:flex;flex-wrap:wrap;gap:2px;margin-top:8px}
  .footer{text-align:center;padding:36px;border-top:1px solid #EDE9E0;margin-top:36px}
  .footer-logo{font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:500;color:${color};margin-bottom:8px}
  @media (max-width: 900px){
    .body{max-width:100%;padding:26px 18px 32px}
    .cover{padding:34px 18px 24px}
    h1{font-size:32px!important}
  }
  @media (max-width: 680px){
    .stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
    .triple-grid{grid-template-columns:1fr}
    .card{padding:16px}
  }
  @media print{
    body{background:#fff}
    .cover{background:${bg}!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
    .narrative{background:${bg}!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
    .psych-insight{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
    .section{page-break-inside:avoid}
    @page{margin:18mm 20mm;size:A4 portrait}
  }
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div style="font-size:11px;font-weight:700;color:${color};letter-spacing:0.14em;text-transform:uppercase;margin-bottom:10px">${activeProgramDuration}-Day Programme Complete</div>
  <h1 style="font-size:38px;line-height:1.2;color:#2C3530;margin-bottom:12px">Psychological<br/>Transformation Report</h1>
  <div style="font-size:13px;color:#5E6B64;line-height:1.7;margin-bottom:18px">
    <strong>${programTitle}</strong> · ${prog?.label||''} Programme<br/>
    ${total} sessions completed · ${reflectionSignals.totalEntries} journal reflections · Generated ${date}
  </div>
  <div style="display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:40px;padding:10px 18px;border:1.5px solid ${color};box-shadow:0 2px 8px ${color}22">
    <span style="font-size:22px">${archetype.icon}</span>
    <div>
      <div style="font-size:10px;font-weight:700;color:${color};letter-spacing:0.08em;text-transform:uppercase">Behavioural Archetype</div>
      <div style="font-size:14px;font-weight:700;color:#2C3530">${archetype.name}</div>
    </div>
  </div>
</div>

<div class="body">

<!-- 1. SNAPSHOT -->
<div class="section">
  <div class="stat-grid">
    <div class="stat-box"><div class="stat-num">${rate}%</div><div class="stat-lbl">Completion</div></div>
    <div class="stat-box"><div class="stat-num">${total}</div><div class="stat-lbl">Sessions</div></div>
    <div class="stat-box"><div class="stat-num">${reflectionSignals.totalEntries}</div><div class="stat-lbl">Reflections</div></div>
    <div class="stat-box"><div class="stat-num">${readinessScore}</div><div class="stat-lbl">Readiness</div></div>
  </div>
</div>

<!-- 2. TRANSFORMATION STAGE -->
<div class="section">
  <div class="card">
    <div class="card-label">Transformation Stage</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;font-weight:500;color:${transformationStage.color};margin-bottom:10px">${transformationStage.name}</div>
    <p style="font-size:13px;color:#5E6B64;line-height:1.65;margin-bottom:14px">${transformationStage.desc}</p>
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;font-size:9px;color:#9BA8A0;margin-bottom:5px">
        <span>Awareness</span><span>Experiment</span><span>Integration</span><span>Consolidation</span><span>Mastery</span>
      </div>
      <div style="height:8px;background:#E8E4DC;border-radius:4px;overflow:hidden">
        <div style="width:${stagePct}%;height:100%;background:${transformationStage.color};border-radius:4px"></div>
      </div>
    </div>
    <div style="background:#F8FAF8;border-radius:10px;padding:10px 14px;font-size:12px;color:#5E6B64"><strong>Next:</strong> ${transformationStage.next}</div>
  </div>
</div>

<!-- 3. PSYCHOLOGICAL PROFILE -->
<div class="section">
  <div class="card">
    <div class="card-label">Psychological Profile</div>
    ${scoreBar('Behavioural Readiness',     readinessScore,    'Composite: action execution + reflection depth + consistency', gc(readinessScore))}
    ${scoreBar('Emotional Intelligence (EQ)', eqScore,          `Self-awareness + emotional vocabulary + regulation signal`,    gc(eqScore))}
    ${scoreBar('Resilience Index',           resilienceIndex,   'Recovery rate after missed or low-completion days',            gc(resilienceIndex))}
    ${scoreBar('Reflection Depth',           reflectionDepthScore, `${reflectionSignals.totalEntries} entries · ~${reflectionSignals.avgWords} words avg`, gc(reflectionDepthScore))}
  </div>
</div>

<!-- 4. ARCHETYPE -->
<div class="section">
  <div class="card">
    <div class="card-label">Behavioural Archetype Profile</div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
      <div style="width:56px;height:56px;border-radius:16px;background:${bg};display:flex;align-items:center;justify-content:center;font-size:30px;flex-shrink:0">${archetype.icon}</div>
      <div>
        <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;color:#2C3530;margin-bottom:6px">${archetype.name}</div>
        <span class="trait-chip">${archetype.trait1}</span><span class="trait-chip">${archetype.trait2}</span><span class="trait-chip">${archetype.trait3}</span>
      </div>
    </div>
    <p style="font-size:13px;color:#5E6B64;line-height:1.65">${archetype.desc}</p>
  </div>
  <div class="psych-insight"><p>${guidance.psychInsight||'The patterns in your reflections reveal a mind actively working to build new neural pathways. Consistency — even imperfect — is the primary mechanism of lasting change.'}</p></div>
</div>

<!-- 5. CORE BEHAVIOURAL PATTERNS -->
<div class="section">
  <div class="card">
    <div class="card-label">Core Behavioural Patterns</div>
    ${patterns.map(p => scoreBar(p.label, p.val, p.note, gc(p.val))).join('')}
  </div>
</div>

<!-- 6. EMOTIONAL TRAJECTORY -->
<div class="section">
  <div class="card">
    <div class="card-label">Emotional Trajectory</div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
      <div style="font-size:36px;font-weight:700;color:${trajColor};line-height:1">${trajIcon}</div>
      <div>
        <div style="font-size:15px;font-weight:600;color:#2C3530;text-transform:capitalize;margin-bottom:3px">${emotionalTrajectory.trend}</div>
        <div style="font-size:12px;color:#9BA8A0">${reflectionSignals.positive} positive signals · ${reflectionSignals.challenging} challenge signals · ${reflectionSignals.clarity} clarity moments</div>
      </div>
    </div>
    <div class="triple-grid">
      <div class="tile" style="text-align:center;background:#F5F9F6;border-radius:12px;padding:14px 8px">
        <div style="font-size:24px;font-weight:700;color:#7A9E87">${reflectionSignals.positive}</div>
        <div style="font-size:9px;color:#9BA8A0;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px">Positive</div>
      </div>
      <div class="tile" style="text-align:center;background:#FDF5F0;border-radius:12px;padding:14px 8px">
        <div style="font-size:24px;font-weight:700;color:#A67B7B">${reflectionSignals.challenging}</div>
        <div style="font-size:9px;color:#9BA8A0;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px">Challenge</div>
      </div>
      <div class="tile" style="text-align:center;background:#F8F5FF;border-radius:12px;padding:14px 8px">
        <div style="font-size:24px;font-weight:700;color:#8E9EC4">${reflectionSignals.clarity}</div>
        <div style="font-size:9px;color:#9BA8A0;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px">Clarity</div>
      </div>
    </div>
  </div>
</div>

<!-- 7. SESSION TIME ANALYSIS -->
<div class="section">
  <div class="card">
    <div class="card-label">Session Time Analysis</div>
    <p style="font-size:12px;color:#9BA8A0;margin-bottom:14px">${PROGRAM_SCORING[program]?.emphasis||'Balanced session engagement drives consistent progress.'}</p>
    <div class="triple-grid">
      ${['morning','midday','night'].map(t => {
        const r = completionRates[t]; const c2 = gc(r);
        const icons = {morning:'🌅',midday:'☀️',night:'🌙'};
        return `<div class="tile" style="text-align:center;background:#F5F9F6;border-radius:12px;padding:16px 8px">
          <div style="font-size:20px;margin-bottom:8px">${icons[t]}</div>
          <div style="font-size:24px;font-weight:700;color:${c2}">${r}%</div>
          <div style="font-size:9px;color:#9BA8A0;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px">${t}</div>
        </div>`;
      }).join('')}
    </div>
  </div>
</div>

<!-- 8. DAY-BY-DAY HEATMAP -->
<div class="section">
  <div class="card">
    <div class="card-label">Day-by-Day Completion Heatmap</div>
    <p style="font-size:11px;color:#9BA8A0;margin-bottom:10px">Number inside each tile = sessions completed that day (0–3).</p>
    <div class="heatmap">${dayHeatmap}</div>
    <div style="display:flex;gap:14px;margin-top:12px;flex-wrap:wrap">
      ${[[color,'3/3'],[ color+'aa','2/3'],[color+'55','1/3'],['#E8E4DC','0/3']].map(([bg2,lbl]) =>
        `<div style="display:flex;align-items:center;gap:5px"><div style="width:14px;height:14px;border-radius:4px;background:${bg2}"></div><span style="font-size:11px;color:#9BA8A0">${lbl}</span></div>`
      ).join('')}
    </div>
  </div>
</div>

<!-- 9. NARRATIVE -->
<div class="section">
  <div style="font-size:10px;font-weight:700;color:#9BA8A0;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:14px">Personalised Psychological Narrative</div>
  <div class="narrative">
    <p>${para1}</p>
    <p>${para2}</p>
    <p>${para3}</p>
  </div>
</div>

<!-- 10. DAILY MOOD LOG -->
${(moodDailyLog && moodDailyLog.length > 0) ? `
<div class="section">
  <div class="card">
    <div class="card-label">Daily Mood Log</div>
    <p style="font-size:12px;color:#9BA8A0;margin-bottom:8px">Latest mood logged by day during this programme cycle.</p>
    ${moodRows}
  </div>
</div>` : ''}

<!-- 11. PRESCRIPTIVE ACTIONS -->
<div class="section">
  <div class="card" style="background:#FFFAF4;border:1px solid #F0DEC1">
    <div class="card-label" style="color:#B5956A">Prescriptive Action Plan</div>
    <p style="font-size:12px;color:#8C6B3E;margin-bottom:16px;font-style:italic">Personalised based on your engagement patterns and reflection signals across ${activeProgramDuration} days.</p>
    ${actionItems}
  </div>
  <div class="card" style="background:${bg};border:none">
    <div class="card-label" style="color:${color}">Recommended Next Programme</div>
    <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;color:#2C3530;margin-bottom:6px">${guidance.nextProgram||`${prog?.label||''} Advanced Track`}</div>
    <p style="font-size:13px;color:#5E6B64;line-height:1.65">${guidance.nextDesc||'Continue building on this foundation with a more advanced programme tailored to your archetype.'}</p>
  </div>
</div>

<!-- 12. REFLECTION ARCHIVE -->
${journalEntries.length > 0 ? `
<div class="section">
  <div class="card">
    <div class="card-label">Complete Reflection Archive (${journalEntries.length} entries)</div>
    ${reflRows}
  </div>
</div>` : ''}

<!-- FOOTER -->
<div class="footer">
  <div class="footer-logo">MindScript</div>
  <div style="font-size:11px;color:#9BA8A0;line-height:1.7">
    ${programTitle} · ${activeProgramDuration}-Day Programme · Completed ${date}<br/>
    Readiness ${readinessScore}/100 · EQ ${eqScore}/100 · Resilience ${resilienceIndex}/100<br/>
    This report is generated automatically from your session engagement and reflection data.<br/>
    It is designed to support self-awareness and is not a substitute for professional psychological assessment.
  </div>
</div>

</div>
</body>
</html>`;
};

const buildReportPdf = ({
  prog, program, programTitle, activeProgramDuration, rate, total,
  reflectionSignals, readinessScore, eqScore, resilienceIndex,
  archetype, transformationStage, challengeTrend, dominantTheme,
  programFocus, mitigation, patterns, journalEntries, completionRates,
  reflectionDepthScore, emotionalTrajectory, allDayCompletions,
}) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 42;
  const marginTop = 52;
  const marginBottom = 44;
  const contentWidth = pageWidth - marginX * 2;
  const primaryColor = prog?.color || '#7A9E87';
  const softColor = prog?.bg || '#E8F0EB';
  let cursorY = marginTop;

  const ensureSpace = (neededHeight) => {
    if (cursorY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      cursorY = marginTop;
    }
  };

  const addLine = (padding = 18) => {
    ensureSpace(padding);
    doc.setDrawColor(229, 233, 226);
    doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
    cursorY += padding - 4;
  };

  const addHeading = (text, size = 15, color = '#2C3530') => {
    ensureSpace(28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(size);
    doc.setTextColor(color);
    doc.text(text, marginX, cursorY);
    cursorY += size + 10;
  };

  const addBody = (text, options = {}) => {
    const size = options.size || 11;
    const color = options.color || '#5E6B64';
    const lineHeight = options.lineHeight || 15;
    const fontStyle = options.bold ? 'bold' : 'normal';
    const lines = doc.splitTextToSize(String(text || ''), contentWidth);
    ensureSpace(lines.length * lineHeight + 10);
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(size);
    doc.setTextColor(color);
    doc.text(lines, marginX, cursorY);
    cursorY += lines.length * lineHeight + 6;
  };

  const addMetric = (label, value, x, y, boxWidth) => {
    doc.setDrawColor(232, 240, 235);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, boxWidth, 62, 10, 10, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(primaryColor);
    doc.text(String(value), x + 14, y + 25);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor('#9BA8A0');
    doc.text(label.toUpperCase(), x + 14, y + 43);
  };

  const addBullet = (text, index) => {
    const bullet = `${index + 1}. ${text}`;
    addBody(bullet, { size: 11, color: '#5E6B64' });
  };

  const dateLabel = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const title = programTitle || `${prog?.label || 'MindScript'} Transformation Report`;

  doc.setFillColor(247, 246, 242);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFillColor(primaryColor);
  doc.roundedRect(marginX, cursorY, 170, 24, 12, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor('#FFFFFF');
  doc.text(`${activeProgramDuration}-Day Program Complete`, marginX + 14, cursorY + 16);
  cursorY += 42;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor('#2C3530');
  doc.text('Psychological Transformation Report', marginX, cursorY);
  cursorY += 26;

  addBody(title, { size: 12, color: primaryColor, bold: true });
  addBody(`Generated ${dateLabel}`, { size: 10, color: '#9BA8A0' });
  addBody(`Completion rate: ${rate}%  |  Sessions completed: ${total}  |  Reflections: ${reflectionSignals.totalEntries}`, { size: 11, color: '#5E6B64' });
  addLine();

  addHeading('Key Metrics');
  ensureSpace(90);
  const metricY = cursorY;
  const metricWidth = (contentWidth - 24) / 4;
  addMetric('Completion', `${rate}%`, marginX, metricY, metricWidth);
  addMetric('Sessions', total, marginX + metricWidth + 8, metricY, metricWidth);
  addMetric('Reflections', reflectionSignals.totalEntries, marginX + (metricWidth + 8) * 2, metricY, metricWidth);
  addMetric('Readiness', readinessScore, marginX + (metricWidth + 8) * 3, metricY, metricWidth);
  cursorY = metricY + 78;

  addHeading('Transformation Summary');
  addBody(`Your profile reflects a ${challengeTrend} emotional pattern, with ${dominantTheme} as the dominant theme. The report places you in the ${transformationStage.name} stage of transformation and points toward ${programFocus} as the next area to train.`, { size: 11, lineHeight: 16 });
  addBody(`Behavioural readiness: ${readinessScore}/100. EQ score: ${eqScore}/100. Resilience index: ${resilienceIndex}/100. Reflection depth score: ${reflectionDepthScore}/100.`, { size: 11, color: '#2C3530' });

  addHeading('Behavioural Patterns');
  patterns.forEach((pattern) => {
    addBody(`• ${pattern.label}: ${pattern.val}% — ${pattern.note}`, { size: 10.5, lineHeight: 14.5 });
  });

  addHeading('Session Time Analysis');
  addBody(`Morning: ${completionRates.morning}%  |  Midday: ${completionRates.midday}%  |  Night: ${completionRates.night}%`, { size: 11, color: '#2C3530' });
  addBody(`This distribution suggests ${PROGRAM_SCORING[program]?.emphasis || 'balanced session engagement drives progress.'}`, { size: 11 });

  addHeading('Next Actions');
  mitigation.forEach((tip, index) => addBullet(tip, index));

  if (journalEntries.length > 0) {
    addHeading(`Reflection Archive (${journalEntries.length})`);
    journalEntries.slice(0, 8).forEach((entry, index) => {
      const entryLabel = `Day ${entry.day || '-'}${entry.sessionType ? ` · ${entry.sessionType}` : ''}`;
      addBody(entryLabel, { size: 10, color: '#9BA8A0' });
      addBody(entry.text, { size: 10.5, lineHeight: 14.5 });
      if (index < Math.min(journalEntries.length, 8) - 1) {
        addLine(14);
      }
    });
  }

  addHeading('Completion Snapshot');
  const activeDays = allDayCompletions.reduce((sum, day) => sum + (day ? 1 : 0), 0);
  addBody(`Program: ${title}`, { size: 11, color: '#2C3530' });
  addBody(`Days tracked: ${activeDays} of ${activeProgramDuration}`, { size: 11, color: '#2C3530' });
  addBody(`Archetype: ${archetype.name}`, { size: 11, color: '#2C3530' });

  ensureSpace(70);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor('#9BA8A0');
  doc.text('MindScript report generated from your in-app reflection and completion data.', marginX, pageHeight - 28);

  return doc;
};

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string' || !result.includes(',')) {
        reject(new Error('Failed to convert blob to base64.'));
        return;
      }
      resolve(result.split(',')[1]);
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader failed.'));
    reader.readAsDataURL(blob);
  });

const renderHtmlToPdf = async (html) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '-10000px';
  iframe.style.bottom = '-10000px';
  iframe.style.width = '900px';
  iframe.style.height = '1200px';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument;
    if (!doc) {
      throw new Error('Unable to initialize HTML renderer.');
    }

    doc.open();
    doc.write(html);
    doc.close();

    await new Promise((resolve) => {
      if (doc.readyState === 'complete') {
        resolve();
        return;
      }
      iframe.onload = () => resolve();
      setTimeout(resolve, 800);
    });

    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    await pdf.html(doc.body, {
      margin: [18, 18, 18, 18],
      autoPaging: 'text',
      width: 559,
      windowWidth: 900,
      html2canvas: {
        scale: 0.75,
        useCORS: true,
        backgroundColor: '#F7F6F2',
      },
    });

    return pdf;
  } finally {
    iframe.remove();
  }
};

const ReportScreen = ({ program, allDayCompletions, reflectionData = [], moodHistory = [], activeProgramDuration = 3, programTitle, onNavigateToPrograms }) => {
  const prog = PROGRAMS.find((p) => p.id === program);
  const paid = PAID_PROGRAMS[program] || [];
  const resolvedTitle = programTitle || `${prog?.label || ''} ${activeProgramDuration}-Day Program`;
  const [showFullReport, setShowFullReport] = useState(false);
  const total = allDayCompletions.reduce((s, d) => s + (d?.morning ? 1 : 0) + (d?.midday ? 1 : 0) + (d?.night ? 1 : 0), 0);
  const totalPossibleSessions = Math.max(1, activeProgramDuration * 3);
  const rate = Math.round((total / totalPossibleSessions) * 100);
  const scoring = PROGRAM_SCORING[program] || PROGRAM_SCORING.default;

  const completionByType = allDayCompletions.reduce(
    (acc, d) => {
      acc.morning += d?.morning ? 1 : 0;
      acc.midday += d?.midday ? 1 : 0;
      acc.night += d?.night ? 1 : 0;
      return acc;
    },
    { morning: 0, midday: 0, night: 0 }
  );

  const completionRates = {
    morning: Math.round((completionByType.morning / Math.max(1, activeProgramDuration)) * 100),
    midday: Math.round((completionByType.midday / Math.max(1, activeProgramDuration)) * 100),
    night: Math.round((completionByType.night / Math.max(1, activeProgramDuration)) * 100),
  };

  const sessionConsistencyScore = getSessionConsistencyScore(program, completionRates);

  const journalEntries = useMemo(() => {
    const entries = [];
    reflectionData.forEach((entry) => {
      // Journal / free-text entry
      const journalText = (entry?.journalEntry || entry?.text || '').trim();
      if (journalText.length > 0) {
        entries.push({ ...entry, text: journalText, entryType: 'journal' });
      }
      // Timer insight captured separately — add as its own entry
      const timerText = (entry?.timerInsight || '').trim();
      if (timerText.length > 0) {
        entries.push({ ...entry, text: timerText, entryType: 'timer' });
      }

      // Task pointer answers (text/multi-choice/notes) should feed report analytics.
      if (entry?.taskInputs && typeof entry.taskInputs === 'object') {
        Object.entries(entry.taskInputs).forEach(([key, value]) => {
          if (typeof value === 'string' && value.trim().length > 0) {
            entries.push({ ...entry, text: value.trim(), entryType: 'task', taskKey: key });
          }

          if (value === true) {
            const prompt = entry?.taskPrompts?.[key] || 'Checklist confirmation';
            entries.push({ ...entry, text: `${prompt}: completed`, entryType: 'task', taskKey: key });
          }
        });
      }

      // Night reflection answers should also contribute to report signals.
      if (entry?.answers && typeof entry.answers === 'object') {
        Object.values(entry.answers).forEach((value) => {
          if (typeof value === 'string' && value.trim().length > 0) {
            entries.push({ ...entry, text: value.trim(), entryType: 'answer' });
          }
        });
      }
    });
    return entries.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
  }, [reflectionData]);

  const reflectionSignals = useMemo(() => {
    const allText = journalEntries.map((entry) => entry.text.toLowerCase()).join(' ');
    const focusSessions = journalEntries.filter((entry) => entry.sessionType === 'morning').length;
    const avgWords = journalEntries.length
      ? Math.round(journalEntries.reduce((sum, entry) => sum + entry.text.split(/\s+/).filter(Boolean).length, 0) / journalEntries.length)
      : 0;

    return {
      positive: countMatches(allText, WORD_BANK.positive),
      challenging: countMatches(allText, WORD_BANK.challenging),
      clarity: countMatches(allText, WORD_BANK.clarity),
      focusSessions,
      avgWords,
      totalEntries: journalEntries.length,
      textBlob: allText,
    };
  }, [journalEntries]);

  const programThemeHits = countMatches(
    reflectionSignals.textBlob,
    PROGRAM_THEME_WORDS[program] || []
  );
  const themeAlignmentScore = Math.min(20, programThemeHits * 3);

  const reflectionDepthScore = Math.min(
    100,
    Math.round(
      (
        (reflectionSignals.totalEntries * 9) +
        (Math.min(reflectionSignals.avgWords, 45) * 1.2) +
        (reflectionSignals.clarity * 4)
      ) * scoring.reflectionMultiplier +
      themeAlignmentScore
    )
  );

  const readinessScore = Math.min(
    100,
    Math.round(
      (rate * scoring.actionWeight) +
      (reflectionDepthScore * scoring.reflectionWeight) +
      (sessionConsistencyScore * scoring.sessionWeight)
    )
  );

  const patterns = [
    { label: "Action Completion", val: rate, note: rate > 70 ? "Consistent executor" : rate > 40 ? "Building consistency" : "Resistance present" },
    { label: "Session Adherence", val: sessionConsistencyScore, note: scoring.emphasis },
    { label: "Reflection Depth", val: reflectionDepthScore, note: `Based on ${reflectionSignals.totalEntries} journal entries` },
    { label: "Behavioral Readiness", val: readinessScore, note: "Capacity for the next program level" },
  ];

  const challengeTrend = reflectionSignals.challenging > reflectionSignals.positive ? 'challenge-heavy' : 'stabilizing';
  const dominantTheme = reflectionSignals.clarity >= 3 ? 'self-awareness' : reflectionSignals.positive >= reflectionSignals.challenging ? 'emotional regulation' : 'stress recovery';
  const mitigation = getMitigationSuggestions(reflectionSignals, program);
  const programFocus = PROGRAM_GUIDANCE[program]?.focus || 'behavioral growth';

  const gc = (v) => (v >= 70 ? "#7A9E87" : v >= 45 ? "#B5956A" : "#A67B7B");
  const gl = (v) => (v >= 70 ? "Strength" : v >= 45 ? "Developing" : "Growth Edge");

  const archetype = useMemo(() => getBehavioralArchetype(program, rate, reflectionSignals), [program, rate, reflectionSignals]);
  const transformationStage = useMemo(() => getTransformationStage(readinessScore, rate, reflectionDepthScore), [readinessScore, rate, reflectionDepthScore]);
  const eqScore = useMemo(() => getEQScore(reflectionSignals, journalEntries, activeProgramDuration), [reflectionSignals, journalEntries, activeProgramDuration]);
  const resilienceIndex = useMemo(() => getResilienceIndex(allDayCompletions), [allDayCompletions]);
  const emotionalTrajectory = useMemo(() => getEmotionalTrajectory(journalEntries), [journalEntries]);
  const moodDailyLog = useMemo(() => buildDailyMoodLog(moodHistory, activeProgramDuration), [moodHistory, activeProgramDuration]);
  const moodSummary = useMemo(() => {
    const logged = moodDailyLog.filter((entry) => entry.moodLabel !== 'Not logged');
    const loggedDays = logged.length;
    const counts = logged.reduce((acc, entry) => {
      const key = `${entry.moodEmoji} ${entry.moodLabel}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No dominant mood yet';
    return {
      loggedDays,
      totalDays: activeProgramDuration,
      dominant,
    };
  }, [moodDailyLog, activeProgramDuration]);

  const detailedReportHtml = useMemo(() => generateReportHTML({
    prog, program, activeProgramDuration, rate, patterns, challengeTrend, dominantTheme,
    programFocus, total, reflectionSignals, mitigation, journalEntries, readinessScore,
    programTitle: resolvedTitle, gc,
    archetype, transformationStage, eqScore, resilienceIndex,
    emotionalTrajectory, completionRates, reflectionDepthScore, allDayCompletions, moodDailyLog,
  }), [
    prog, program, activeProgramDuration, rate, patterns, challengeTrend, dominantTheme,
    programFocus, total, reflectionSignals, mitigation, journalEntries, readinessScore,
    resolvedTitle, gc, archetype, transformationStage, eqScore, resilienceIndex,
    emotionalTrajectory, completionRates, reflectionDepthScore, allDayCompletions, moodDailyLog,
  ]);

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F2", paddingBottom: "48px" }}>
      {onNavigateToPrograms && !showFullReport && (
        <button
          onClick={() => onNavigateToPrograms()}
          aria-label="Close report"
          style={{
            position: "fixed",
            top: "max(12px, env(safe-area-inset-top))",
            right: "14px",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            border: "1px solid rgba(122,158,135,0.35)",
            background: "rgba(247,246,242,0.92)",
            color: "#5E6B64",
            fontSize: "24px",
            lineHeight: 1,
            cursor: "pointer",
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(44,53,48,0.16)",
            backdropFilter: "blur(4px)",
          }}
        >
          ×
        </button>
      )}
      <div style={{ background: prog?.bg || "#E8F0EB", padding: "48px 22px 30px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <Tag label={`${activeProgramDuration}-Day Program Complete`} color={prog?.color} />
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "30px", fontWeight: 500, marginTop: "12px", lineHeight: 1.25, color: "#2C3530" }}>
            Your Behavioral
            <br />
            Pattern Report
          </h1>
          <p style={{ fontSize: "14px", color: "#5E6B64", marginTop: "10px", lineHeight: 1.65 }}>
            Based on your session engagement, task completion, and reflection responses across your full program.
          </p>
          <p style={{ fontSize: "13px", color: prog?.color || "#7A9E87", fontWeight: 600, marginTop: "6px" }}>{resolvedTitle}</p>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 22px" }}>
        <button
          onClick={() => setShowFullReport(true)}
          style={{
            width: "100%",
            padding: "14px 20px",
            background: prog?.color || "#7A9E87",
            color: "#fff",
            border: "none",
            borderRadius: "14px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            letterSpacing: "0.01em",
          }}
        >
          View Full Detailed Report
        </button>

        {showFullReport && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(44,53,48,0.72)',
              zIndex: 1200,
              padding: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowFullReport(false);
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 900,
                height: '92vh',
                background: '#F7F6F2',
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 24px 60px rgba(0,0,0,0.24)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: prog?.bg || '#E8F0EB', borderBottom: '1px solid #E8E4DC' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: prog?.color || '#7A9E87', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Detailed Report
                </p>
                <button
                  onClick={() => setShowFullReport(false)}
                  style={{ background: 'none', border: 'none', fontSize: '28px', color: '#5E6B64', cursor: 'pointer', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
              <iframe
                title="Detailed In-App Report"
                srcDoc={detailedReportHtml}
                style={{ width: '100%', flex: 1, border: 'none', background: '#fff' }}
              />
            </div>
          </div>
        )}

        <Card style={{ marginBottom: "14px", textAlign: "center" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#9BA8A0", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>
            Program Completion Rate
          </p>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "54px", fontWeight: 500, color: "#7A9E87", lineHeight: 1 }}>{rate}%</div>
          <p style={{ fontSize: "13px", color: "#5E6B64", marginTop: "8px", lineHeight: 1.5 }}>
            {rate >= 80
              ? "Exceptional consistency. You showed up every time it mattered."
              : rate >= 50
              ? "Solid foundation. Consistency is clearly building."
              : "You started — that's the hardest part. Now we build on it."}
          </p>
        </Card>

        <Card style={{ marginBottom: "14px", background: "linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(122,158,135,0.08) 100%)", border: "1px solid rgba(122,158,135,0.2)" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#7A9E87", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
            Mood Summary
          </p>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 600, color: "#2C3530", marginBottom: "4px" }}>
            {moodSummary.dominant}
          </p>
          <p style={{ fontSize: "12px", color: "#5E6B64", lineHeight: 1.6 }}>
            Logged on {moodSummary.loggedDays}/{moodSummary.totalDays} days in this cycle.
          </p>
        </Card>

        <Card style={{ marginBottom: "14px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#9BA8A0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>Behavioral Patterns</p>
          {patterns.map((p, i) => {
            const c = gc(p.val);
            const l = gl(p.val);
            return (
              <div key={i} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#2C3530" }}>{p.label}</span>
                    <p style={{ fontSize: "11px", color: "#9BA8A0", marginTop: "1px" }}>{p.note}</p>
                  </div>
                  <Tag label={l} color={c} />
                </div>
                <div style={{ height: 6, background: "#C4D8CB", borderRadius: 3 }}>
                  <div style={{ width: `${p.val}%`, height: "100%", background: c, borderRadius: 3, transition: "width 1.1s ease" }} />
                </div>
              </div>
            );
          })}
        </Card>

        <Card style={{ background: "#E8F0EB", border: "none", marginBottom: "14px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#7A9E87", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Personalized Summary</p>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "16px", lineHeight: 1.72, color: "#2C3530" }}>
            Your {prog?.label || 'program'} journey shows a <strong>{challengeTrend}</strong> emotional pattern with <strong>{dominantTheme}</strong> as the strongest theme.
            You completed {total} sessions and wrote {reflectionSignals.totalEntries} reflections, showing clear momentum in <strong>{programFocus}</strong> and revealing what to train next.
          </p>
        </Card>

        <Card style={{ marginBottom: "14px", background: "#FFFAF4", border: "1px solid #F0DEC1" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#B5956A", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
            Suggested Next Actions
          </p>
          {mitigation.map((tip, idx) => (
            <p key={idx} style={{ fontSize: "13px", color: "#5E6B64", lineHeight: 1.65, marginBottom: idx === mitigation.length - 1 ? 0 : "8px" }}>
              {idx + 1}. {tip}
            </p>
          ))}
        </Card>

        <Card style={{ marginBottom: "14px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#9BA8A0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
            Complete Reflection Archive
          </p>
          {journalEntries.length === 0 && (
            <p style={{ fontSize: "13px", color: "#9BA8A0", lineHeight: 1.6 }}>
              No journal entries were found for this program yet.
            </p>
          )}
          {journalEntries.map((entry, index) => {
            const date = new Date(entry.timestamp || Date.now());
            const isTimer = entry.entryType === 'timer';
            return (
              <div key={`${entry.timestamp || index}-${index}`} style={{ marginBottom: index === journalEntries.length - 1 ? 0 : "12px", paddingBottom: index === journalEntries.length - 1 ? 0 : "12px", borderBottom: index === journalEntries.length - 1 ? "none" : "1px solid #EDE9E0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                  {isTimer && <span style={{ fontSize: "10px", background: "#FFFAF4", border: "1px solid #F5E5C8", color: "#8C6B3E", borderRadius: "6px", padding: "1px 6px", fontWeight: 700, letterSpacing: "0.04em" }}>📓 TIMER INSIGHT</span>}
                  <p style={{ fontSize: "11px", color: "#9BA8A0" }}>
                    Day {entry.day || '-'} {entry.sessionType ? `· ${entry.sessionType}` : ''} · {date.toLocaleDateString()}
                  </p>
                </div>
                <p style={{ fontSize: "13px", color: "#5E6B64", lineHeight: 1.6, fontStyle: "italic" }}>
                  "{entry.text}"
                </p>
              </div>
            );
          })}
        </Card>

        {/* Upgrade */}
        <div style={{ borderRadius: "28px", border: "1.5px solid #C4D8CB", overflow: "hidden" }}>
          <div style={{ padding: "20px 20px 0" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#B5956A", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "7px" }}>
              Continue Your Work
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "18px", fontWeight: 500, color: "#2C3530", marginBottom: "7px" }}>
              The foundation is set.
            </p>
            <p style={{ fontSize: "13px", color: "#5E6B64", lineHeight: 1.65, marginBottom: "16px" }}>
              Your completed cycle reveals the pattern. What comes next rewires it. Your recommended program is built directly on what your data shows.
            </p>
          </div>
          {paid.slice(0, 3).map((p, i) => (
            <div
              key={i}
              onClick={() => onNavigateToPrograms && onNavigateToPrograms()}
              style={{
                padding: "13px 20px",
                background: i === 1 ? "#7A9E87" : "#fff",
                borderTop: "1px solid #C4D8CB",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: "14px", color: i === 1 ? "#fff" : "#2C3530" }}>
                  {p.title}
                  {i === 1 ? " ✦" : ""}
                </p>
                <p style={{ fontSize: "11px", color: i === 1 ? "rgba(255,255,255,0.7)" : "#9BA8A0", marginTop: "2px" }}>
                  {p.dur} · {p.desc.slice(0, 44)}…
                </p>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 600, color: i === 1 ? "#fff" : "#7A9E87" }}>→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportScreen;
