// NPC Town — soft pixel top-down. Tiny self-attention in TFJS drives ambient NPC chatter.
// Project NPCs are themed (Harsh's actual projects). Ambient NPCs talk via attention-weighted word picks.
// Originally an HTML/CSS/JS prototype from the Claude Design handoff bundle; ported to a Next.js client component.

import { useState, useEffect, useRef, CSSProperties, MouseEvent } from 'react';

// TFJS is loaded from CDN at runtime to keep it out of the main bundle.
declare global {
  interface Window {
    tf?: any;
  }
}

// ---------- TYPES ----------
type Embedding = number[];

interface ProjectNPCData {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  traits: Record<string, number>;
  title: string;
  body: string;
  tags: string[];
}

interface AmbientNPC {
  id: string;
  name: string;
  persona: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  embedding: Embedding;
}

interface BubbleData {
  id: string;
  npcId: string;
  text: string;
  x: number;
  y: number;
  born: number;
  ttl: number;
}

interface TranscriptEntry {
  id: string;
  speaker: string;
  listener: string;
  text: string;
  t: number;
}

interface AttentionApi {
  attentionScores: (embeddings: Embedding[]) => number[][];
  wordSoftmax: (query: Embedding, wordEmbs: Embedding[]) => number[];
  dispose: () => void;
}

// ---------- DATA ----------
// To add a new project NPC: append an object to PROJECT_NPCS below.
//   - id:     unique slug
//   - name:   short codename shown in-world
//   - color:  pixel-person body color (any CSS color)
//   - x, y:   spawn position in % (0-100). Keep clear of player center 50/50.
//   - traits: free-form dict of personality dimensions, shown as bars in the modal.
//   - title / body / tags: shown in the click-through modal.
const PROJECT_NPCS: ProjectNPCData[] = [
  { id: 'ocean', name: 'Dr. OCEAN', color: '#e8a5a5', x: 22, y: 32, traits: { vision: 1.0, medical: 1.0, classify: 0.9 },
    title: 'UBC-OCEAN',
    body: 'I predict ovarian cancer subtypes from whole-slide histopathology. Vision Transformers + multiple-instance learning across gigapixel slides.',
    tags: ['computer-vision', 'ViT', 'MIL', 'histopath'] },
  { id: 'mots', name: 'TRAK', color: '#a5c5e8', x: 72, y: 24, traits: { vision: 0.9, tracking: 1.0, segment: 1.0 },
    title: 'MOTS · BDD100K',
    body: 'Multi-object tracking + segmentation for the CVPR workshop. MaskDINO backbone with ByteTrack/SORT variants on driving video.',
    tags: ['MaskDINO', 'tracking', 'CVPR', 'BDD100K'] },
  { id: 'codex', name: 'CODEX', color: '#c5a5e8', x: 78, y: 70, traits: { language: 1.0, code: 1.0, generate: 0.9 },
    title: 'Graphic-Codex',
    body: 'Pre-ChatGPT: text → 3D animation by generating CARLA scene code from natural language. An early NL → world programming experiment.',
    tags: ['Codex', 'CARLA', 'code-gen'] },
  { id: 'tfjs', name: 'WEBCAM-1', color: '#a5e8c1', x: 18, y: 72, traits: { browser: 1.0, vision: 0.7, deploy: 1.0 },
    title: 'TFJS Webcam',
    body: 'Live image classifier that trains in your browser on webcam frames. Same family of models powering this very simulation.',
    tags: ['TensorFlow.js', 'browser-ML', 'live-train'] },
  { id: 'fractal', name: 'FORECAST-9', color: '#e8d4a5', x: 50, y: 18, traits: { forecast: 1.0, business: 1.0, scale: 0.9 },
    title: 'Sales Forecasting · Fractal',
    body: 'Flagship forecasting product — held under 15% MAPE through COVID. Scaled across APAC after the model success.',
    tags: ['forecasting', 'MAPE', 'Prophet', 'ARIMA'] },
  { id: 'ola', name: 'OPTI', color: '#e8c1a5', x: 50, y: 78, traits: { optimize: 1.0, logistics: 1.0, scale: 0.9 },
    title: 'Routing Optimization · Ola Electric',
    body: 'Reduced transportation costs ~30% (≈$6M/yr) by re-locating fulfillment centers. Plus a unified ETL that cut complaint resolution 40%.',
    tags: ['routing', 'MILP', 'ETL', 'logistics'] },
];

