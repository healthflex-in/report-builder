/**
 * Seeds the Football Readiness - U16 assessment and its linked scoring logic.
 *
 * Source: Football U16 Male Assessment Sheet.
 * Score columns: 0, 25, 50, 60, 70, 80, 90, 100.
 * Each scale point uses the minimum numeric value of its spreadsheet cell.
 * Yellow rows are lower-is-better. Green rows are bilateral/asymmetry tests.
 *
 * Usage: node seed-football.js
 */
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || 'stance-dashboard';
const SCORES = [0, 25, 50, 60, 70, 80, 90, 100];

const CATEGORY_TITLES = {
  strength: 'Strength',
  power: 'Power',
  ground_fitness: 'Ground Fitness',
  mobility_endurance: 'Endurance',
  change_of_direction: 'Change of Direction',
};

const CATEGORY_SUMMARIES = {
  strength: 'Force Frame strength across the hip, knee and ankle. Identifies force deficits and left-right asymmetry that affect football performance and injury risk.',
  power: 'Jump and reactive qualities from Force Decks plus standing broad jump. Reflects lower-body explosiveness, reactive strength and horizontal power for sprinting and kicking.',
  ground_fitness: 'Field-based linear speed tests covering 10 m, 30 m and 40 m acceleration — critical qualities for football match demands.',
  mobility_endurance: 'Maximum aerobic speed, the highest velocity that can be sustained aerobically. Reflects aerobic capacity and running efficiency for football match demands.',
  change_of_direction: 'Illinois agility tests with and without ball that measure deceleration, re-acceleration and technical control under speed.',
};

