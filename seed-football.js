require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || 'stance-dashboard';

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const schemaDoc = {
    id: 'football_u15_16',
    name: 'Football Readiness - U16',
    sport: 'Football',
    gender: 'Mixed',
    ageGroup: 'U16',
    asymmetryThreshold: 10,
    scoreBand: { build: 50, develop: 70, ready: 85 },
    segments: [
      { id: 'strength',            title: 'Strength',                          abbr: 'STR', categoryWeight: 24, summary: 'Force Frame strength across hip, knee, ankle and calf. Identifies force deficits and left-right asymmetry that affect football performance and injury risk.' },
      { id: 'power',               title: 'Power',                             abbr: 'PWR', categoryWeight: 20, summary: 'Jump and rate-of-force qualities from Force Decks. Reflects lower-body explosiveness, reactive strength and neuromuscular readiness for sprinting and kicking.' },
      { id: 'speed_agility',       title: 'Ground Fitness',                     abbr: 'SPD', categoryWeight: 36, summary: 'Field-based fitness tests. Covers linear acceleration, maximum aerobic speed and running endurance — critical qualities for football match demands.' },
      { id: 'change_of_direction', title: 'Change of Direction',               abbr: 'COD', categoryWeight: 70, summary: 'Agility tests with and without ball that measure deceleration, re-acceleration and technical control under speed — key football-specific movement qualities.' },
      { id: 'mobility_endurance',  title: 'Mobility, Endurance & Structure',   abbr: 'MOB', categoryWeight: 15, summary: 'Mobility screens, trunk endurance holds and clinical tests that assess movement quality, injury risk factors and structural health.' }
    ],
    tests: [
      // ── STRENGTH ──────────────────────────────────────────────────────────────
      { id: 'hip_abduction',        name: 'Hip Abduction',                  category: 'Force Frame',               unit: 'Newton',  min: 210,  max: 426,  direction: 'higher', type: 'Bilateral - with Asym',    weight: 2.5, icon: 'ABD',  segment: 'strength',            explanation: 'Hip abductor strength supports pelvic control, running stability and lateral movement efficiency.' },
      { id: 'hip_adduction',        name: 'Hip Adduction',                  category: 'Force Frame',               unit: 'Newton',  min: 200,  max: 530,  direction: 'higher', type: 'Bilateral - with Asym',    weight: 2.5, icon: 'ADD',  segment: 'strength',            explanation: 'Hip adductor strength is critical for groin health, kicking power and change-of-direction control.' },
      { id: 'knee_flexion',         name: 'Knee Flexion (Prone)',           category: 'Force Frame',               unit: 'Newton',  min: 130,  max: 150,  direction: 'higher', type: 'Bilateral - with Asym',    weight: 3,   icon: 'KNE',  segment: 'strength',            explanation: 'Hamstring strength is important for sprint durability, deceleration and knee protection.' },
      { id: 'knee_extension',       name: 'Knee Extension (Seated)',        category: 'Force Frame',               unit: 'Newton',  min: 170,  max: 350,  direction: 'higher', type: 'Bilateral - with Asym',    weight: 3,   icon: 'KNE',  segment: 'strength',            explanation: 'Quad strength supports kicking, running, landing and repeated knee-dominant work.' },
      { id: 'hip_extension',        name: 'Hip Extension (Prone)',          category: 'Force Frame',               unit: 'Newton',  min: 500,  max: 610,  direction: 'higher', type: 'Bilateral - with Asym',    weight: 4,   icon: 'HIP',  segment: 'strength',            explanation: 'Posterior-chain output drives propulsion in sprinting and supports hamstring resilience.' },
      { id: 'hip_flexion',          name: 'Hip Flexion (Seated)',           category: 'Force Frame',               unit: 'Newton',  min: 160,  max: 300,  direction: 'higher', type: 'Bilateral - with Asym',    weight: 5,   icon: 'HIP',  segment: 'strength',            explanation: 'Hip flexor strength influences knee drive, stride length and repeated sprint output.' },
      { id: 'ankle_plantarflexion', name: 'Ankle Plantarflexion',          category: 'Force Frame',               unit: 'Newton',  min: 750,  max: 1000, direction: 'higher', type: 'Bilateral - with Asym',    weight: 4,   icon: 'CALF', segment: 'strength',            explanation: 'Calf strength supports sprint economy, ankle stiffness and ground contact efficiency.' },

      // ── POWER ─────────────────────────────────────────────────────────────────
      { id: 'cmj',                  name: 'CMJ (Countermovement Jump)',     category: 'Force Decks',               unit: 'CM',      min: 26,   max: 40,   direction: 'higher', type: 'Unilateral',               weight: 5,   icon: 'JMP',  segment: 'power',               explanation: 'Jump height reflects lower-body explosiveness and neuromuscular readiness for acceleration and aerial duels.' },
      { id: 'squat_jump',           name: 'Single Leg Jump',               category: 'Force Decks',               unit: 'N/s',     min: null, max: null, direction: 'higher', type: 'Bilateral - with Asym',    weight: 5,   icon: 'JMP',  segment: 'power',               explanation: 'Single leg jump RFD measured on each leg — highlights unilateral rate of force development and inter-limb asymmetry critical for sprinting and cutting.' },
      { id: 'double_leg_hop',       name: 'RSI',                           category: 'Force Decks',               unit: 'M/S',     min: 12,   max: 18,   direction: 'higher', type: 'Unilateral',               weight: 10,  icon: 'RSI',  segment: 'power',               explanation: 'Reactive strength index measures the ability to rapidly absorb and produce force — key for repeated sprint and cutting movements.' },
      { id: 'standing_broad_jump',  name: 'Standing Broad Jump',           category: 'Field Assessment',          unit: 'M',       min: 2.0,  max: 2.5,  direction: 'higher', type: 'Unilateral',               weight: 5,   icon: 'JMP',  segment: 'power',               explanation: 'Horizontal explosive power. ≥2.5 m is elite; ≥2.0 m is the minimum target for football performance demands.' },

      // ── GROUND FITNESS ────────────────────────────────────────────────────────
      { id: 'mas_test',             name: 'MAS Test',                      category: 'Field Assessment',          unit: 'M/S',     min: 3.9,  max: 5.0,  direction: 'higher', type: 'Unilateral',               weight: 20,  icon: 'MAS',  segment: 'speed_agility',       explanation: 'Maximum Aerobic Speed — the highest velocity that can be sustained aerobically. Reflects aerobic capacity and running efficiency for football match demands.' },
      { id: '10m_sprint_no_ball',   name: '10m Sprint (Without Ball)',     category: 'Field Assessment',          unit: 'Seconds', min: 1.75, max: 2.00, direction: 'lower',  type: 'Unilateral',               weight: 8,   icon: 'SPD',  segment: 'speed_agility',       explanation: 'Pure acceleration over 10 m — the most common sprint distance in football.' },
      { id: '30m_sprint_no_ball',   name: '30m Sprint (Without Ball)',     category: 'Field Assessment',          unit: 'Seconds', min: 4.20, max: 5.10, direction: 'lower',  type: 'Unilateral',               weight: 8,   icon: 'SPD',  segment: 'speed_agility',       explanation: 'Maximum velocity speed — reflects sprint capacity for runs in behind and recovery.' },

      // ── CHANGE OF DIRECTION ───────────────────────────────────────────────────
      { id: 'illinois_ball',        name: 'Illinois Test (With Ball)',     category: 'Field Assessment',          unit: 'Seconds', min: 18,   max: 21.5, direction: 'lower',  type: 'Unilateral',               weight: 8,   icon: 'COD',  segment: 'change_of_direction', explanation: 'Multi-directional agility test with ball — assesses dribbling agility and technical control at speed.' },
      { id: 'illinois_no_ball',     name: 'Illinois Test (Without Ball)',  category: 'Field Assessment',          unit: 'Seconds', min: 15.8, max: 18.5, direction: 'lower',  type: 'Unilateral',               weight: 12,  icon: 'COD',  segment: 'change_of_direction', explanation: 'Multi-directional agility without ball — baseline for pure movement quality and coordination.' },

      // ── MOBILITY, ENDURANCE & STRUCTURE ──────────────────────────────────────
      { id: 'trunk_endurance',      name: 'Trunk Endurance (Bunkie)',      category: 'Endurance',                 unit: 'Seconds', min: 20,   max: 40,   direction: 'higher', type: 'Unilateral',               weight: 0,   icon: 'CORE', segment: 'mobility_endurance',  explanation: 'Tests anterior, posterior and lateral stability chains. Scores ≥40s (power lines) and ≥20-30s (medial line) indicate adequate trunk robustness.' },
      { id: 'hip_ir',               name: 'Hip Internal Rotation',        category: 'Mobility',                  unit: 'Degrees', min: 35,   max: 40,   direction: 'higher', type: 'Bilateral - with Asym',    weight: 2.5, icon: 'HIP',  segment: 'mobility_endurance',  explanation: 'Hip IR ≥ 40° supports healthy running mechanics and reduces lower-back and groin injury risk.' },
      { id: 'hip_er',               name: 'Hip External Rotation',        category: 'Mobility',                  unit: 'Degrees', min: 40,   max: 45,   direction: 'higher', type: 'Bilateral - with Asym',    weight: 2.5, icon: 'HIP',  segment: 'mobility_endurance',  explanation: 'Hip ER ≥ 45° supports squat depth, lunge control and stable lower-limb mechanics.' },
      { id: 'df_lunge',             name: 'DF Lunge Test',                category: 'Mobility',                  unit: 'CM',      min: 10,   max: 14,   direction: 'higher', type: 'Bilateral - with Asym',    weight: 5,   icon: 'ANK',  segment: 'mobility_endurance',  explanation: 'Ankle dorsiflexion range is critical for running mechanics, landing and deceleration control.' },
      { id: 'lx_mobility',          name: 'Lumbar Flex / Ext / Side Flex', category: 'Mobility',                 unit: 'CM',      min: null, max: null, direction: 'higher', type: 'Unilateral',               weight: 5,   icon: 'LX',   segment: 'mobility_endurance',  explanation: 'Lumbar spine mobility screens. FF > +5 cm and Ext > 2 cm are target ranges.' },
      { id: 'clinical_screen',      name: 'Clinical Screening Tests',     category: 'MSK Screening - Subjective', unit: '',        min: null, max: null, direction: 'higher', type: 'Unilateral',               weight: 0,   icon: 'MSK',  segment: 'mobility_endurance',  explanation: "Lachmann's, McMurray, Thessaly, Ober's and adductor squeeze tests screen for structural and ligamentous concerns." },
      { id: 'subjective_history',   name: 'Position / Injury History',    category: 'MSK Screening - Subjective', unit: '',        min: null, max: null, direction: 'higher', type: 'Unilateral',               weight: 0,   icon: 'MSK',  segment: 'mobility_endurance',  explanation: 'Documents playing position, previous injuries, surgeries and current supplements for context and individualised interpretation.' }
    ]
  };

  await db.collection('report-schema').replaceOne({ id: 'football_u15_16' }, schemaDoc, { upsert: true });
  console.log('✓ report-schema saved: football_u15_16 with', schemaDoc.tests.length, 'tests across', schemaDoc.segments.length, 'segments');

  await client.close();
}

seed().catch(err => { console.error(err); process.exit(1); });