// vocabulary for ambient chatter — each word has a small embedding (8d)
// dimensions: [data, model, train, deploy, vision, language, fast, weird]
const VOCAB: [string, Embedding][] = [
  ['dataset',     [1.0, 0.2, 0.4, 0.0, 0.0, 0.0, 0.0, 0.0]],
  ['pipeline',    [0.9, 0.1, 0.3, 0.5, 0.0, 0.0, 0.2, 0.0]],
  ['embeddings',  [0.7, 0.8, 0.0, 0.0, 0.3, 0.5, 0.0, 0.1]],
  ['features',    [0.8, 0.5, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0]],
  ['tokens',      [0.6, 0.4, 0.1, 0.0, 0.0, 1.0, 0.0, 0.0]],
  ['batch',       [0.5, 0.3, 0.9, 0.0, 0.0, 0.0, 0.4, 0.0]],
  ['transformer', [0.0, 1.0, 0.4, 0.0, 0.0, 0.7, 0.0, 0.0]],
  ['attention',   [0.0, 1.0, 0.0, 0.0, 0.0, 0.6, 0.0, 0.2]],
  ['softmax',     [0.0, 0.9, 0.0, 0.0, 0.0, 0.3, 0.5, 0.0]],
  ['gradients',   [0.0, 0.7, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0]],
  ['loss',        [0.0, 0.6, 1.0, 0.0, 0.0, 0.0, 0.0, 0.1]],
  ['weights',     [0.0, 1.0, 0.7, 0.0, 0.0, 0.0, 0.0, 0.0]],
  ['MAPE',        [0.4, 0.6, 0.0, 0.3, 0.0, 0.0, 0.5, 0.0]],
  ['epoch',       [0.3, 0.2, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0]],
  ['overfitting', [0.4, 0.6, 0.9, 0.0, 0.0, 0.0, 0.0, 0.3]],
  ['lr-scheduler',[0.0, 0.4, 0.9, 0.0, 0.0, 0.0, 0.6, 0.0]],
  ['lambda',      [0.5, 0.0, 0.0, 1.0, 0.0, 0.0, 0.7, 0.0]],
  ['serverless',  [0.2, 0.0, 0.0, 1.0, 0.0, 0.0, 0.6, 0.0]],
  ['docker',      [0.3, 0.0, 0.0, 0.9, 0.0, 0.0, 0.4, 0.0]],
  ['browser',     [0.4, 0.5, 0.0, 1.0, 0.4, 0.0, 0.5, 0.0]],
  ['vercel',      [0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.7, 0.0]],
  ['pixels',      [0.5, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0]],
  ['histopath',   [0.7, 0.5, 0.0, 0.0, 1.0, 0.0, 0.0, 0.2]],
  ['tracking',    [0.4, 0.5, 0.3, 0.0, 1.0, 0.0, 0.6, 0.0]],
  ['segmentation',[0.3, 0.6, 0.4, 0.0, 1.0, 0.0, 0.0, 0.0]],
  ['coffee',      [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.4, 1.0]],
  ['existential', [0.0, 0.0, 0.0, 0.0, 0.0, 0.3, 0.0, 1.0]],
  ['vibes',       [0.0, 0.0, 0.0, 0.0, 0.0, 0.4, 0.3, 1.0]],
  ['semicolon',   [0.0, 0.0, 0.0, 0.4, 0.0, 0.5, 0.5, 0.9]],
  ['lol',         [0.0, 0.0, 0.0, 0.0, 0.0, 0.6, 0.6, 0.9]],
];

const PHRASE_TEMPLATES = [
  'did you see the {x}?',
  '{x} is rough today.',
  "i'm debugging {x}.",
  'ship the {x} already.',
  '{x} → {y}, finally.',
  'more {x}, less {y}.',
  '{x}? {y}.',
  'the {x} converged.',
  '{x} broke staging.',
  'another {x} kind of day.',
];

// ---------- TFJS ATTENTION ----------
async function setupAttention(): Promise<AttentionApi> {
  while (!window.tf) await new Promise(r => setTimeout(r, 100));
  const tf = window.tf;

  const Wq = tf.randomNormal([8, 8], 0, 0.5);
  const Wk = tf.randomNormal([8, 8], 0, 0.5);
  const Wv = tf.randomNormal([8, 8], 0, 0.5);

  function attentionScores(embeddings: Embedding[]): number[][] {
    return tf.tidy(() => {
      const X = tf.tensor2d(embeddings);
      const Q = X.matMul(Wq);
      const K = X.matMul(Wk);
      const scores = Q.matMul(K.transpose()).div(Math.sqrt(8));
      return tf.softmax(scores).arraySync();
    });
  }

  function wordSoftmax(query: Embedding, wordEmbs: Embedding[]): number[] {
    return tf.tidy(() => {
      const q = tf.tensor1d(query).reshape([1, 8]).matMul(Wq);
      const K = tf.tensor2d(wordEmbs).matMul(Wk);
      const scores = q.matMul(K.transpose()).div(Math.sqrt(8));
      return tf.softmax(scores).reshape([wordEmbs.length]).arraySync();
    });
  }

  return {
    attentionScores,
    wordSoftmax,
    dispose: () => { Wq.dispose(); Wk.dispose(); Wv.dispose(); },
  };
}