const TEST_METADATA = {
  knee_extension: { icon: 'KNE', explanation: 'Quadriceps strength supports kicking, running, landing and repeated knee-dominant work.' },
  knee_flexion: { icon: 'KNE', explanation: 'Hamstring strength is important for sprint durability, deceleration and knee protection.' },
  hip_extension: { icon: 'HIP', explanation: 'Posterior-chain output drives propulsion in sprinting and supports hamstring resilience.' },
  hip_flexion: { icon: 'HIP', explanation: 'Hip-flexor strength influences knee drive, stride length and repeated sprint output.' },
  plantarflexion: { icon: 'CALF', explanation: 'Calf strength supports sprint economy, ankle stiffness and ground contact efficiency.' },
  hip_adduction: { icon: 'ADD', explanation: 'Hip adductor strength is critical for groin health, kicking power and change-of-direction control.' },
  hip_abduction: { icon: 'ABD', explanation: 'Hip abductor strength supports pelvic control, running stability and lateral movement efficiency.' },
  cmj: { icon: 'JMP', explanation: 'Jump height reflects lower-body explosiveness and neuromuscular readiness for acceleration and aerial duels.' },
  slj: { icon: 'JMP', explanation: 'Single-leg jump height highlights unilateral lower-body power and inter-limb asymmetry critical for sprinting and cutting.' },
  dl_hop_rsi: { icon: 'RSI', explanation: 'Reactive strength index measures the ability to rapidly absorb and produce force — key for repeated sprint and cutting movements.' },
  standing_broad_jump: { icon: 'JMP', explanation: 'Horizontal explosive power and lower-body force transfer for acceleration and match actions.' },
  '10_m': { icon: 'SPD', explanation: 'Pure acceleration over 10 m — the most common sprint distance in football.' },
  '30_m': { icon: 'SPD', explanation: 'Maximum velocity speed — reflects sprint capacity for runs in behind and recovery.' },
  '40_m': { icon: 'SPD', explanation: 'The 40-m sprint measures acceleration through to maximum-velocity sprint capacity.' },
  mas: { icon: 'MAS', explanation: 'Maximum Aerobic Speed — the highest velocity that can be sustained aerobically. Reflects aerobic capacity and running efficiency for football match demands.' },
  illinois_without_ball: { icon: 'COD', explanation: 'Multi-directional agility without ball — baseline for pure movement quality and coordination.' },
  illinois_with_ball: { icon: 'COD', explanation: 'Multi-directional agility test with ball — assesses dribbling agility and technical control at speed.' },
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function test({ segment, equipment, name, unit, direction = 'higher', asymmetry = false, weight, anchors, bands, id: explicitId }) {
  const id = explicitId || slugify(name);
  const metadata = TEST_METADATA[id];
  if (!metadata) throw new Error(`Missing test metadata for ${id}`);
  if (anchors && anchors.length !== SCORES.length) {
    throw new Error(`${id} must have ${SCORES.length} score anchors`);
  }

  const schemaTest = {
    id,
    segment,
    category: CATEGORY_TITLES[segment] || '',
    equipment,
    name,
    unit,
    direction,
    type: asymmetry ? 'Bilateral - with Asym' : 'Unilateral',
    weight,
    icon: metadata.icon,
    explanation: metadata.explanation,
    trainingFocus: '',
  };

  if (anchors) {
    schemaTest.min = anchors[0];
    schemaTest.max = anchors[anchors.length - 1];
    schemaTest.scoringRule = {
      testId: id,
      method: 'interpolate',
      direction,
      unit,
      weight,
      scale: anchors.map((value, index) => ({ value, score: SCORES[index] })),
      sourceBands: bands,
    };
  }

  return schemaTest;
}

const tests = [
  // ── STRENGTH — category weight 20 ─────────────────────────────────────────
  test({ segment: 'strength', equipment: 'Force Frame', name: 'Knee Extension', unit: 'Newton', asymmetry: true, weight: 14, anchors: [173, 173, 230, 264, 298, 332, 366, 400], bands: ['173', '173 to 230', '230 to 264', '264 to 298', '298 to 332', '332 to 366', '366 to 400', '400+'] }),
  test({ segment: 'strength', equipment: 'Force Frame', name: 'Knee Flexion', unit: 'Newton', asymmetry: true, weight: 14, anchors: [145, 145, 190, 216, 242, 268, 294, 320], bands: ['145', '145 to 190', '190 to 216', '216 to 242', '242 to 268', '268 to 294', '294 to 320', '320+'] }),
  test({ segment: 'strength', equipment: 'Force Frame', name: 'Hip Extension', unit: 'Newton', asymmetry: true, weight: 16, anchors: [375, 375, 500, 580, 660, 740, 820, 900], bands: ['375', '375 to 500', '500 to 580', '580 to 660', '660 to 740', '740 to 820', '820 to 900', '900+'] }),
  test({ segment: 'strength', equipment: 'Force Frame', name: 'Hip Flexion', unit: 'Newton', asymmetry: true, weight: 14, anchors: [175, 175, 225, 250, 275, 300, 325, 350], bands: ['175', '175 to 225', '225 to 250', '250 to 275', '275 to 300', '300 to 325', '325 to 350', '350+'] }),
  test({ segment: 'strength', equipment: 'Force Frame', name: 'Plantarflexion', unit: 'Newton', asymmetry: true, weight: 16, anchors: [337, 337, 450, 530, 610, 690, 770, 850], bands: ['337', '337 to 450', '450 to 530', '530 to 610', '610 to 690', '690 to 770', '770 to 850', '850+'] }),
  test({ segment: 'strength', equipment: 'Force Frame', name: 'Hip Adduction', unit: 'Newton', asymmetry: true, weight: 14, anchors: [150, 150, 200, 306, 412, 518, 624, 730], bands: ['150', '150 to 200', '200 to 306', '306 to 412', '412 to 518', '518 to 624', '624 to 730', '730+'] }),
  test({ segment: 'strength', equipment: 'Force Frame', name: 'Hip Abduction', unit: 'Newton', asymmetry: true, weight: 12, anchors: [157, 157, 210, 253, 296, 339, 382, 425], bands: ['157', '157 to 210', '210 to 253', '253 to 296', '296 to 339', '339 to 382', '382 to 425', '425+'] }),

  // ── POWER — category weight 20 ────────────────────────────────────────────
  test({ segment: 'power', equipment: 'Force Decks', name: 'CMJ (Jump Ht)', unit: 'CM', weight: 20, anchors: [22, 22, 26, 29, 32, 35, 38, 41], bands: ['22', '22 to 26', '26 to 29', '29 to 32', '32 to 35', '35 to 38', '38 to 41', '41 +'] }),
  test({ segment: 'power', equipment: 'Force Decks', name: 'SLJ (Jump Ht)', unit: 'CM', asymmetry: true, weight: 20, anchors: [10, 10, 12, 13.5, 14.5, 15.5, 16.5, 18], bands: ['10', '10 to 12', '12 to 13.5', '13.5 to 14.5', '14.5 to 15.5', '15.5 to 16.5', '16.5 to 18', '18 +'] }),
  test({ segment: 'power', equipment: 'Force Decks', name: 'DL Hop RSI', unit: 'M', weight: 30, anchors: [1.4, 1.4, 1.55, 1.56, 1.7, 1.88, 2.05, 2.22], bands: ['1.4', '1.4', '1.55', '1.56 to 1.7', '1.7 to 1.88', '1.88 to 2.05', '2.05 to 2.2', '2.22+'] }),
  test({ segment: 'power', equipment: 'Field Assessment', name: 'Standing Broad Jump', unit: 'M', weight: 30, anchors: [1.7, 1.7, 1.8, 1.9, 2.05, 2.17, 2.3, 2.4], bands: ['1.7', '1.7 to 1.8', '1.8 to 1.9', '1.9 to 2.05', '2.05 to 2.17', '2.17 to 2.3', '2.3 to 2.4', '2.4+'] }),

  // ── GROUND FITNESS — category weight 20 ───────────────────────────────────
  test({ segment: 'ground_fitness', equipment: 'Field Assessment', name: '10 M', unit: 'Sec', direction: 'lower', weight: 10, anchors: [2, 1.95, 1.9, 1.85, 1.8, 1.75, 1.7, 1.7], bands: ['2', '2 to 1.95', '1.95 to 1.9', '1.9 to 1.85', '1.85 to 1.8', '1.8 to 1.75', '1.75 to 1.7', '1.7-'] }),
  test({ segment: 'ground_fitness', equipment: 'Field Assessment', name: '30 M', unit: 'Sec', direction: 'lower', weight: 5, anchors: [5.4, 5.1, 4.9, 4.74, 4.56, 4.38, 4.2, 4.2], bands: ['5.4', '5.4 to 5.1', '5.1 to 4.9', '4.9 to 4.74', '4.74 to 4.56', '4.56 to 4.38', '4.38 to 4.2', '4.2-'] }),
  // 40 M is listed on the sheet with weight 15, but the 0–100 cells are blank.
  test({ segment: 'ground_fitness', equipment: 'Field Assessment', name: '40 M', unit: 'Sec', direction: 'lower', weight: 15 }),

  // ── MOBILITY, ENDURANCE & STRUCTURE — category weight 20 ──────────────────
  test({ segment: 'mobility_endurance', equipment: 'Field Assessment', name: 'MAS', unit: 'M/S', direction: 'higher', weight: 40, anchors: [3.3, 3.3, 3.4, 3.6, 3.7, 3.85, 4.0, 4.15], bands: ['3.3', '3.3 to 3.4', '3.4 to 3.6', '3.6 to 3.7', '3.7 to 3.85', '3.85 to 4.0', '4.0 to 4.15', '4.15+'] }),

  // ── CHANGE OF DIRECTION — category weight 20 ──────────────────────────────
  test({ id: 'illinois_without_ball', segment: 'change_of_direction', equipment: 'Field Assessment', name: 'Illinois (Without Ball)', unit: 'Sec', direction: 'lower', weight: 12, anchors: [20, 18.5, 17.9, 17.4, 16.8, 16.3, 15.8, 15.8], bands: ['20', '20 to 18.5', '18.5 to 17.9', '17.9 to 17.4', '17.4 to 16.8', '16.8 to 16.3', '16.3 to 15.8', '15.8-'] }),
  test({ id: 'illinois_with_ball', segment: 'change_of_direction', equipment: 'Field Assessment', name: 'Illinois (With Ball)', unit: 'Sec', direction: 'lower', weight: 13, anchors: [22.6, 21.5, 20.8, 20.0, 19.4, 18.7, 18.0, 18.0], bands: ['22.6', '22.6 to 21.5', '21.5 to 20.8', '20.8 to 20.0', '20.0 to 19.4', '19.4 to 18.7', '18.7 to 18.0', '18.0-'] }),
];

const segments = [
  { id: 'strength', title: 'Strength', abbr: 'STR', categoryWeight: 20, summary: CATEGORY_SUMMARIES.strength },
  { id: 'power', title: 'Power', abbr: 'PWR', categoryWeight: 20, summary: CATEGORY_SUMMARIES.power },
  { id: 'ground_fitness', title: 'Ground Fitness', abbr: 'GRD', categoryWeight: 20, summary: CATEGORY_SUMMARIES.ground_fitness },
  { id: 'mobility_endurance', title: 'Endurance', abbr: 'END', categoryWeight: 20, summary: CATEGORY_SUMMARIES.mobility_endurance },
  { id: 'change_of_direction', title: 'Change of Direction', abbr: 'COD', categoryWeight: 20, summary: CATEGORY_SUMMARIES.change_of_direction },
];

async function seed() {
  if (!uri) throw new Error('MONGO_URI is not set');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const schemaDoc = {
    id: 'football_u15_16',
    name: 'Football Readiness - U16',
    sport: 'Football',
    gender: 'Male',
    ageGroup: 'U16',
    asymmetryThreshold: 10,
    scoreBand: { developmental: 50, professional: 70, elite: 85 },
    report: {
      showRadar: true,
      showSegmentReadiness: true,
      showTrainingFocus: true,
      showKeyConstraints: true,
      showAsymmetryWatchlist: true,
      maxTrainingFocusItems: 4,
      maxKeyConstraints: 5,
    },
    segments,
    tests: tests.map(({ scoringRule, ...schemaTest }) => schemaTest),
  };

  const scoringDoc = {
    id: 'scoring_football_u15_16',
    type: 'report-scoring-logic',
    schemaId: 'football_u15_16',
    sport: 'Football',
    category: 'U16 Male',
    categorySummaries: Object.entries(CATEGORY_SUMMARIES).map(([id, summary]) => ({
      id,
      title: CATEGORY_TITLES[id],
      summary,
    })),
    version: 3,
    description: 'Scoring rules for Football U16 Male assessment. Values transcribed from the Football U16 Male Assessment Sheet.',
    rules: tests.map(({ scoringRule }) => scoringRule).filter(Boolean),
  };

  await db.collection('report-schema').replaceOne({ id: schemaDoc.id }, schemaDoc, { upsert: true });
  await db.collection('report-scoring-logic').replaceOne({ id: scoringDoc.id }, scoringDoc, { upsert: true });

  console.log(`✓ report-schema saved: ${schemaDoc.id} (${schemaDoc.tests.length} tests, ${schemaDoc.segments.length} categories)`);
  console.log(`✓ report-scoring-logic saved: ${scoringDoc.id} (${scoringDoc.rules.length} rules)`);
  console.log('  Linked by schemaId:', scoringDoc.schemaId);
  console.log('  Score anchors:', SCORES.join(', '));
  console.log('  Categories:', schemaDoc.segments.map((s) => `${s.title} ${s.categoryWeight}`).join(' | '));

  await client.close();
}

if (require.main === module) {
  seed().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { seed };
