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

  // ─── Interpolate between scale points ───────────────────────────────────────
  // Given a value and a scale array [{value, score}, ...], find where the value
  // falls and linearly interpolate the score.
  //
  // For "higher is better": scale is sorted ascending by value (210→426)
  // For "lower is better": scale is sorted descending by value (2.00→1.75)
  //
  // If value is below the lowest scale point → clamp to 50
  // If value is above the highest scale point → clamp to 100
  function interpolate(value, scale, direction) {
    if (!scale || scale.length === 0) return null;
    const v = Number(value);
    if (!Number.isFinite(v)) return null;

    // Sort scale by score ascending (50→100) to ensure consistent processing
    const sorted = [...scale].sort((a, b) => a.score - b.score);

    // For "higher is better": higher value = higher score
    // For "lower is better": lower value = higher score (scale values are descending)
    //
    // The scale is always stored as: lowest score (50) first → highest score (100) last
    // For "higher": value at index 0 is the minimum acceptable (score 50)
    // For "lower": value at index 0 is the maximum acceptable (score 50)

    if (direction === 'higher') {
      // Value below minimum → score below 50 (clamp to 50)
      if (v <= sorted[0].value) return 50;
      // Value above maximum → score 100
      if (v >= sorted[sorted.length - 1].value) return 100;
      // Find the two points to interpolate between
      for (let i = 0; i < sorted.length - 1; i++) {
        if (v >= sorted[i].value && v <= sorted[i + 1].value) {
          const range = sorted[i + 1].value - sorted[i].value;
          const progress = (v - sorted[i].value) / range;
          return sorted[i].score + progress * (sorted[i + 1].score - sorted[i].score);
        }
      }
    } else if (direction === 'lower') {
      // For lower-is-better, scale values go from high (score 50) to low (score 100)
      // e.g., 2.00s=50, 1.95s=60, ..., 1.75s=100
      // Lower value = better score

      // Value above the worst (highest value) → clamp to 50
      if (v >= sorted[0].value) return 50;
      // Value below the best (lowest value) → score 100
      if (v <= sorted[sorted.length - 1].value) return 100;
      // Find the two points to interpolate between
      // sorted by score: [{value:2.00, score:50}, {value:1.95, score:60}, ...]
      for (let i = 0; i < sorted.length - 1; i++) {
        if (v <= sorted[i].value && v >= sorted[i + 1].value) {
          const range = sorted[i].value - sorted[i + 1].value;
          const progress = (sorted[i].value - v) / range;
          return sorted[i].score + progress * (sorted[i + 1].score - sorted[i].score);
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
  // Returns a score between 50-100, or null if no rule or invalid value.
  function scoreValue(testId, value, scoringDoc) {
    const rule = getRule(testId, scoringDoc);
    if (!rule) return null;

    if (rule.method === 'interpolate') {
      const score = interpolate(value, rule.scale, rule.direction);
      if (score === null) return null;
      // Clamp to 50-100
      return Math.max(50, Math.min(100, score));
    }

    if (rule.method === 'categorical') {
      const score = scoreCategorical(value, rule.categories);
      if (score === null) return null;
      return Math.max(50, Math.min(100, score));
    }

    if (rule.method === 'manual') {
      // Manual tests are not auto-scored
      return null;
    }

    return null;
  }

  // ─── Public API ─────────────────────────────────────────────────────────────
  return {
    scoreValue: scoreValue,
    getRule: getRule,
    getDirection: getDirection,
    isLowerBetter: isLowerBetter,
  };
})();