function sampleFromDist(dist: number[], temp = 0.8): number {
  const adjusted = dist.map(p => Math.pow(p, 1 / temp));
  const sum = adjusted.reduce((a, b) => a + b, 0);
  const norm = adjusted.map(p => p / sum);
  let r = Math.random();
  for (let i = 0; i < norm.length; i++) {
    r -= norm[i];
    if (r <= 0) return i;
  }
  return norm.length - 1;
}

// ---------- AMBIENT NPCS ----------
const PERSONAS: { key: string; bias: Embedding }[] = [
  { key: 'data-person',   bias: [1.0, 0.3, 0.2, 0.1, 0.0, 0.0, 0.2, 0.1] },
  { key: 'model-person',  bias: [0.2, 1.0, 0.6, 0.0, 0.1, 0.4, 0.1, 0.0] },
  { key: 'infra-person',  bias: [0.3, 0.0, 0.1, 1.0, 0.0, 0.0, 0.7, 0.0] },
  { key: 'vision-person', bias: [0.4, 0.5, 0.2, 0.0, 1.0, 0.0, 0.1, 0.0] },
  { key: 'lang-person',   bias: [0.2, 0.5, 0.1, 0.0, 0.0, 1.0, 0.0, 0.2] },
  { key: 'vibes-person',  bias: [0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.3, 1.0] },
];

function makeAmbients(): AmbientNPC[] {
  const names = ['alex', 'sam', 'jo', 'kai', 'rae', 'noor', 'sid', 'wren', 'el', 'max'];
  const colors = ['#bcbcbc', '#a8a8a8', '#cfcfcf', '#9c9c9c', '#b5b5b5'];
  const clusters = [{ x: 38, y: 42 }, { x: 62, y: 55 }, { x: 48, y: 68 }];
  return names.map((n, i) => {
    const c = clusters[i % clusters.length];
    const persona = PERSONAS[i % PERSONAS.length];
    return {
      id: 'amb-' + i,
      name: n,
      persona: persona.key,
      color: colors[i % colors.length],
      x: c.x + (Math.random() - 0.5) * 14,
      y: c.y + (Math.random() - 0.5) * 10,
      vx: 0,
      vy: 0,
      embedding: persona.bias.map(b =>
        Math.max(0.05, b * (0.7 + Math.random() * 0.5) + (Math.random() - 0.5) * 0.1)
      ),
    };
  });
}

