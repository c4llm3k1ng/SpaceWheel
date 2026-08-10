# Musik-Archiv

Gesicherte Musikversionen. Zum Wiederherstellen den jeweiligen Code-Block
in `SpaceWheel.html` über die entsprechenden Konstanten/Funktionen kopieren.
Die Engine (ensureAudioCtx, scheduleMusic, ensureMusicStarted usw.) bleibt
unverändert — eine Version besteht aus den Konstanten, `playStep` und den
Klangfarben (Voices).

---

## Version 1 — "Space-Trance mit Riff" (2026-08-10)

Stand von Commit `09d545c`. 150 BPM, A-Moll, absteigende Kadenz Am–G–F–E,
synkopiertes Lead-Riff mit gehaltenen Tönen. Vom User als "gut, Potenzial
da, noch nicht perfekt" bewertet.

```javascript
const MUSIC_BPM = 150;
const MUSIC_TRANSPOSE = 0; // Halbtöne; 0 = A-Moll, -2 = G-Moll
const STEP16 = 60 / MUSIC_BPM / 4;
const EIGHTH = STEP16 * 2;
// 4 Akkorde à 2 Takte — dunkle absteigende Kadenz: Am – G – F – E
// melody: 16tel-Step → [MIDI-Note, Länge in Steps]; gleiches Riff-Muster
// pro Akkord transponiert = Wiedererkennung (Ohrwurm-Hook)
const MUSIC_CHORDS = [
    { bass: 45, arpRoot: 57, minor: true,
      melody: { 0:[69,2], 3:[72,2], 6:[76,6], 14:[74,2], 16:[72,2], 19:[74,2], 22:[71,6] } },
    { bass: 43, arpRoot: 55, minor: false,
      melody: { 0:[67,2], 3:[71,2], 6:[74,6], 14:[72,2], 16:[71,2], 19:[72,2], 22:[74,6] } },
    { bass: 41, arpRoot: 53, minor: false,
      melody: { 0:[69,2], 3:[72,2], 6:[77,6], 14:[76,2], 16:[74,2], 19:[76,2], 22:[72,6] } },
    { bass: 40, arpRoot: 52, minor: false,
      melody: { 0:[71,2], 3:[76,2], 6:[80,6], 14:[76,2], 16:[74,2], 19:[71,2], 22:[68,6] } }
];
const ARP_SEQ = [0, 2, 3, 2, 1, 2, 3, 2, 0, 2, 3, 2, 1, 3, 2, 3];

function playStep(step, t) {
    const chord = MUSIC_CHORDS[Math.floor(step / 32) % 4];
    const si = step % 32;
    const loopPhase = step / 128;
    // Dunkle Fläche bei jedem Akkordwechsel
    if (si === 0) {
        const iv = chord.minor ? [0, 3, 7] : [0, 4, 7];
        iv.forEach(o => padVoice(midiFreq(chord.arpRoot + o), t, 32 * STEP16));
    }
    // Four-on-the-Floor-Kick, pumpender Offbeat-Bass, Snare auf 2 und 4
    if (si % 4 === 0) kickVoice(t);
    if (si % 4 === 2) { bassVoice(midiFreq(chord.bass), t); openHatVoice(t); }
    if (si % 16 === 4 || si % 16 === 12) snareVoice(t);
    else if (si % 2 === 1) hatVoice(t);
    // Rollendes 16tel-Arpeggio (leise Textur), Oktave hoch im 2. Takt, Filterfahrt
    const iv2 = chord.minor ? [0, 3, 7, 12] : [0, 4, 7, 12];
    const note = chord.arpRoot + iv2[ARP_SEQ[si % 16]] + (si >= 16 ? 12 : 0);
    const cutoff = 500 + 2400 * (0.5 - 0.5 * Math.cos(2 * Math.PI * loopPhase));
    arpVoice(midiFreq(note), t, si % 4 === 0 ? 0.04 : 0.028, cutoff);
    // Lead-Melodie: das Riff, das hängen bleiben soll
    const mel = chord.melody[si];
    if (mel) leadVoice(midiFreq(mel[0]), t, mel[1] * STEP16);
}

function leadVoice(freq, t, dur) {
    [-8, 8].forEach(det => {
        const o = audioCtx.createOscillator();
        o.type = 'sawtooth'; o.frequency.value = freq; o.detune.value = det;
        const f = audioCtx.createBiquadFilter();
        f.type = 'lowpass'; f.frequency.value = 2600; f.Q.value = 1.5;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.06, t + 0.02);
        g.gain.setValueAtTime(0.06, t + dur);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur + 0.1);
        o.connect(f); f.connect(g); g.connect(musicMaster); g.connect(musicDelay);
        o.start(t); o.stop(t + dur + 0.15);
    });
}

function padVoice(freq, t, dur) {
    [-7, 7].forEach(det => {
        const o = audioCtx.createOscillator();
        o.type = 'sawtooth'; o.frequency.value = freq; o.detune.value = det;
        const f = audioCtx.createBiquadFilter();
        f.type = 'lowpass'; f.frequency.value = 700; f.Q.value = 0.5;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.028, t + 0.4);
        g.gain.setValueAtTime(0.028, t + dur - 0.5);
        g.gain.linearRampToValueAtTime(0, t + dur);
        o.connect(f); f.connect(g); g.connect(musicMaster);
        o.start(t); o.stop(t + dur + 0.1);
    });
}

function bassVoice(freq, t) {
    // Pumpender Offbeat-Stab
    const o = audioCtx.createOscillator();
    o.type = 'sawtooth'; o.frequency.value = freq;
    const f = audioCtx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 350; f.Q.value = 1.5;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.24, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    o.connect(f); f.connect(g); g.connect(musicMaster);
    o.start(t); o.stop(t + 0.2);
}

function arpVoice(freq, t, vel, cutoff) {
    const o = audioCtx.createOscillator();
    o.type = 'sawtooth'; o.frequency.value = freq;
    const f = audioCtx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = cutoff || 1200; f.Q.value = 3;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
    o.connect(f); f.connect(g); g.connect(musicMaster); g.connect(musicDelay);
    o.start(t); o.stop(t + 0.13);
}

function openHatVoice(t) {
    const src = audioCtx.createBufferSource();
    src.buffer = getNoise();
    const f = audioCtx.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = 8000;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.045, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.connect(f); f.connect(g); g.connect(musicMaster);
    src.start(t); src.stop(t + 0.15);
}
```

