/**
 * Methods:
 *   scoreValue(testId, value, scoringDoc)     → number (50-100) | null
 *   getRule(testId, scoringDoc)               → rule object | null
 *   getDirection(testId, scoringDoc)          → 'higher' | 'lower' | null
 *   isLowerBetter(testId, scoringDoc)         → boolean
 */
window.ScoringEngine = (function() {
  'use strict';

  // ─── Core: find the rule for a test ──────────────────────────────────────────
  function getRule(testId, scoringDoc) {
    if (!scoringDoc || !scoringDoc.rules || !testId) return null;
    return scoringDoc.rules.find(r => r.testId === testId) || null;
  }

  // ─── Get direction from scoring logic ────────────────────────────────────────
  function getDirection(testId, scoringDoc) {
    const rule = getRule(testId, scoringDoc);
    return rule ? rule.direction : null;
  }

  // ─── Is lower better? ───────────────────────────────────────────────────────
  function isLowerBetter(testId, scoringDoc) {
    return getDirection(testId, scoringDoc) === 'lower';
  }

  // ─── Score bounds from the rule ─────────────────────────────────────────────
  // Football rules start at 50; Cricket Elite starts at 0. The engine must honor
  // the actual score values stored in the linked scoring-logic document.
  function getScoreBounds(testId, scoringDoc) {
    const rule = getRule(testId, scoringDoc);
    if (!rule) return { min: 50, max: 100 };

    const scores = rule.method === 'interpolate'
      ? (rule.scale || []).map(point => Number(point.score))
      : rule.method === 'categorical'
        ? Object.values(rule.categories || {}).map(Number)
        : [];

    const validScores = scores.filter(Number.isFinite);
    return validScores.length
      ? { min: Math.min(...validScores), max: Math.max(...validScores) }
      : { min: 50, max: 100 };
  }

  function clampScore(score, testId, scoringDoc) {
    const { min, max } = getScoreBounds(testId, scoringDoc);
    return Math.max(min, Math.min(max, score));
  }

  // The stored score anchors determine the valid score range. For example,
  // Football is 50–100 while Cricket Elite is 0–100.
  function interpolate(value, scale, direction) {
    if (!scale || scale.length === 0) return null;
    const v = Number(value);
    if (!Number.isFinite(v)) return null;

    // Always process from the smallest score to the largest score.
    const sorted = [...scale].sort((a, b) => a.score - b.score);

    // Some source sheets intentionally have neighbouring bands with the same
    // numeric boundary. At an exact shared boundary, honor the highest band.
    const exactPoints = sorted.filter(point => Number(point.value) === v);
    if (exactPoints.length) return Math.max(...exactPoints.map(point => point.score));

    if (direction === 'higher') {
      if (v < sorted[0].value) return sorted[0].score;
      if (v > sorted[sorted.length - 1].value) return sorted[sorted.length - 1].score;
      for (let i = 0; i < sorted.length - 1; i++) {
        const start = sorted[i];
        const end = sorted[i + 1];
        const range = end.value - start.value;
        if (range <= 0) continue;
        if (v > start.value && v < end.value) {
          const progress = (v - start.value) / range;
          return start.score + progress * (end.score - start.score);
        }
      }
    } else if (direction === 'lower') {
      if (v > sorted[0].value) return sorted[0].score;
      if (v < sorted[sorted.length - 1].value) return sorted[sorted.length - 1].score;
      for (let i = 0; i < sorted.length - 1; i++) {
        const start = sorted[i];
        const end = sorted[i + 1];
        const range = start.value - end.value;
        if (range <= 0) continue;
        if (v < start.value && v > end.value) {
          const progress = (start.value - v) / range;
          return start.score + progress * (end.score - start.score);
        }
      }
    }

    return null;
  }

  // ─── Score a categorical test ───────────────────────────────────────────────
  function scoreCategorical(value, categories) {
    if (!categories || value === null || value === undefined || value === '') return null;
    const key = String(value).trim();
    // Try exact match first
    if (key in categories) return categories[key];
    // Try case-insensitive match
    const lower = key.toLowerCase();
    for (const [k, v] of Object.entries(categories)) {
      if (k.toLowerCase() === lower) return v;
    }
    return null;
  }

  // ─── Main scoring function ──────────────────────────────────────────────────
  // Takes a testId, raw value, and the scoring logic document.
  // Returns a score inside that rule's configured bounds, or null for no rule/value.
  function scoreValue(testId, value, scoringDoc) {
    const rule = getRule(testId, scoringDoc);
    if (!rule) return null;

    if (rule.method === 'interpolate') {
      const score = interpolate(value, rule.scale, rule.direction);
      return score === null ? null : clampScore(score, testId, scoringDoc);
    }

    if (rule.method === 'categorical') {
      const score = scoreCategorical(value, rule.categories);
      return score === null ? null : clampScore(score, testId, scoringDoc);
    }

    if (rule.method === 'manual') {
      // Manual tests are not auto-scored.
      return null;
    }

    return null;
  }

  // ─── Public API ─────────────────────────────────────────────────────────────
  return {
    scoreValue: scoreValue,
    getRule: getRule,
    getDirection: getDirection,
    getScoreBounds: getScoreBounds,
    isLowerBetter: isLowerBetter,
  };
})();