// ---------- COMPONENT ----------
export default function NpcTown() {
  const [att, setAtt] = useState<AttentionApi | null>(null);
  const [tfReady, setTfReady] = useState(false);
  const [player, setPlayer] = useState({ x: 50, y: 50 });
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [ambients, setAmbients] = useState<AmbientNPC[]>(() => makeAmbients());
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [nearProject, setNearProject] = useState<ProjectNPCData | null>(null);
  const [openProject, setOpenProject] = useState<ProjectNPCData | null>(null);
  const [attMatrix, setAttMatrix] = useState<number[][] | null>(null);
  const [showAttn, setShowAttn] = useState(true);
  const [spoken, setSpoken] = useState(0);
  const [, setClicks] = useState(0);
  const [showWasdHint, setShowWasdHint] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const ambientsRef = useRef<AmbientNPC[]>(ambients);
  useEffect(() => { ambientsRef.current = ambients; }, [ambients]);

  // load tfjs
  useEffect(() => {
    if (window.tf) { setTfReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js';
    s.onload = () => setTfReady(true);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!tfReady) return;
    let live = true;
    setupAttention().then(a => { if (live) setAtt(a); });
    return () => { live = false; };
  }, [tfReady]);

  // input
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
      if (k === 'e' && nearProject) { setOpenProject(nearProject); }
      setKeys(p => ({ ...p, [k]: true }));
    };
    const up = (e: KeyboardEvent) => setKeys(p => ({ ...p, [e.key.toLowerCase()]: false }));
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, [nearProject]);

  // movement loop (player)
  useEffect(() => {
    let raf: number;
    function tick() {
      setPlayer(p => {
        let { x, y } = p;
        const sp = 0.45;
        let moved = false;
        if (keys.w || keys.arrowup) { y -= sp; moved = true; }
        if (keys.s || keys.arrowdown) { y += sp; moved = true; }
        if (keys.a || keys.arrowleft) { x -= sp; moved = true; }
        if (keys.d || keys.arrowright) { x += sp; moved = true; }
        if (moved && !hasMoved) setHasMoved(true);
        return { x: Math.max(4, Math.min(96, x)), y: Math.max(8, Math.min(94, y)) };
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [keys, hasMoved]);

  // proximity to project NPCs
  useEffect(() => {
    let nearest: ProjectNPCData | null = null;
    let best = 8;
    for (const n of PROJECT_NPCS) {
      const d = Math.hypot(n.x - player.x, n.y - player.y);
      if (d < best) { best = d; nearest = n; }
    }
    setNearProject(nearest);
  }, [player]);

  // ambient drift
  useEffect(() => {
    let raf: number;
    function tick() {
      setAmbients(arr => arr.map(a => {
        let { x, y, vx, vy } = a;
        if (Math.random() < 0.02) { vx = (Math.random() - 0.5) * 0.4; vy = (Math.random() - 0.5) * 0.4; }
        x = Math.max(8, Math.min(92, x + vx));
        y = Math.max(15, Math.min(90, y + vy));
        return { ...a, x, y, vx, vy };
      }));
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // attention-driven chatter
  useEffect(() => {
    if (!att) return;
    const interval = setInterval(() => {
      const speakers = ambientsRef.current;
      const embs = speakers.map(s => s.embedding);
      const attMat = att.attentionScores(embs);
      setAttMatrix(attMat);

      const i = Math.floor(Math.random() * speakers.length);
      const row = attMat[i];
      let j = -1;
      let bestScore = -1;
      for (let k = 0; k < row.length; k++) {
        if (k === i) continue;
        if (row[k] > bestScore) { bestScore = row[k]; j = k; }
      }
      if (j < 0) return;

      const speaker = speakers[i];
      const listener = speakers[j];
      const d = Math.hypot(speaker.x - listener.x, speaker.y - listener.y);
      if (d > 35) {
        setAmbients(arr => arr.map(a => {
          if (a.id !== speaker.id) return a;
          const dx = listener.x - a.x;
          const dy = listener.y - a.y;
          const dist = Math.hypot(dx, dy) || 1;
          return { ...a, vx: a.vx * 0.6 + (dx / dist) * 0.15, vy: a.vy * 0.6 + (dy / dist) * 0.15 };
        }));
      }

      const vocabEmbs = VOCAB.map(([, e]) => e);
      const dist = att.wordSoftmax(speaker.embedding, vocabEmbs);
      const w1 = VOCAB[sampleFromDist(dist, 0.7)][0];
      const w2 = VOCAB[sampleFromDist(dist, 0.9)][0];
      const tpl = PHRASE_TEMPLATES[Math.floor(Math.random() * PHRASE_TEMPLATES.length)];
      const text = tpl.replaceAll('{x}', w1).replaceAll('{y}', w2);

      const id = Math.random().toString(36).slice(2);
      setBubbles(bs => [...bs, { id, npcId: speaker.id, text, x: speaker.x, y: speaker.y, born: performance.now(), ttl: 3200 }]);
      setSpoken(s => s + 1);
      setTranscript(t => [...t, { id, speaker: speaker.name, listener: listener.name, text, t: Date.now() }].slice(-200));

      setAmbients(arr => arr.map(a => {
        if (a.id !== speaker.id) return a;
        const tgt = listener.embedding;
        const newE = a.embedding.map((v, k) => v * 0.95 + tgt[k] * 0.05 + (Math.random() - 0.5) * 0.02);
        return { ...a, embedding: newE };
      }));
    }, 1400);
    return () => clearInterval(interval);
  }, [att]);

  // bubble cleanup
  useEffect(() => {
    const t = setInterval(() => {
      setBubbles(bs => bs.filter(b => performance.now() - b.born < b.ttl));
    }, 400);
    return () => clearInterval(t);
  }, []);

  function handleProjectClick(n: ProjectNPCData) {
    setOpenProject(n);
    setClicks(c => {
      const nc = c + 1;
      if (nc >= 3 && !hasMoved) setShowWasdHint(true);
      return nc;
    });
  }
  useEffect(() => { if (hasMoved) setShowWasdHint(false); }, [hasMoved]);
  useEffect(() => {
    if (!showWasdHint) return;
    const t = setTimeout(() => setShowWasdHint(false), 6000);
    return () => clearTimeout(t);
  }, [showWasdHint]);

  return (
    <div style={tStyles.root}>
      <div style={tStyles.hud}>
        <div style={tStyles.hudLeft}>
          <div style={tStyles.brandName}>HARSH.TOWN</div>
          <div style={tStyles.brandTag}>a tiny transformer chats with itself · running 100% in your browser</div>
        </div>
        <div style={tStyles.hudRight}>
          <Stat label="TFJS" val={tfReady ? 'READY' : 'loading…'} />
          <Stat label="ATTN" val={att ? 'ACTIVE' : '—'} />
          <Stat label="UTTERANCES" val={spoken.toString().padStart(3, '0')} />
          <button style={tStyles.toggle} onClick={() => setTranscriptOpen(true)}>
            ☰ TRANSCRIPT
          </button>
          <button style={tStyles.toggle} onClick={() => setShowAttn(!showAttn)}>
            {showAttn ? '◉ ATTN' : '○ ATTN'}
          </button>
        </div>
      </div>

      <div style={tStyles.world}>
        <Terrain />

        {showAttn && attMatrix && <AttentionLines ambients={ambients} matrix={attMatrix} />}

        {PROJECT_NPCS.map(n => (
          <ProjectNPC key={n.id} npc={n} active={nearProject?.id === n.id} onOpen={() => handleProjectClick(n)} />
        ))}

        {ambients.map(a => (
          <PixelPerson key={a.id} x={a.x} y={a.y} color={a.color} />
        ))}

        {bubbles.map(b => <Bubble key={b.id} {...b} />)}

        <PixelPerson x={player.x} y={player.y} color="#1a1a1a" hat="#fef3c7" isPlayer />

        {nearProject && !openProject && (
          <div style={{
            position: 'absolute', left: `${player.x}%`, top: `calc(${player.y}% - 38px)`,
            transform: 'translate(-50%, 0)', pointerEvents: 'none',
            fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: 2,
            background: '#1a1a1a', color: '#fef3c7', padding: '4px 8px', borderRadius: 2,
          }}>
            PRESS [E] · {nearProject.name}
          </div>
        )}

        <div style={tStyles.legend}>
          <LegendDot c="#fef3c7" label="you" />
          <LegendDot c="#bcbcbc" label="ambient" />
          <LegendDot c="#e8a5a5" label="project NPC" />
          <div style={{ ...tStyles.legendItem, color: '#666' }}>WASD · move &nbsp;·&nbsp; E · talk</div>
        </div>

        {showAttn && attMatrix && (
          <div style={tStyles.attnPanel}>
            <div style={tStyles.attnTitle}>SELF-ATTENTION · 10×10</div>
            <Heatmap matrix={attMatrix} />
            <div style={tStyles.attnHint}>brighter = NPC i wants to talk to NPC j</div>
          </div>
        )}
      </div>

      {openProject && (
        <ProjectModal npc={openProject} onClose={() => setOpenProject(null)} />
      )}

      {showWasdHint && (
        <div style={tStyles.wasdHint}>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: 2, color: '#7a6f55' }}>PSST…</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#3a2f15', marginTop: 4 }}>you can use <b>WASD</b> to walk around the town.</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
            {['W', 'A', 'S', 'D'].map(k => <span key={k} style={tStyles.kbd}>{k}</span>)}
          </div>
          <button style={tStyles.hintClose} onClick={() => setShowWasdHint(false)}>got it</button>
        </div>
      )}

      {transcriptOpen && (
        <TranscriptDrawer transcript={transcript} onClose={() => setTranscriptOpen(false)} />
      )}
    </div>
  );
}

function TranscriptDrawer({ transcript, onClose }: { transcript: TranscriptEntry[]; onClose: () => void }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [transcript]);
  function copyAll() {
    const txt = transcript.map(t => `${new Date(t.t).toLocaleTimeString()}  ${t.speaker} → ${t.listener}: ${t.text}`).join('\n');
    navigator.clipboard?.writeText(txt);
  }
  return (
    <div style={tStyles.drawer}>
      <div style={tStyles.drawerHeader}>
        <div>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: 3, color: '#7a6f55' }}>SESSION LOG</div>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, letterSpacing: 2, color: '#3a2f15', fontWeight: 700 }}>TRANSCRIPT · {transcript.length}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={tStyles.toggle} onClick={copyAll}>COPY</button>
          <button style={tStyles.toggle} onClick={onClose}>CLOSE</button>
        </div>
      </div>
      <div style={tStyles.drawerBody} ref={scrollRef}>
        {transcript.length === 0 ? (
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, color: '#7a6f55', padding: 20, textAlign: 'center' }}>
            no chatter yet — give the attention layer a moment…
          </div>
        ) : transcript.map(t => (
          <div key={t.id} style={tStyles.drawerRow}>
            <span style={tStyles.drawerTime}>{new Date(t.t).toLocaleTimeString([], { hour12: false })}</span>
            <span style={tStyles.drawerWho}>{t.speaker} <span style={{ color: '#bba484' }}>→</span> {t.listener}</span>
            <span style={tStyles.drawerText}>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, val }: { label: string; val: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 8, letterSpacing: 2, color: '#7a6f55' }}>{label}</span>
      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, color: '#3a2f15' }}>{val}</span>
    </div>
  );
}

