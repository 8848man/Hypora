// Implements sdd/workspace/features/02_1_question_model.md — the Question domain model and
// Preset Strategy. Framework-independent: no React import here, per that document's instruction.

import type { Canvas, Project } from "../../domain/types";

export type CanvasFieldKey = keyof Canvas;

export interface Question {
  id: CanvasFieldKey;
  purpose: string;
}

/** The V1 Question Set — one question per Canvas field, in the fixed canonical order. */
export const QUESTIONS: Question[] = [
  { id: "businessIdea", purpose: "What's the idea, in a sentence or two?" },
  { id: "problem", purpose: "What problem does this solve, and for whom?" },
  { id: "targetCustomer", purpose: "Who specifically has this problem?" },
  { id: "solution", purpose: "What are you proposing to build?" },
  { id: "valueProposition", purpose: "Why would someone choose this over alternatives?" },
];

/**
 * A Preset Provider resolves 3–5 suggested answers for a question. V1 ships one static,
 * curated provider. V2's AI Canvas Assistant becomes a *different* provider — same signature,
 * same call site — per the Preset Strategy's replaceable-content contract. Nothing about the
 * guided flow, the Question Model, or the select-or-customize interaction changes when the
 * provider changes.
 */
export type PresetContext = { project: Project };
export type PresetProvider = (questionId: CanvasFieldKey, context: PresetContext) => string[];

const V1_STATIC_PRESETS: Record<CanvasFieldKey, string[]> = {
  businessIdea: [
    "A subscription service that helps [audience] do [job] more easily.",
    "A marketplace connecting [group A] with [group B].",
    "A tool that automates [tedious task] for [audience].",
    "A local service that brings [thing people want] closer to [audience].",
  ],
  problem: [
    "People waste time/money because there's no easy way to [do X].",
    "Existing options are too expensive, slow, or inconvenient for [audience].",
    "There's no trusted way for [audience] to find/do [X] today.",
  ],
  targetCustomer: [
    "Busy urban professionals",
    "Small business owners",
    "Parents of young children",
    "Students",
    "People new to a neighborhood or city",
  ],
  solution: [
    "A mobile app that connects [audience] directly with [resource].",
    "A simple web tool that automates [manual process].",
    "A curated marketplace with built-in trust/safety features.",
  ],
  valueProposition: [
    "Saves time compared to the current alternative.",
    "Costs less than existing options.",
    "Builds trust/community in a way nothing else does.",
    "Is simply more convenient — available when and where competitors aren't.",
  ],
};

/** V1's Preset Provider: a fixed, curated list per question — no AI, per V1 scope. */
export const v1StaticPresetProvider: PresetProvider = (questionId) => V1_STATIC_PRESETS[questionId];

/**
 * Resume rule (sdd/workspace/02_data_and_state.md): derived from Canvas field completeness,
 * never a separately persisted pointer. Returns the index of the first unanswered question,
 * or QUESTIONS.length if every question is answered (meaning: show Review).
 */
export function resumeQuestionIndex(canvas: Canvas): number {
  const idx = QUESTIONS.findIndex((q) => canvas[q.id].trim() === "");
  return idx === -1 ? QUESTIONS.length : idx;
}
