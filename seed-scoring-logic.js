/**
 * Seeds the report-scoring-logic collection for football_u15_16.
 *
 * VALUES ARE TAKEN DIRECTLY FROM THE SCORING SPREADSHEET (Column I).
 * Each test has exact value→score pairs as defined by the sport science team.
 *
 * Scoring methods:
 *   "interpolate" — linear interpolation between scale points (50–100%)
 *   "categorical" — discrete value → score mapping (e.g. Negative=100, Positive=50)
 *   "manual"      — no auto-scoring, clinician assigns qualitative notes
 *
 * Usage: node seed-scoring-logic.js
 */
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || 'stance-dashboard';

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const scoringDoc = {
    id: 'scoring_football_u15_16',
    type: 'report-scoring-logic',
    schemaId: 'football_u15_16',
    sport: 'Football',
    category: 'U15-16',
    version: 2,
    description: 'Scoring rules for Football U15/U16 assessment. Values transcribed from official scoring spreadsheet.',

    rules: [
      // ══════════════════════════════════════════════════════════════════════════
      // ROW 2 — STRENGTH: Hip Abduction (HP: 426N / LP: 210N)
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'hip_abduction',
        method: 'interpolate',
        direction: 'higher',
        unit: 'Newton',
        weight: 5,
        scale: [
          { value: 210, score: 50 },
          { value: 253.2, score: 60 },
          { value: 296.4, score: 70 },
          { value: 339.6, score: 80 },
          { value: 382.8, score: 90 },
          { value: 426, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 2 — STRENGTH: Hip Adduction (HP: 530N / LP: 200N)
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'hip_adduction',
        method: 'interpolate',
        direction: 'higher',
        unit: 'Newton',
        weight: 5,
        scale: [
          { value: 200, score: 50 },
          { value: 266, score: 60 },
          { value: 332, score: 70 },
          { value: 398, score: 80 },
          { value: 464, score: 90 },
          { value: 530, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 3 — STRENGTH: Knee Flexion (Prone) (HP: 150 / LP: 130)
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'knee_flexion',
        method: 'interpolate',
        direction: 'higher',
        unit: 'Newton',
        weight: 3,
        scale: [
          { value: 130, score: 50 },
          { value: 134, score: 60 },
          { value: 138, score: 70 },
          { value: 142, score: 80 },
          { value: 146, score: 90 },
          { value: 150, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 4 — STRENGTH: Knee Extension (Seated) (HP: 350 / LP: 170)
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'knee_extension',
        method: 'interpolate',
        direction: 'higher',
        unit: 'Newton',
        weight: 3,
        scale: [
          { value: 170, score: 50 },
          { value: 206, score: 60 },
          { value: 242, score: 70 },
          { value: 278, score: 80 },
          { value: 314, score: 90 },
          { value: 350, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 5 — STRENGTH: Hip Extension (Prone) (HP: 610 / LP: 500)
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'hip_extension',
        method: 'interpolate',
        direction: 'higher',
        unit: 'Newton',
        weight: 4,
        scale: [
          { value: 500, score: 50 },
          { value: 522, score: 60 },
          { value: 544, score: 70 },
          { value: 566, score: 80 },
          { value: 588, score: 90 },
          { value: 610, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 6 — STRENGTH: Hip Flexion (Seated) (HP: 300 / LP: 160)
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'hip_flexion',
        method: 'interpolate',
        direction: 'higher',
        unit: 'Newton',
        weight: 5,
        scale: [
          { value: 160, score: 50 },
          { value: 188, score: 60 },
          { value: 216, score: 70 },
          { value: 244, score: 80 },
          { value: 272, score: 90 },
          { value: 300, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 7 — STRENGTH: Ankle Plantarflexion (HP: 1000 / LP: 750)
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'ankle_plantarflexion',
        method: 'interpolate',
        direction: 'higher',
        unit: 'Newton',
        weight: 4,
        scale: [
          { value: 750, score: 50 },
          { value: 800, score: 60 },
          { value: 850, score: 70 },
          { value: 900, score: 80 },
          { value: 950, score: 90 },
          { value: 1000, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 8 — POWER: CMJ (HP: 40CM / LP: 26CM)
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'cmj',
        method: 'interpolate',
        direction: 'higher',
        unit: 'CM',
        weight: 5,
        scale: [
          { value: 26, score: 50 },
          { value: 28.8, score: 60 },
          { value: 31.6, score: 70 },
          { value: 34.4, score: 80 },
          { value: 37.2, score: 90 },
          { value: 40, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 9 — POWER: Squat Jump / Single Leg Jump (Minimum RFD: 2500N)
      // Bilateral with asymmetry — no fixed interpolation scale in the sheet.
      // Weight = 5
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'squat_jump',
        method: 'categorical',
        direction: 'higher',
        unit: 'N',
        weight: 5,
        description: 'Single leg jump RFD. Minimum RFD for squat jumps: 2500N. Bilateral with asymmetry check.',
        categories: {
          'Negative': 100,
          'Positive': 50,
        },
      },

      // ══════════════════════════════════════════════════════════════════════════
      // POWER: Standing Broad Jump (HP: 2.5 M / LP: 2.0 M)
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'standing_broad_jump',
        method: 'interpolate',
        direction: 'higher',
        unit: 'M',
        weight: 5,
        scale: [
          { value: 2.0, score: 50 },
          { value: 2.1, score: 60 },
          { value: 2.2, score: 70 },
          { value: 2.3, score: 80 },
          { value: 2.4, score: 90 },
          { value: 2.5, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 10 — POWER: RSI (HP: 1.8 M/s / LP: 1.2 M/s)
      // NOTE: Scale is 1.2–1.8 (NOT 12–18!)
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'double_leg_hop',
        method: 'interpolate',
        direction: 'higher',
        unit: 'M/S',
        weight: 10,
        scale: [
          { value: 1.2, score: 50 },
          { value: 1.32, score: 60 },
          { value: 1.44, score: 70 },
          { value: 1.56, score: 80 },
          { value: 1.68, score: 90 },
          { value: 1.8, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 11 — SPEED & AGILITY: Cooper Test / Lactate Threshold / MAS
      // HP: 2800M+ / LP: 2200M (unit is METERS, not M/S!)
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'mas_test',
        method: 'interpolate',
        direction: 'higher',
        unit: 'Meters',
        weight: 20,
        scale: [
          { value: 2200, score: 50 },
          { value: 2320, score: 60 },
          { value: 2440, score: 70 },
          { value: 2560, score: 80 },
          { value: 2680, score: 90 },
          { value: 2800, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 12 — SPEED & AGILITY: 10m Sprint Without Ball
      // HP: <1.75 secs / LP: 2.00 Secs (Lower Better)
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: '10m_sprint_no_ball',
        method: 'interpolate',
        direction: 'lower',
        unit: 'Seconds',
        weight: 8,
        scale: [
          { value: 2.00, score: 50 },
          { value: 1.95, score: 60 },
          { value: 1.90, score: 70 },
          { value: 1.85, score: 80 },
          { value: 1.80, score: 90 },
          { value: 1.75, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 13 — SPEED & AGILITY: 30m Sprint Without Ball
      // HP: <4.20 secs / LP: 5.10 Secs (Lower Better)
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: '30m_sprint_no_ball',
        method: 'interpolate',
        direction: 'lower',
        unit: 'Seconds',
        weight: 8,
        scale: [
          { value: 5.10, score: 50 },
          { value: 4.92, score: 60 },
          { value: 4.74, score: 70 },
          { value: 4.56, score: 80 },
          { value: 4.38, score: 90 },
          { value: 4.20, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 14 — CHANGE OF DIRECTION: Illinois Test (With Ball)
      // HP: <18 secs / LP: 21.5 Secs (Lower Better)
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'illinois_ball',
        method: 'interpolate',
        direction: 'lower',
        unit: 'Seconds',
        weight: 8,
        scale: [
          { value: 21.5, score: 50 },
          { value: 20.8, score: 60 },
          { value: 20.1, score: 70 },
          { value: 19.4, score: 80 },
          { value: 18.7, score: 90 },
          { value: 18.0, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 15 — CHANGE OF DIRECTION: Illinois Test (Without Ball)
      // HP: <15.8 secs / LP: 18.5 Secs (Lower Better)
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'illinois_no_ball',
        method: 'interpolate',
        direction: 'lower',
        unit: 'Seconds',
        weight: 12,
        scale: [
          { value: 18.5, score: 50 },
          { value: 17.96, score: 60 },
          { value: 17.42, score: 70 },
          { value: 16.88, score: 80 },
          { value: 16.34, score: 90 },
          { value: 15.8, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 16 — MOBILITY: Trunk Endurance (Bunkie)
      // ≥40 seconds: Anterior/Posterior/Lateral Power Lines
      // ≥20-30 seconds: Medial Stabilizing Line
      // Higher Better, Weight: 15, Category Weight: 15
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'trunk_endurance',
        method: 'interpolate',
        direction: 'higher',
        unit: 'Seconds',
        weight: 15,
        description: '≥40s for Anterior/Posterior/Lateral Power Lines. ≥20-30s for Medial Stabilizing Line.',
        scale: [
          { value: 20, score: 50 },
          { value: 24, score: 60 },
          { value: 28, score: 70 },
          { value: 32, score: 80 },
          { value: 36, score: 90 },
          { value: 40, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 17 — MOBILITY: Hip IR and ER
      // IR ≥ 40, ER ≥ 45 (Normal ROMs)
      // Weight: 5, Category Weight: 5
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'hip_ir',
        method: 'interpolate',
        direction: 'higher',
        unit: 'Degrees',
        weight: 5,
        scale: [
          { value: 35, score: 50 },
          { value: 36, score: 60 },
          { value: 37, score: 70 },
          { value: 38, score: 80 },
          { value: 39, score: 90 },
          { value: 40, score: 100 },
        ],
      },
      {
        testId: 'hip_er',
        method: 'interpolate',
        direction: 'higher',
        unit: 'Degrees',
        weight: 5,
        scale: [
          { value: 40, score: 50 },
          { value: 41, score: 60 },
          { value: 42, score: 70 },
          { value: 43, score: 80 },
          { value: 44, score: 90 },
          { value: 45, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 18 — MOBILITY: DF Lunge Test (10-14 cm, Normal ROMs)
      // Weight: 5, Category Weight: 5
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'df_lunge',
        method: 'interpolate',
        direction: 'higher',
        unit: 'CM',
        weight: 5,
        scale: [
          { value: 10, score: 50 },
          { value: 10.8, score: 60 },
          { value: 11.6, score: 70 },
          { value: 12.4, score: 80 },
          { value: 13.2, score: 90 },
          { value: 14, score: 100 },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 19 — MOBILITY: Lumbar Flex / Ext / Side Flex
      // FF > +5.0cms, Ext > 2.0cms (Normal ROMs)
      // Weight: 5, Category Weight: 5
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'lx_mobility',
        method: 'categorical',
        direction: 'higher',
        unit: 'CM',
        weight: 5,
        description: 'Lumbar mobility screens. FF > +5.0cm and Ext > 2.0cm are target ranges. Normal ROMs.',
        categories: {
          'Negative': 100,
          'Positive': 50,
        },
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 20 — MOBILITY: Clinical Screening Tests
      // Lachmann's, McMurray, Thessaly, Ober's, Adductor squeeze
      // Result: Negative = pass, direction: -ve
      // Weight: 0, Category Weight: 0
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'clinical_screen',
        method: 'categorical',
        direction: 'higher',
        unit: '',
        weight: 0,
        description: "Lachmann's, McMurray, Thessaly, Ober's, Adductor squeeze. Negative = clear.",
        categories: {
          'Negative': 100,
          'Positive': 50,
        },
      },

      // ══════════════════════════════════════════════════════════════════════════
      // ROW 21 — MOBILITY: Position / Injury History (Subjective)
      // Documentation (dashboard) — no auto-scoring
      // direction: -ve, Weight: 0, Category Weight: 0
      // ══════════════════════════════════════════════════════════════════════════
      {
        testId: 'subjective_history',
        method: 'manual',
        direction: 'higher',
        unit: '',
        weight: 0,
        description: 'Position/Previous injuries/surgeries/current supplements. Subjective documentation only.',
      },
    ],
  };

  await db.collection('report-scoring-logic').replaceOne(
    { id: 'scoring_football_u15_16' },
    scoringDoc,
    { upsert: true }
  );

  console.log('✓ report-scoring-logic saved: scoring_football_u15_16 (v2)');
  console.log('  → Linked to report-schema: football_u15_16');
  console.log('  → Rules:', scoringDoc.rules.length, 'tests');
  console.log('  → Methods: interpolate(' +
    scoringDoc.rules.filter(r => r.method === 'interpolate').length + '), categorical(' +
    scoringDoc.rules.filter(r => r.method === 'categorical').length + '), manual(' +
    scoringDoc.rules.filter(r => r.method === 'manual').length + ')');
  console.log('');

  // Print all scales for verification
  console.log('── SCORING SCALES (from spreadsheet) ──────────────────────────');
  for (const rule of scoringDoc.rules) {
    if (rule.method === 'interpolate') {
      const scaleStr = rule.scale.map(s => `${s.value}=${s.score}%`).join(', ');
      console.log(`  ${rule.testId.padEnd(24)} [${rule.direction}] w=${rule.weight}  │ ${scaleStr}`);
    } else if (rule.method === 'categorical') {
      console.log(`  ${rule.testId.padEnd(24)} [categorical] w=${rule.weight}  │ Negative=100%, Positive=50%`);
    } else {
      console.log(`  ${rule.testId.padEnd(24)} [manual]      w=${rule.weight}  │ No auto-scoring`);
    }
  }

  console.log('');
  console.log('── KEY CORRECTIONS FROM SPREADSHEET ───────────────────────────');
  console.log('  • RSI scale: 1.2–1.8 M/s (was incorrectly 12–18 before)');
  console.log('  • Cooper/MAS: 2200–2800 Meters (was incorrectly M/S before)');
  console.log('  • Trunk Endurance weight: 15 (was incorrectly 0 before)');
  console.log('  • Hip Adduction/Abduction are separate rules (not combined)');

  await client.close();
}

seed().catch(err => { console.error(err); process.exit(1); });