function LegendDot({ c, label }: { c: string; label: string }) {
  return <div style={tStyles.legendItem}>
    <span style={{ display: 'inline-block', width: 10, height: 10, background: c, marginRight: 6, verticalAlign: 'middle', border: '1px solid #1a1a1a' }}></span>
    {label}
  </div>;
}

function Terrain() {
  return (
    <>
      <div style={{
        position: 'absolute', inset: 0,
        background: '#d4cba8',
        backgroundImage: `
          radial-gradient(circle at 20% 30%, #c9bf99 0 6px, transparent 7px),
          radial-gradient(circle at 80% 60%, #c9bf99 0 6px, transparent 7px),
          radial-gradient(circle at 50% 80%, #c9bf99 0 6px, transparent 7px),
          radial-gradient(circle at 35% 70%, #c9bf99 0 4px, transparent 5px),
          radial-gradient(circle at 70% 25%, #c9bf99 0 4px, transparent 5px)
        `,
      }}></div>
      <div style={{
        position: 'absolute', left: '30%', top: '0%', width: '40%', height: '100%',
        background: 'linear-gradient(180deg, transparent 0%, #c2b58f 15%, #c2b58f 85%, transparent 100%)',
        opacity: 0.5,
      }}></div>
      <div style={{
        position: 'absolute', left: '0%', top: '42%', width: '100%', height: '16%',
        background: 'linear-gradient(90deg, transparent 0%, #c2b58f 15%, #c2b58f 85%, transparent 100%)',
        opacity: 0.5,
      }}></div>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0 2px, transparent 2px 4px)',
        pointerEvents: 'none',
      }}></div>
    </>
  );
}

