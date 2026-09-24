/**
 * Seeds report-scoring-logic for Football Readiness - U16.
 * Canonical test list and 0–100 scales live in seed-football.js so schema and
 * scoring stay in lockstep. This file remains the previous entry point.
 *
 * Usage: node seed-scoring-logic.js
 */
const { seed } = require('./seed-football');

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
