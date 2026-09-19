/**
 * Seeds the Cricket Elite assessment and its linked scoring logic.
 *
 * Source: supplied Cricket Elite Assessment Scoresheet.
 * Score columns: I=0, J=25, K=50, L=60, M=70, N=80, O=90, P=100.
 * Each scale point uses the minimum numeric value of its spreadsheet cell.
 * Yellow rows are lower-is-better. Green rows are bilateral/asymmetry tests.
 *
 * Usage: node seed-cricket-elite.js
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
  nutrition: 'Nutrition',
};

const CATEGORY_SUMMARIES = {
  strength: 'Isometric strength measured through Force Frame across the hip, knee, ankle and shoulder joints. Identifies force deficits and left-right asymmetry that affect cricket performance and injury risk.',
  power: 'Jump and reactive qualities measured through Force Decks. Reflects explosiveness, reactive strength and neuromuscular readiness for sprinting- and jumping-related performance.',
  ground_fitness: 'Field-based fitness tests covering linear acceleration and maximum aerobic speed, two critical qualities for cricket match demands.',
  nutrition: 'Comprised of body-fat percentage and estimated basal metabolic rate. Reflects the athlete’s body composition.',
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Creates the one test definition used by both Mongo collections.
 * `anchors` are the minimum numeric values from columns I through P.
 * `bands` preserve the original spreadsheet cell values for audit/reference.
 */
const TEST_METADATA = {
  trunk_rotations: { icon: 'TRK', explanation: 'Trunk rotational strength supports efficient force transfer between the lower and upper body during high-velocity sporting actions.' },
  shoulder_er: { icon: 'SHL', explanation: 'Shoulder external-rotation strength supports shoulder stability, deceleration and resilient overhead movement.' },
  shoulder_ir: { icon: 'SHL', explanation: 'Shoulder internal-rotation strength contributes to force production and control through the shoulder complex.' },
  knee_extension: { icon: 'KNE', explanation: 'Quadriceps strength supports running, landing, knee control and repeated knee-dominant work.' },
  knee_flexion: { icon: 'KNE', explanation: 'Hamstring strength supports sprint durability, deceleration and knee protection.' },
  hip_extension: { icon: 'HIP', explanation: 'Posterior-chain output supports propulsion, acceleration and hamstring resilience.' },
  hip_flexion: { icon: 'HIP', explanation: 'Hip-flexor strength supports knee drive, stride mechanics and repeated acceleration.' },
  plantar_flexion: { icon: 'CALF', explanation: 'Calf strength supports ankle stiffness, ground-contact efficiency and running economy.' },
  hip_adduction: { icon: 'ADD', explanation: 'Hip-adductor strength supports groin health, force transfer and change-of-direction control.' },
  hip_abduction: { icon: 'ABD', explanation: 'Hip-abductor strength supports pelvic control, running stability and lateral movement efficiency.' },
  hip_ir: { icon: 'HIP', explanation: 'Hip internal-rotation strength supports rotational control and stable lower-limb mechanics.' },
  hip_er: { icon: 'HIP', explanation: 'Hip external-rotation strength supports hip stability and controlled force transfer through the lower limb.' },
  ankle_dorsiflexion: { icon: 'ANK', explanation: 'Dorsiflexor strength supports toe clearance, controlled landing and lower-leg resilience.' },
  ankle_inversion: { icon: 'ANK', explanation: 'Ankle-inversion strength supports medial ankle control and stability during dynamic movement.' },
  ankle_eversion: { icon: 'ANK', explanation: 'Ankle-eversion strength supports lateral ankle stability and helps protect against inversion injuries.' },
  imtp: { icon: 'IMTP', explanation: 'The isometric mid-thigh pull assesses maximal force capacity and the foundation for acceleration, jumping and high-intensity movement.' },
  cmj: { icon: 'JMP', explanation: 'Jump height reflects lower-body explosiveness and neuromuscular readiness.' },
  slj: { icon: 'JMP', explanation: 'Single-leg jump height highlights unilateral lower-body power and inter-limb asymmetry.' },
  dl_hop_rsi: { icon: 'RSI', explanation: 'Reactive strength index measures the ability to rapidly absorb and produce force during repeated contacts.' },
  plyo_push_up: { icon: 'PLY', explanation: 'Plyometric push-up force reflects upper-body explosive strength and rapid force production.' },
  standing_broad_jump: { icon: 'JMP', explanation: 'Standing broad jump assesses horizontal explosive power and lower-body force transfer.' },
  '10_m': { icon: 'SPD', explanation: 'The 10-m sprint measures initial acceleration and first-step explosiveness.' },
  '20_m': { icon: 'SPD', explanation: 'The 20-m sprint measures acceleration capacity through the early sprint phase.' },
  '40_m': { icon: 'SPD', explanation: 'The 40-m sprint measures acceleration through to maximum-velocity sprint capacity.' },
  mas: { icon: 'MAS', explanation: 'Maximum aerobic speed reflects aerobic capacity and running efficiency for repeated high-intensity efforts.' },
  skinfolds: { icon: 'NUT', explanation: 'Skinfold assessment estimates body-fat distribution and supports monitoring of body-composition goals.' },
  bmr: { icon: 'BMR', explanation: 'Basal metabolic rate relative to fat-free mass estimates baseline energy requirements and supports nutrition planning.' },
};

