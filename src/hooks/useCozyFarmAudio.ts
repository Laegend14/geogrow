import { useEffect, useRef, useCallback } from "react";

interface AudioConfig {
  condition: "sunny" | "rainy" | "stormy" | "cloudy";
}

export const useCozyFarmAudio = ({ condition }: AudioConfig) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Master gain controls for crossfading
  const sunnyGainRef = useRef<GainNode | null>(null);
  const cloudyGainRef = useRef<GainNode | null>(null);
  const rainyGainRef = useRef<GainNode | null>(null);
  const stormyGainRef = useRef<GainNode | null>(null);

  // Background audio loops References
  const rainSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const stormSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const whiteNoiseBufferRef = useRef<AudioBuffer | null>(null);

  // Scheduler timer and state
  const timerIdRef = useRef<any>(null);
  const currentConditionRef = useRef<"sunny" | "rainy" | "stormy" | "cloudy">(condition);
  
  // Custom buffers (fetched from public directory optionally)
  const customBuffersRef = useRef<{
    sunny: AudioBuffer | null;
    cloudy: AudioBuffer | null;
    rainy: AudioBuffer | null;
    stormy: AudioBuffer | null;
  }>({
    sunny: null,
    cloudy: null,
    rainy: null,
    stormy: null,
  });

  // Keep ref up to date to avoid scheduler re-creation lag
  useEffect(() => {
    currentConditionRef.current = condition;
    
    // Trigger smooth 2.0-second crossfade
    if (audioCtxRef.current) {
      const time = audioCtxRef.current.currentTime;
      const fadeTime = 2.0;

      // Define target volume levels
      const levels = {
        sunny: { s: 0.5, c: 0, r: 0, st: 0 },
        cloudy: { s: 0.2, c: 0.6, r: 0, st: 0 },
        rainy: { s: 0, c: 0, r: 0.7, st: 0 },
        stormy: { s: 0, c: 0, r: 0, st: 0.6 },
      }[condition] || { s: 0.5, c: 0, r: 0, st: 0 };

      // Cancel previous scheduled changes and slide to new volumes
      try {
        sunnyGainRef.current?.gain.cancelScheduledValues(time);
        cloudyGainRef.current?.gain.cancelScheduledValues(time);
        rainyGainRef.current?.gain.cancelScheduledValues(time);
        stormyGainRef.current?.gain.cancelScheduledValues(time);

        sunnyGainRef.current?.gain.linearRampToValueAtTime(levels.s, time + fadeTime);
        cloudyGainRef.current?.gain.linearRampToValueAtTime(levels.c, time + fadeTime);
        rainyGainRef.current?.gain.linearRampToValueAtTime(levels.r, time + fadeTime);
        stormyGainRef.current?.gain.linearRampToValueAtTime(levels.st, time + fadeTime);
      } catch (e) {
        console.warn("[CozyAudio] Ramp failure (typically negligible):", e);
      }
    }
  }, [condition]);

  // Create single white noise buffer
  const createWhiteNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds loop
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const midiToFreq = (note: number) => {
    return Math.pow(2, (note - 69) / 12) * 440;
  };

  // --- PROCEDURAL ACOUSTIC INSTRUMENT SYNTHESIZERS ---

  // Synthesizes a warm plucked folk guitar sound
  const synthesizeGuitarPluck = (ctx: AudioContext, freq: number, time: number, vol: number) => {
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filterNode = ctx.createBiquadFilter();

    // Soft warm waves
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq * 1.002, time);
    // Subtle wooden pitch glide on initial contact
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.015);

    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(freq / 2, time); // warm sub-octave support

    // Pluck Envelope
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(vol * 0.7, time + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(vol * 0.15, time + 0.12);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.9);

    // Filter sweeps downwards to mimic dampening plucked string
    filterNode.type = "lowpass";
    filterNode.frequency.setValueAtTime(2800, time);
    filterNode.frequency.exponentialRampToValueAtTime(550, time + 0.15);

    osc.connect(filterNode);
    subOsc.connect(filterNode);
    filterNode.connect(gainNode);
    
    // Dynamic routing to sunny layer
    if (sunnyGainRef.current) {
      gainNode.connect(sunnyGainRef.current);
    } else {
      gainNode.connect(ctx.destination);
    }

    osc.start(time);
    subOsc.start(time);
    osc.stop(time + 0.95);
    subOsc.stop(time + 0.95);
  };

  // Synthesizes a warm rounded marimba / bell piano note for cloudy atmosphere
  const synthesizeMarimba = (ctx: AudioContext, freq: number, time: number, vol: number) => {
    const osc = ctx.createOscillator();
    const ringOsc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    // Warm high-overtone to emulate hollow wood
    ringOsc.type = "sine";
    ringOsc.frequency.setValueAtTime(freq * 3.0, time); // 3rd harmonic

    const ringGain = ctx.createGain();
    ringGain.gain.setValueAtTime(0.06 * vol, time);
    ringGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(vol * 0.8, time + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

    osc.connect(gainNode);
    ringOsc.connect(ringGain);
    ringGain.connect(gainNode);

    if (cloudyGainRef.current) {
      gainNode.connect(cloudyGainRef.current);
    } else {
      gainNode.connect(ctx.destination);
    }

    osc.start(time);
    ringOsc.start(time);
    osc.stop(time + 0.5);
    ringOsc.stop(time + 0.5);
  };

  // Synthesizes a soft organic breathy woodwind flute playing a comforting lullaby
  const synthesizeWoodwind = (ctx: AudioContext, freq: number, time: number, duration: number, vol: number) => {
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gainNode = ctx.createGain();
    const filterNode = ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);

    // Flute vibrato LFO (6.5 Hz)
    lfo.type = "sine";
    lfo.frequency.value = 6.5;
    lfoGain.gain.value = 4.0; // detunes main frequency back and forth slightly

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    // Dynamic Attack for physical human-like breath entrance
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(vol * 0.6, time + 0.18); // Soft slow attack
    gainNode.gain.setValueAtTime(vol * 0.6, time + duration - 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

    filterNode.type = "lowpass";
    filterNode.frequency.setValueAtTime(950, time);

    osc.connect(filterNode);
    filterNode.connect(gainNode);

    if (rainyGainRef.current) {
      gainNode.connect(rainyGainRef.current);
    } else {
      gainNode.connect(ctx.destination);
    }

    lfo.start(time);
    osc.start(time);
    lfo.stop(time + duration);
    osc.stop(time + duration);
  };

  // Synthesizes djembe (bass thump), rim (slap), and egg shaker percussions for stormy urgency
  const synthesizePercussion = (ctx: AudioContext, type: "thump" | "slap" | "shaker", time: number) => {
    if (type === "thump") {
      // Deep bass drum
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(120, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.08); // downward pitch slide

      gainNode.gain.setValueAtTime(0.8, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

      osc.connect(gainNode);
      if (stormyGainRef.current) {
        gainNode.connect(stormyGainRef.current);
      } else {
        gainNode.connect(ctx.destination);
      }

      osc.start(time);
      osc.stop(time + 0.2);
    } 
    else if (type === "slap") {
      // Wood rim skin slap
      const osc = ctx.createOscillator();
      const noise = ctx.createBufferSource();
      const filterNode = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, time);
      osc.frequency.exponentialRampToValueAtTime(100, time + 0.04);

      noise.buffer = whiteNoiseBufferRef.current || createWhiteNoiseBuffer(ctx);
      filterNode.type = "bandpass";
      filterNode.frequency.value = 1400;
      filterNode.Q.value = 3.0;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

      gainNode.gain.setValueAtTime(0.5, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

      osc.connect(gainNode);
      noise.connect(filterNode);
      filterNode.connect(noiseGain);
      
      const stormDest = stormyGainRef.current || ctx.destination;
      gainNode.connect(stormDest);
      noiseGain.connect(stormDest);

      osc.start(time);
      noise.start(time);
      osc.stop(time + 0.06);
      noise.stop(time + 0.06);
    } 
    else if (type === "shaker") {
      // High frequency egg shaker / sand block
      const noise = ctx.createBufferSource();
      const filterNode = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      noise.buffer = whiteNoiseBufferRef.current || createWhiteNoiseBuffer(ctx);
      
      filterNode.type = "bandpass";
      filterNode.frequency.value = 7500;
      filterNode.Q.value = 4.5;

      // Soft back and forth shake
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.08, time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.085);

      noise.connect(filterNode);
      filterNode.connect(gainNode);
      if (stormyGainRef.current) {
        gainNode.connect(stormyGainRef.current);
      } else {
        gainNode.connect(ctx.destination);
      }

      noise.start(time);
      noise.stop(time + 0.09);
    }
  };

  // Cozy play schedule sequencer
  // Fires notes at 1/8 intervals with warm traditional major chords arpeggiators
  const startScheduler = (ctx: AudioContext) => {
    let nextNoteTime = ctx.currentTime;
    let beat = 0;
    
    // 100 BPM nursery-rhyme cozy walking tempo
    const tempo = 100;
    const eighthNoteTime = 60 / tempo / 2; // 300ms

    const chords = [
      [48, 55, 60, 64, 67, 72], // C Major (warm, home)
      [43, 50, 55, 59, 62, 67], // G Major (playful, sun)
      [45, 52, 57, 60, 64, 69], // A Minor (cozy melancholy)
      [41, 48, 53, 57, 60, 65], // F Major (bright growth)
    ];

    const tick = () => {
      while (nextNoteTime < ctx.currentTime + 0.2) {
        // Determine arpeggio bar indexes
        const chordIndex = Math.floor((beat / 8) % 4);
        const step = beat % 8;
        const currentChord = chords[chordIndex];

        // 1. Play Fingerstyle Guitar (Sunny & Cloudy)
        if (currentConditionRef.current === "sunny" || currentConditionRef.current === "cloudy") {
          // Bright warm acoustic notes
          if (step === 0) {
            synthesizeGuitarPluck(ctx, midiToFreq(currentChord[0]), nextNoteTime, 0.55); // Solid Root bass
            synthesizeGuitarPluck(ctx, midiToFreq(currentChord[3]), nextNoteTime + 0.08, 0.28); // Strum
          } else if (step === 2) {
            synthesizeGuitarPluck(ctx, midiToFreq(currentChord[2]), nextNoteTime, 0.3);
            synthesizeGuitarPluck(ctx, midiToFreq(currentChord[4]), nextNoteTime + 0.05, 0.28);
          } else if (step === 4) {
            synthesizeGuitarPluck(ctx, midiToFreq(currentChord[1]), nextNoteTime, 0.45); // Alt Bass
          } else if (step === 5) {
            synthesizeGuitarPluck(ctx, midiToFreq(currentChord[3]), nextNoteTime, 0.32);
          } else if (step === 6) {
            synthesizeGuitarPluck(ctx, midiToFreq(currentChord[5]), nextNoteTime, 0.42); // Melody peak
          } else if (step === 7) {
            synthesizeGuitarPluck(ctx, midiToFreq(currentChord[2]), nextNoteTime, 0.28);
          }

          // 2. Play Cozy Marimba (Only Cloudy layer)
          if (currentConditionRef.current === "cloudy" && step % 4 === 2) {
            const bellPitch = currentChord[4] + 12; // High G5 / C6 bells
            synthesizeMarimba(ctx, midiToFreq(bellPitch), nextNoteTime + 0.05, 0.24);
          }
        }
        // 3. Play Slow Soothing Lullaby (Rainy Mode)
        else if (currentConditionRef.current === "rainy") {
          // Ultra soft guitar plucking on the root beat
          if (step === 0) {
            synthesizeGuitarPluck(ctx, midiToFreq(currentChord[0]), nextNoteTime, 0.28);
          } else if (step === 4) {
            synthesizeGuitarPluck(ctx, midiToFreq(currentChord[2]), nextNoteTime, 0.22);
          }

          // Whimsical warm woodwind flute melody
          const melodyLines = [
            [60, 64, 67, 64], // C C D E arpeggio
            [59, 62, 67, 62],
            [57, 60, 64, 60],
            [55, 57, 60, 65],
          ];
          if (step === 0) {
            const windPitch = melodyLines[chordIndex][Math.floor(beat / 8) % 4] + 12;
            synthesizeWoodwind(ctx, midiToFreq(windPitch), nextNoteTime, eighthNoteTime * 3.5, 0.28);
          }
        }
        // 4. Play Urgency Rhythm Track (Stormy Mode)
        else if (currentConditionRef.current === "stormy") {
          // Rhythmic fast guitar plucks
          if (step % 2 === 0) {
            synthesizeGuitarPluck(ctx, midiToFreq(currentChord[0]), nextNoteTime, 0.38);
          } else {
            synthesizeGuitarPluck(ctx, midiToFreq(currentChord[4]), nextNoteTime + 0.05, 0.28);
          }

          // Djembe & Hand Percussion triggers
          if (step === 0 || step === 4) {
            synthesizePercussion(ctx, "thump", nextNoteTime);
          } else if (step === 2 || step === 6) {
            synthesizePercussion(ctx, "slap", nextNoteTime);
          }
          if (step % 2 === 1) {
            synthesizePercussion(ctx, "shaker", nextNoteTime);
          }
        }

        nextNoteTime += eighthNoteTime;
        beat++;
      }
    };

    return setInterval(tick, 100);
  };

  // Initializing static background layers
  const initEnvironmentalBackgrounds = (ctx: AudioContext) => {
    const noise = whiteNoiseBufferRef.current || createWhiteNoiseBuffer(ctx);

    // Rain Sound (soft lowpassed white noise)
    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noise;
    rainSource.loop = true;
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = "lowpass";
    rainFilter.frequency.value = 550; // soft heavy rain

    rainSource.connect(rainFilter);
    if (rainyGainRef.current) {
      rainFilter.connect(rainyGainRef.current);
    }
    rainSource.start();
    rainSourceRef.current = rainSource;

    // Storm winds (modulated bandpass wind gusts)
    const stormSource = ctx.createBufferSource();
    stormSource.buffer = noise;
    stormSource.loop = true;
    const stormFilter = ctx.createBiquadFilter();
    stormFilter.type = "bandpass";
    stormFilter.frequency.value = 350; // hollow wind
    stormFilter.Q.value = 1.2;

    stormSource.connect(stormFilter);
    if (stormyGainRef.current) {
      stormFilter.connect(stormyGainRef.current);
    }
    stormSource.start();
    stormSourceRef.current = stormSource;
  };

  // Lazy Initialization of AudioContext triggered by interactions
  const initAudio = useCallback(async () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Create crossfader gain networks
      sunnyGainRef.current = ctx.createGain();
      cloudyGainRef.current = ctx.createGain();
      rainyGainRef.current = ctx.createGain();
      stormyGainRef.current = ctx.createGain();

      sunnyGainRef.current.connect(ctx.destination);
      cloudyGainRef.current.connect(ctx.destination);
      rainyGainRef.current.connect(ctx.destination);
      stormyGainRef.current.connect(ctx.destination);

      // Match volumes to current condition on start
      const levels = {
        sunny: { s: 0.5, c: 0, r: 0, st: 0 },
        cloudy: { s: 0.2, c: 0.6, r: 0, st: 0 },
        rainy: { s: 0, c: 0, r: 0.7, st: 0 },
        stormy: { s: 0, c: 0, r: 0, st: 0.6 },
      }[currentConditionRef.current] || { s: 0.5, c: 0, r: 0, st: 0 };

      sunnyGainRef.current.gain.value = levels.s;
      cloudyGainRef.current.gain.value = levels.c;
      rainyGainRef.current.gain.value = levels.r;
      stormyGainRef.current.gain.value = levels.st;

      whiteNoiseBufferRef.current = createWhiteNoiseBuffer(ctx);

      // Start static layers & step sequencer
      initEnvironmentalBackgrounds(ctx);
      timerIdRef.current = startScheduler(ctx);

      console.log("[useCozyFarmAudio] Web Audio Synthesizer online in procedural mode");

      // Expose buffer loaders if specific tracks are under /public directories as requested
      const fetchBuffer = async (url: string) => {
        try {
          const res = await fetch(url);
          const arrayBuf = await res.arrayBuffer();
          return await ctx.decodeAudioData(arrayBuf);
        } catch {
          return null; // Silent fallback
        }
      };

      // Asynchronously fetch sound loops from /public as requested
      Promise.all([
        fetchBuffer("/public/audio/sunny.mp3"),
        fetchBuffer("/public/audio/cloudy.mp3"),
        fetchBuffer("/public/audio/rainy.mp3"),
        fetchBuffer("/public/audio/stormy.mp3"),
      ]).then(([sBuf, cBuf, rBuf, stBuf]) => {
        if (sBuf) customBuffersRef.current.sunny = sBuf;
        if (cBuf) customBuffersRef.current.cloudy = cBuf;
        if (rBuf) customBuffersRef.current.rainy = rBuf;
        if (stBuf) customBuffersRef.current.stormy = stBuf;
        
        if (sBuf || cBuf || rBuf || stBuf) {
          console.log("[useCozyFarmAudio] Asynchronously loaded custom loops from /public.");
        }
      });

    } catch (e) {
      console.error("[useCozyFarmAudio] Audio auto-boot failed:", e);
    }
  }, []);

  // Sync state or click interaction listener
  useEffect(() => {
    const handleGesture = () => {
      initAudio();
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
    };
    window.addEventListener("click", handleGesture);
    window.addEventListener("touchstart", handleGesture);
    return () => {
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
    };
  }, [initAudio]);

  useEffect(() => {
    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      if (rainSourceRef.current) try { rainSourceRef.current.stop(); } catch {}
      if (stormSourceRef.current) try { stormSourceRef.current.stop(); } catch {}
    };
  }, []);

  // --- PHYSICAL INTERACTIVE SFX TRIGGERS (Zero-delay synthesized folk actions) ---

  // 1. Soil Preparation / Ridge Formation: crunch of steel hoe blade tilling deep into crisp, aerated earth
  const playHoeSound = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // A. Metal impact: sine thump sliding low
    const thumper = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thumper.type = "sine";
    thumper.frequency.setValueAtTime(125, ctx.currentTime);
    thumper.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.12);
    
    thumpGain.gain.setValueAtTime(0.7, ctx.currentTime);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    thumper.connect(thumpGain);
    thumpGain.connect(ctx.destination);
    thumper.start();
    thumper.stop(ctx.currentTime + 0.15);

    // B. Earth Crunch: White noise swept downwards representing aerated dry soil crumbling
    const crunchSource = ctx.createBufferSource();
    crunchSource.buffer = whiteNoiseBufferRef.current || createWhiteNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    const crunchGain = ctx.createGain();

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1900, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.22);
    filter.Q.value = 3.5;

    crunchGain.gain.setValueAtTime(0.45, ctx.currentTime);
    crunchGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    crunchSource.connect(filter);
    filter.connect(crunchGain);
    crunchGain.connect(ctx.destination);

    crunchSource.start();
    crunchSource.stop(ctx.currentTime + 0.25);
  }, []);

  // 2. Crop Harvesting: clean crisp snapping and rustling separate loop
  const playHarvestSound = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // A. Double snap clicks
    for (let i = 0; i < 2; i++) {
      const start = ctx.currentTime + i * 0.035;
      const snap = ctx.createOscillator();
      const snapGain = ctx.createGain();

      snap.type = "triangle";
      snap.frequency.setValueAtTime(550 + i * 180, start);
      snap.frequency.exponentialRampToValueAtTime(70, start + 0.03);

      snapGain.gain.setValueAtTime(0.38, start);
      snapGain.gain.exponentialRampToValueAtTime(0.001, start + 0.03);

      snap.connect(snapGain);
      snapGain.connect(ctx.destination);
      snap.start(start);
      snap.stop(start + 0.035);
    }

    // B. Rustle: Bandpass filtered white noise burst
    const rustle = ctx.createBufferSource();
    rustle.buffer = whiteNoiseBufferRef.current || createWhiteNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    const rustleGain = ctx.createGain();

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(3200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.16);
    filter.Q.value = 5.0;

    rustleGain.gain.setValueAtTime(0.35, ctx.currentTime);
    rustleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    rustle.connect(filter);
    filter.connect(rustleGain);
    rustleGain.connect(ctx.destination);

    rustle.start();
    rustle.stop(ctx.currentTime + 0.2);
  }, []);

  // 3. Time Warp Activation: wooden wind-chime twinkle combined with glissandos
  const playWarpSound = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Wind-chime glissando cascade - Pentatonic harmonics ascending
    const chords = [52, 57, 60, 64, 67, 69, 72, 74, 76, 79, 81, 84, 88, 91, 93]; // Lush wood chime scale
    
    chords.forEach((note, idx) => {
      const strikeTime = ctx.currentTime + idx * 0.06;
      const osc = ctx.createOscillator();
      const detuned = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(midiToFreq(note), strikeTime);
      detuned.type = "triangle";
      detuned.frequency.setValueAtTime(midiToFreq(note) * 1.006, strikeTime); // Wood resonance detune

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(3800, strikeTime);
      filter.frequency.exponentialRampToValueAtTime(950, strikeTime + 0.45);

      gain.gain.setValueAtTime(0, strikeTime);
      gain.gain.linearRampToValueAtTime(0.2, strikeTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, strikeTime + 0.65);

      osc.connect(filter);
      detuned.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(strikeTime);
      detuned.start(strikeTime);
      osc.stop(strikeTime + 0.7);
      detuned.stop(strikeTime + 0.7);
    });
  }, []);

  // Extra Cozy agricultural activities
  const playWaterSound = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Synthesize several rising bubbles
    for (let i = 0; i < 6; i++) {
      const delay = ctx.currentTime + i * 0.08 + Math.random() * 0.03;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(300 + Math.random() * 150, delay);
      osc.frequency.exponentialRampToValueAtTime(1400, delay + 0.065); // pop bubbles

      gain.gain.setValueAtTime(0, delay);
      gain.gain.linearRampToValueAtTime(0.12, delay + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, delay + 0.065);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(delay);
      osc.stop(delay + 0.07);
    }
  }, []);

  const playWeedSound = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const noise = ctx.createBufferSource();
    noise.buffer = whiteNoiseBufferRef.current || createWhiteNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1800, ctx.currentTime);
    filter.frequency.setValueAtTime(450, ctx.currentTime + 0.1);
    filter.Q.value = 4.0;

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.12);
  }, []);

  const playSpraySound = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const noise = ctx.createBufferSource();
    noise.buffer = whiteNoiseBufferRef.current || createWhiteNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    filter.type = "bandpass";
    filter.frequency.value = 3500;
    filter.Q.value = 1.0;

    // Smooth hiss sound: slow attack and fast release
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.06);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.36);
  }, []);

  return {
    initAudio,
    playWarpSound,
    playHarvestSound,
    playHoeSound,
    playWaterSound,
    playWeedSound,
    playSpraySound,
  };
};