function AttentionLines({ ambients, matrix }: { ambients: AmbientNPC[]; matrix: number[][] }) {
  const lines: { a: AmbientNPC; b: AmbientNPC; w: number }[] = [];
  for (let i = 0; i < ambients.length; i++) {
    for (let j = 0; j < ambients.length; j++) {
      if (i === j) continue;
      const w = matrix[i][j];
      if (w < 0.13) continue;
      const a = ambients[i];
      const b = ambients[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > 22) continue;
      lines.push({ a, b, w });
    }
  }
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
      {lines.map((l, i) => (
        <line key={i} x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y}
          stroke="#3a2f15" strokeOpacity={l.w * 1.2} strokeWidth="0.18" />
      ))}
    </svg>
  );
}

function PixelPerson({ x, y, color, hat, isPlayer }: { x: number; y: number; color: string; hat?: string; isPlayer?: boolean }) {
  const size = 14;
  return (
    <div style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`,
      width: size, height: size + 4, marginLeft: -size / 2, marginTop: -(size + 2),
      transition: isPlayer ? 'left 60ms linear, top 60ms linear' : 'left 0.5s ease-out, top 0.5s ease-out',
      zIndex: isPlayer ? 5 : 3,
      imageRendering: 'pixelated',
    }}>
      <div style={{ position: 'absolute', bottom: -2, left: 1, right: 1, height: 3, background: 'rgba(0,0,0,0.25)', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', top: 0, left: 3, width: 8, height: 6, background: color, border: '1px solid #1a1a1a' }}></div>
      {hat && <div style={{ position: 'absolute', top: -3, left: 2, width: 10, height: 3, background: hat, border: '1px solid #1a1a1a' }}></div>}
      <div style={{ position: 'absolute', top: 6, left: 2, width: 10, height: 7, background: color, border: '1px solid #1a1a1a', borderTop: 'none' }}></div>
      <div style={{ position: 'absolute', top: 13, left: 3, width: 3, height: 3, background: '#3a2f15' }}></div>
      <div style={{ position: 'absolute', top: 13, right: 3, width: 3, height: 3, background: '#3a2f15' }}></div>
    </div>
  );
}

function ProjectNPC({ npc, active, onOpen }: { npc: ProjectNPCData; active: boolean; onOpen: () => void }) {
  return (
    <>
      <div onClick={onOpen} style={{
        position: 'absolute', left: `${npc.x}%`, top: `${npc.y}%`,
        transform: 'translate(-50%, -100%)',
        width: 40, height: 40, marginBottom: 6,
        background: '#fef3c7', border: '2px solid #1a1a1a',
        boxShadow: active ? '0 0 0 4px rgba(254,243,199,0.6), 0 4px 0 rgba(0,0,0,0.15)' : '0 4px 0 rgba(0,0,0,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'ui-monospace, monospace', fontSize: 14, fontWeight: 700, color: '#1a1a1a',
        zIndex: 7, cursor: 'pointer',
        transition: 'transform 0.15s',
      }}
        onMouseEnter={(e: MouseEvent<HTMLDivElement>) => { e.currentTarget.style.transform = 'translate(-50%, -100%) scale(1.08)'; }}
        onMouseLeave={(e: MouseEvent<HTMLDivElement>) => { e.currentTarget.style.transform = 'translate(-50%, -100%) scale(1.0)'; }}
      >
        ★
      </div>
      <PixelPerson x={npc.x} y={npc.y} color={npc.color} />
      <div onClick={onOpen} style={{
        position: 'absolute', left: `${npc.x}%`, top: `calc(${npc.y}% + 12px)`,
        transform: 'translate(-50%, 0)',
        fontFamily: 'ui-monospace, monospace', fontSize: active ? 10 : 9, letterSpacing: 2,
        color: '#3a2f15', textShadow: '0 1px 0 rgba(255,255,255,0.6)',
        whiteSpace: 'nowrap', fontWeight: active ? 700 : 400,
        cursor: 'pointer', padding: '2px 6px', zIndex: 7,
        background: active ? 'rgba(254,243,199,0.7)' : 'transparent',
      }}>{npc.name} {active && <span style={{ color: '#7a6f55' }}>· click</span>}</div>
    </>
  );
}

function Bubble({ x, y, text, born }: BubbleData) {
  const age = (performance.now() - born) / 3200;
  const opacity = age < 0.85 ? 1 : Math.max(0, 1 - (age - 0.85) / 0.15);
  return (
    <div style={{
      position: 'absolute', left: `${x}%`, top: `calc(${y}% - 30px)`,
      transform: 'translate(-50%, -100%)',
      background: '#fffdf2', border: '1.5px solid #1a1a1a',
      padding: '4px 9px', fontFamily: 'ui-monospace, monospace', fontSize: 10,
      color: '#1a1a1a', whiteSpace: 'nowrap', pointerEvents: 'none',
      opacity, zIndex: 6,
      boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
    }}>
      {text}
      <div style={{
        position: 'absolute', bottom: -6, left: '50%', marginLeft: -4,
        width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
        borderTop: '6px solid #1a1a1a',
      }}></div>
    </div>
  );
}

function Heatmap({ matrix }: { matrix: number[][] }) {
  const n = matrix.length;
  const cell = 14;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, ${cell}px)`, gap: 1, padding: 6, background: '#1a1a1a' }}>
      {matrix.flatMap((row, i) => row.map((v, j) => (
        <div key={`${i}-${j}`} style={{
          width: cell, height: cell,
          background: `rgba(254, 243, 199, ${Math.min(1, v * 3.5)})`,
        }}></div>
      )))}
    </div>
  );
}