Zusätzlich relevant (unverändert in Version 1, hier nur als Referenz):
kickVoice (Sine-Drop 150→45 Hz), hatVoice (Highpass-Noise 7 kHz, leise),
snareVoice (Bandpass-Noise 1,8 kHz), Delay-Echo mit `EIGHTH * 1.5` und
Feedback 0.35, Master-Lautstärke im Spiel 0.22.

---

## Version 2 — "Hymnisch Em–C–G–D" (2026-08-10)

Stand von Commit `63f3673`. Wie Version 1, aber mit hymnischer Akkordfolge
Em–C–G–D, neuem Riff (Zielton → schneller Doppelschlag → gehaltener
Schlington, F#-Hängeton zieht zum Loop-Anfang) und gerade aufsteigendem
Arpeggio. Alle Voices identisch zu Version 1. User-Urteil: "auch okay".

```javascript
// VERSION 2 (Experiment) — hymnische Folge: Em – C – G – D
const MUSIC_CHORDS = [
    { bass: 40, arpRoot: 52, minor: true,
      melody: { 0:[76,3], 4:[79,1], 6:[78,1], 8:[76,4], 14:[74,2], 16:[76,3], 22:[71,8] } },
    { bass: 48, arpRoot: 60, minor: false,
      melody: { 0:[72,3], 4:[76,1], 6:[74,1], 8:[72,4], 14:[71,2], 16:[72,3], 22:[76,8] } },
    { bass: 43, arpRoot: 55, minor: false,
      melody: { 0:[74,3], 4:[79,1], 6:[78,1], 8:[74,4], 14:[71,2], 16:[74,3], 22:[79,8] } },
    { bass: 50, arpRoot: 62, minor: false,
      melody: { 0:[74,3], 4:[78,1], 6:[76,1], 8:[74,4], 14:[71,2], 16:[69,3], 22:[78,8] } }
];
const ARP_SEQ = [0, 1, 2, 3, 0, 1, 2, 3, 0, 2, 1, 3, 0, 1, 3, 2];
```

---

## Version 5 — "Perpetuum mobile Chiptune" (2026-08-10)

Stand von Commit `ce7cf82`. Durchlaufende Achtelbewegung über Am–F–Dm–E,
Kadenz-Phrase mit Halteton, Lauf und B-Hängeton. Rechteck-Lead (Chiptune,
seit V3). User-Urteil: "klingt schon ganz gut, aber noch nicht perfekt".

```javascript
// VERSION 5 (Experiment) — Perpetuum mobile: Am – F – Dm – E
const MUSIC_CHORDS = [
    { bass: 45, arpRoot: 57, minor: true,
      melody: { 0:[69,2], 2:[72,2], 4:[76,2], 6:[81,2], 8:[79,2], 10:[76,2], 12:[77,2], 14:[74,2], 16:[76,2], 18:[72,2], 20:[74,2], 22:[71,2], 24:[72,2], 26:[69,2], 28:[71,2], 30:[67,2] } },
    { bass: 41, arpRoot: 53, minor: false,
      melody: { 0:[69,2], 2:[72,2], 4:[77,2], 6:[81,2], 8:[79,2], 10:[77,2], 12:[76,2], 14:[72,2], 16:[74,2], 18:[77,2], 20:[76,2], 22:[72,2], 24:[74,2], 26:[71,2], 28:[72,2], 30:[69,2] } },
    { bass: 50, arpRoot: 62, minor: true,
      melody: { 0:[74,2], 2:[77,2], 4:[81,2], 6:[79,2], 8:[77,2], 10:[74,2], 12:[76,2], 14:[72,2], 16:[74,2], 18:[71,2], 20:[72,2], 22:[74,2], 24:[76,2], 26:[77,2], 28:[76,2], 30:[74,2] } },
    { bass: 40, arpRoot: 52, minor: false,
      melody: { 0:[71,4], 6:[68,2], 8:[76,4], 14:[74,2], 16:[72,2], 20:[71,2], 24:[69,2], 26:[68,2], 28:[71,4] } }
];
const ARP_SEQ = [0, 3, 1, 3, 2, 3, 1, 3, 0, 3, 1, 3, 2, 3, 1, 3];

// Chiptune-Lead (gilt für V3–V5, ersetzt den Sägezahn-Lead von V1/V2):
function leadVoice(freq, t, dur) {
    [-6, 6].forEach(det => {
        const o = audioCtx.createOscillator();
        o.type = 'square'; o.frequency.value = freq; o.detune.value = det;
        const f = audioCtx.createBiquadFilter();
        f.type = 'lowpass'; f.frequency.value = 3000; f.Q.value = 1;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.045, t + 0.01);
        g.gain.setValueAtTime(0.045, t + dur);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur + 0.05);
        o.connect(f); f.connect(g); g.connect(musicMaster); g.connect(musicDelay);
        o.start(t); o.stop(t + dur + 0.15);
    });
}
```