function test({ segment, equipment, name, unit, direction = 'higher', asymmetry = false, weight, anchors, bands }) {
  const id = slugify(name);
  const metadata = TEST_METADATA[id];
  if (!metadata) throw new Error(`Missing test metadata for ${id}`);

  return {
    id,
    segment,
    category: CATEGORY_TITLES[segment] || '',
    equipment,
    name,
    unit,
    direction,
    type: asymmetry ? 'Bilateral - with Asym' : 'Unilateral',
    weight,
    // I is the score-0 anchor; P is the score-100 anchor.
    min: anchors[0],
    max: anchors[anchors.length - 1],
    icon: metadata.icon,
    explanation: metadata.explanation,
    trainingFocus: '',
    scoringRule: {
      testId: id,
      method: 'interpolate',
      direction,
      unit,
      weight,
      scale: anchors.map((value, index) => ({ value, score: SCORES[index] })),
      sourceBands: bands,
    },
  };
}

const tests = [
  // ── STRENGTH — category weight 30 ─────────────────────────────────────────
  test({ segment: 'strength', equipment: 'VALD Force Frame', name: 'Trunk Rotations', unit: 'Newton', asymmetry: true, weight: 10, anchors: [188, 189, 250, 277, 303, 329, 355, 380], bands: ['188', '189 to 250', '250 to 276', '277 to 302', '303 to 328', '329 to 354', '355 to 380', '380+'] }),
  test({ segment: 'strength', equipment: 'VALD Force Frame', name: 'Shoulder ER', unit: 'Newton', asymmetry: true, weight: 6, anchors: [90, 90, 120, 141, 161, 181, 201, 220], bands: ['90', '90 to 120', '120 to 140', '141 to 160', '161 to 180', '181 to 200', '201 to 220', '220+'] }),
  test({ segment: 'strength', equipment: 'VALD Force Frame', name: 'Shoulder IR', unit: 'Newton', asymmetry: true, weight: 5, anchors: [135, 136, 180, 205, 229, 253, 277, 300], bands: ['135', '136 to 180', '180 to 205', '205 to 228', '229 to 252', '253 to 276', '277 to 300', '300+'] }),
  test({ segment: 'strength', equipment: 'VALD Force Frame', name: 'Knee Extension (Seated)', unit: 'Newton', asymmetry: true, weight: 6, anchors: [375, 376, 500, 570, 641, 711, 781, 850], bands: ['375', '376 to 500', '500 to 570', '570 to 640', '641 to 710', '711 to 780', '781 to 850', '850+'] }),
  test({ segment: 'strength', equipment: 'VALD Force Frame', name: 'Knee Flexion', unit: 'Newton', asymmetry: true, weight: 8, anchors: [263, 264, 350, 411, 471, 531, 591, 650], bands: ['263', '264 to 350', '350 to 410', '411 to 470', '471 to 530', '531 to 590', '591 to 650', '650+'] }),
  test({ segment: 'strength', equipment: 'VALD Force Frame', name: 'Hip Extension', unit: 'Newton', asymmetry: true, weight: 8, anchors: [475, 475, 500, 570, 640, 710, 780, 850], bands: ['475', '475 to 500', '500 to 570', '570 to 640', '640 to 710', '710 to 780', '780 to 850', '850+'] }),
  test({ segment: 'strength', equipment: 'VALD Force Frame', name: 'Hip Flexion', unit: 'Newton', asymmetry: true, weight: 6, anchors: [263, 263, 350, 400, 450, 500, 550, 600], bands: ['263', '263 to 350', '350 to 400', '400 to 450', '450 to 500', '500 to 550', '550 to 600', '600+'] }),
  test({ segment: 'strength', equipment: 'VALD Force Frame', name: 'Plantar Flexion', unit: 'Newton', asymmetry: true, weight: 8, anchors: [525, 525, 700, 800, 900, 1000, 1100, 1200], bands: ['525', '525 to 700', '700 to 800', '800 to 900', '900 to 1000', '1000 to 1100', '1100 to 1200', '1200+'] }),
  test({ segment: 'strength', equipment: 'VALD Force Frame', name: 'Hip Adduction', unit: 'Newton', asymmetry: true, weight: 5, anchors: [300, 300, 400, 450, 500, 550, 600, 650], bands: ['300', '300 to 400', '400 to 450', '450 to 500', '500 to 550', '550 to 600', '600 to 650', '650+'] }),
  test({ segment: 'strength', equipment: 'VALD Force Frame', name: 'Hip Abduction', unit: 'Newton', asymmetry: true, weight: 5, anchors: [263, 263, 350, 400, 450, 500, 550, 600], bands: ['263', '263 to 350', '350 to 400', '400 to 450', '450 to 500', '500 to 550', '550 to 600', '600+'] }),
  test({ segment: 'strength', equipment: 'VALD Force Frame', name: 'Hip IR', unit: 'Newton', asymmetry: true, weight: 5, anchors: [113, 113, 150, 160, 170, 180, 190, 200], bands: ['113', '113 to 150', '150 to 160', '160 to 170', '170 to 180', '180 to 190', '190 to 200', '200+'] }),
  test({ segment: 'strength', equipment: 'VALD Force Frame', name: 'Hip ER', unit: 'Newton', asymmetry: true, weight: 5, anchors: [110, 110, 120, 144, 168, 180, 192, 240], bands: ['110', '110 to 120', '120 to 144', '144 to 168', '168 to 180', '180 to 192', '192 to 216', '240+'] }),
  test({ segment: 'strength', equipment: 'VALD Force Frame', name: 'Ankle Dorsiflexion', unit: 'Newton', asymmetry: true, weight: 5, anchors: [131, 131, 175, 200, 225, 250, 275, 300], bands: ['131', '131 to 175', '175 to 200', '200 to 225', '225 to 250', '250 to 275', '275 to 300', '300+'] }),
  test({ segment: 'strength', equipment: 'VALD Force Frame', name: 'Ankle Inversion', unit: 'Newton', asymmetry: true, weight: 4, anchors: [82, 82, 110, 120, 130, 140, 150, 160], bands: ['82', '82 to 110', '110 to 120', '120 to 130', '130 to 140', '140 to 150', '150 to 160', '160+'] }),
  test({ segment: 'strength', equipment: 'VALD Force Frame', name: 'Ankle Eversion', unit: 'Newton', asymmetry: true, weight: 4, anchors: [83, 83, 110, 122, 134, 146, 158, 170], bands: ['83', '83 to 110', '110 to 122', '122 to 134', '134 to 146', '146 to 158', '158 to 170', '170+'] }),
  test({ segment: 'strength', equipment: 'VALD Force Frame', name: 'IMTP', unit: 'N/Kg', weight: 10, anchors: [21, 21, 26, 28, 30, 32, 34, 36], bands: ['21', '21 to 26', '26 to 28', '28 to 30', '30 to 33', '32 to 34', '34 to 36', '36+'] }),

  // ── POWER — category weight 25 ────────────────────────────────────────────
  test({ segment: 'power', equipment: 'VALD Force Deck', name: 'CMJ (Jump Height)', unit: 'CM', weight: 20, anchors: [27, 27, 35, 38, 41, 44, 47, 50], bands: ['27', '27 to 35', '35 to 38', '38 to 41', '41 to 44', '44 to 47', '47 to 50', '50+'] }),
  test({ segment: 'power', equipment: 'VALD Force Deck', name: 'SLJ (Jump Height)', unit: 'CM', asymmetry: true, weight: 20, anchors: [11, 11, 15, 17, 19, 22, 23, 25], bands: ['11', '11 to 15', '15 to 17', '17 to 19', '19 to 21', '22 to 23', '23 to 25', '25+'] }),
  test({ segment: 'power', equipment: 'VALD Force Deck', name: 'DL Hop RSI', unit: 'M', weight: 10, anchors: [1, 1, 1.5, 1.66, 1.82, 1.98, 2.14, 2.3], bands: ['1', '1 to 1.5', '1.5 to 1.66', '1.66 to 1.82', '1.82 to 1.98', '1.98 to 2.14', '2.14 to 2.3', '2.3+'] }),
  test({ segment: 'power', equipment: 'VALD Force Deck', name: 'Plyo Push Up (Peak Force Relative to BM N/Kg)', unit: 'N/Kg', weight: 30, anchors: [12, 12, 15, 18, 18, 21, 21, 29], bands: ['12', '12 to 15', '15 to 18', '18 to 21', '18 to 21', '21 to 25', '21 to 25', '29+'] }),
  test({ segment: 'power', equipment: 'VALD Force Deck', name: 'Standing Broad Jump', unit: 'M', weight: 20, anchors: [2, 2.1, 2.1, 2.3, 2.46, 2.54, 2.62, 2.7], bands: ['2', '2.1', '2.1 to 2.3', '2.3 to 2.46', '2.46 to 2.54', '2.54 to 2.62', '2.62 to 2.7', '2.7+'] }),

  // ── GROUND FITNESS — category weight 25 ────────────────────────────────────
  test({ segment: 'ground_fitness', equipment: 'Field Assessment', name: '10 M', unit: 'Sec', direction: 'lower', weight: 20, anchors: [2.2, 2.0, 1.9, 1.85, 1.8, 1.75, 1.71, 1.7], bands: ['2.2', '2.2 to 2.0', '2.0 to 1.9', '1.9 to 1.85', '1.85 to 1.8', '1.8 to 1.75', '1.75 to 1.71', '1.7-'] }),
  test({ segment: 'ground_fitness', equipment: 'Field Assessment', name: '20 M', unit: 'Sec', direction: 'lower', weight: 20, anchors: [3.5, 3.3, 3.2, 3.1, 3.0, 2.95, 2.85, 2.85], bands: ['3.5', '3.5 to 3.3', '3.3 to 3.2', '3.3 to 3.1', '3.1 to 3.0', '3.0 to 2.95', '2.95 to 2.85', '2.85-'] }),
  test({ segment: 'ground_fitness', equipment: 'Field Assessment', name: '40 M', unit: 'Sec', direction: 'lower', weight: 20, anchors: [5.8, 5.6, 5.5, 5.4, 5.36, 5.28, 5.2, 5.2], bands: ['5.8', '5.8 to 5.6', '5.6 to 5.5', '5.5 to 5.4', '5.44 to 5.36', '5.36 to 5.28', '5.28 to 5.2', '5.2-'] }),
  test({ segment: 'ground_fitness', equipment: 'Field Assessment', name: 'MAS', unit: 'M/S', weight: 40, anchors: [3, 3, 3.3, 3.5, 3.8, 4.0, 4.2, 4.4], bands: ['3', '3 to 3.3', '3.3 to 3.5', '3.5 to 3.8', '3.8 to 4.0', '4.0 to 4.2', '4.2 to 4.4', '4.4+'] }),

  // ── NUTRITION — category weight 20 ─────────────────────────────────────────
  test({ segment: 'nutrition', equipment: '', name: 'Skinfolds', unit: 'Sum', direction: 'lower', weight: 80, anchors: [125, 110, 98, 86, 74, 62, 50, 50], bands: ['125', '110 to 125', '98 to 110', '86 to 98', '74 to 86', '62 to 74', '50 to 62', '50-'] }),
  test({ segment: 'nutrition', equipment: '', name: 'BMR (Kcal/Kg FFM/Day)', unit: 'Kcal/Kg PFM/Day', weight: 20, anchors: [18, 18, 21, 23, 25, 27, 29, 31], bands: ['18', '18 to 21', '21 to 23', '23 to 25', '25 to 27', '27 to 29', '29 to 31', '31+'] }),
];