function ProjectModal({ npc, onClose }: { npc: ProjectNPCData; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div style={tStyles.modalBg} onClick={onClose}>
      <div style={{ ...tStyles.modal, borderColor: npc.color }} onClick={e => e.stopPropagation()}>
        <button style={tStyles.modalClose} onClick={onClose}>✕</button>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 18 }}>
          <div style={{ width: 54, height: 54, background: npc.color, border: '2px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>★</div>
          <div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: 3, color: '#7a6f55' }}>NPC · {npc.name}</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: '#3a2f15', marginTop: 2 }}>{npc.title}</div>
          </div>
        </div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 15, lineHeight: 1.65, color: '#3a2f15' }}>{npc.body}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 18, flexWrap: 'wrap' }}>
          {npc.tags.map(t => (
            <span key={t} style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, padding: '3px 8px', background: '#fef3c7', border: '1px solid #1a1a1a', color: '#3a2f15' }}>{t}</span>
          ))}
        </div>
        <div style={{ marginTop: 22, padding: '12px 14px', background: '#fef3c7', borderLeft: '3px solid #1a1a1a' }}>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: 2, color: '#7a6f55', marginBottom: 4 }}>TRAIT EMBEDDING</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 32 }}>
            {Object.entries(npc.traits).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 18, height: 6 + v * 22, background: '#3a2f15' }}></div>
                <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 8, color: '#3a2f15' }}>{k}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const tStyles: Record<string, CSSProperties> = {
  root: { width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#e9dfb9', fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden', position: 'relative' },
  hud: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#fef3c7', borderBottom: '2px solid #1a1a1a', zIndex: 10 },
  hudLeft: { display: 'flex', flexDirection: 'column', gap: 1 },
  brandName: { fontFamily: 'ui-monospace, monospace', fontSize: 14, letterSpacing: 4, color: '#3a2f15', fontWeight: 700 },
  brandTag: { fontFamily: 'ui-monospace, monospace', fontSize: 10, color: '#7a6f55', letterSpacing: 0.3 },
  hudRight: { display: 'flex', gap: 18, alignItems: 'center' },
  toggle: { fontFamily: 'ui-monospace, monospace', fontSize: 10, padding: '4px 9px', background: 'transparent', border: '1.5px solid #3a2f15', color: '#3a2f15', cursor: 'pointer', letterSpacing: 2 },
  world: { flex: 1, position: 'relative', overflow: 'hidden' },
  legend: { position: 'absolute', bottom: 14, left: 14, display: 'flex', gap: 14, padding: '6px 10px', background: 'rgba(254,243,199,0.92)', border: '1.5px solid #1a1a1a', zIndex: 8 },
  legendItem: { fontFamily: 'ui-monospace, monospace', fontSize: 10, color: '#3a2f15' },
  attnPanel: { position: 'absolute', bottom: 14, right: 14, padding: '10px 12px', background: 'rgba(254,243,199,0.94)', border: '1.5px solid #1a1a1a', zIndex: 8 },
  attnTitle: { fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: 2.5, color: '#3a2f15', marginBottom: 6, fontWeight: 700 },
  attnHint: { fontFamily: 'ui-monospace, monospace', fontSize: 9, color: '#7a6f55', marginTop: 6, maxWidth: 160 },
  modalBg: { position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modal: { position: 'relative', background: '#fffdf2', border: '3px solid #3a2f15', padding: '28px 32px', maxWidth: 520, boxShadow: '6px 6px 0 rgba(0,0,0,0.25)' },
  modalClose: { position: 'absolute', top: 10, right: 14, background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer', color: '#3a2f15' },
  wasdHint: { position: 'absolute', left: '50%', bottom: 80, transform: 'translateX(-50%)', background: '#fffdf2', border: '2px solid #1a1a1a', boxShadow: '4px 4px 0 rgba(0,0,0,0.2)', padding: '14px 20px', zIndex: 30, maxWidth: 340 },
  kbd: { fontFamily: 'ui-monospace, monospace', fontSize: 11, fontWeight: 700, padding: '4px 8px', background: '#1a1a1a', color: '#fef3c7', border: '1px solid #1a1a1a', boxShadow: '2px 2px 0 #3a2f15' },
  hintClose: { position: 'absolute', top: 8, right: 10, background: 'transparent', border: 'none', fontFamily: 'ui-monospace, monospace', fontSize: 10, color: '#7a6f55', cursor: 'pointer', letterSpacing: 1 },
  drawer: { position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, background: '#fffdf2', borderLeft: '2px solid #1a1a1a', boxShadow: '-6px 0 16px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', zIndex: 40 },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1.5px solid #1a1a1a', background: '#fef3c7' },
  drawerBody: { flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 },
  drawerRow: { display: 'grid', gridTemplateColumns: '60px 1fr', gridTemplateRows: 'auto auto', columnGap: 10, paddingBottom: 6, borderBottom: '1px dotted #d4cba8' },
  drawerTime: { fontFamily: 'ui-monospace, monospace', fontSize: 9, color: '#7a6f55', gridRow: '1 / 3', paddingTop: 2 },
  drawerWho: { fontFamily: 'ui-monospace, monospace', fontSize: 10, color: '#3a2f15', letterSpacing: 1 },
  drawerText: { fontFamily: 'Georgia, serif', fontSize: 13, color: '#3a2f15', lineHeight: 1.4 },
};