const segments = [
  { id: 'strength', title: 'Strength', abbr: 'STR', categoryWeight: 30, summary: CATEGORY_SUMMARIES.strength },
  { id: 'power', title: 'Power', abbr: 'PWR', categoryWeight: 25, summary: CATEGORY_SUMMARIES.power },
  { id: 'ground_fitness', title: 'Ground Fitness', abbr: 'GRD', categoryWeight: 25, summary: CATEGORY_SUMMARIES.ground_fitness },
  { id: 'nutrition', title: 'Nutrition', abbr: 'NUT', categoryWeight: 20, summary: CATEGORY_SUMMARIES.nutrition },
];

async function seed() {
  if (!uri) throw new Error('MONGO_URI is not set');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const schemaDoc = {
    id: 'cricket_elite',
    name: 'Cricket Elite',
    sport: 'Cricket',
    gender: '',
    ageGroup: '',
    segments,
    tests: tests.map(({ scoringRule, ...schemaTest }) => schemaTest),
  };

  const scoringDoc = {
    id: 'scoring_cricket_elite',
    type: 'report-scoring-logic',
    schemaId: 'cricket_elite',
    sport: 'Cricket',
    category: 'Cricket Elite',
    categorySummaries: Object.entries(CATEGORY_SUMMARIES).map(([id, summary]) => ({
      id,
      title: CATEGORY_TITLES[id],
      summary,
    })),
    version: 2,
    description: '',
    rules: tests.map(({ scoringRule }) => scoringRule),
  };

  await db.collection('report-schema').replaceOne({ id: schemaDoc.id }, schemaDoc, { upsert: true });
  await db.collection('report-scoring-logic').replaceOne({ id: scoringDoc.id }, scoringDoc, { upsert: true });

  console.log(`✓ report-schema saved: ${schemaDoc.id} (${schemaDoc.tests.length} tests)`);
  console.log(`✓ report-scoring-logic saved: ${scoringDoc.id} (${scoringDoc.rules.length} rules)`);
  console.log('  Linked by schemaId:', scoringDoc.schemaId);
  console.log('  Score anchors:', SCORES.join(', '));

  await client.close();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
