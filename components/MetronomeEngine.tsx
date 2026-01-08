
import React, { useEffect, useRef, useCallback } from 'react';
import { SoundType } from '../types';

interface Props {
  isPlaying: boolean;
  bpm: number;
  soundType: SoundType;
  volume: number;
  onBeat: () => void;
}

const MetronomeEngine: React.FC<Props> = ({ isPlaying, bpm, soundType, volume, onBeat }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const timerIDRef = useRef<number | null>(null);
  const beatCounterRef = useRef<number>(0);
  const lookahead = 25.0; // How frequently to call scheduling function (ms)
  const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

  const playSound = useCallback((time: number) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const actualVolume = volume / 100;

    // Helper for noise generation
    const createNoiseBuffer = (duration: number = 1.0) => {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      return buffer;
    };

    switch (soundType) {
      case SoundType.HEARTBEAT: {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        osc.connect(gain);
        osc.frequency.setValueAtTime(60, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
        gain.gain.setValueAtTime(actualVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        osc.start(time);
        osc.stop(time + 0.2);

        // Second pulse
        const secondPulseTime = time + 0.15;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        gain2.connect(ctx.destination);
        osc2.connect(gain2);
        osc2.frequency.setValueAtTime(50, secondPulseTime);
        osc2.frequency.exponentialRampToValueAtTime(0.01, secondPulseTime + 0.1);
        gain2.gain.setValueAtTime(actualVolume * 0.7, secondPulseTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, secondPulseTime + 0.1);
        osc2.start(secondPulseTime);
        osc2.stop(secondPulseTime + 0.2);
        break;
      }

      case SoundType.WOMB_BEAT: {
        // Muffled version of heartbeat, lower frequency, filtered
        const lowPass = ctx.createBiquadFilter();
        lowPass.type = 'lowpass';
        lowPass.frequency.setValueAtTime(150, time);
        lowPass.connect(ctx.destination);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(lowPass);

        osc.frequency.setValueAtTime(45, time);
        osc.frequency.exponentialRampToValueAtTime(20, time + 0.2);
        gain.gain.setValueAtTime(actualVolume * 1.5, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        osc.start(time);
        osc.stop(time + 0.25);

        // Second pulse (muffled)
        const secondPulseTime = time + 0.18;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(lowPass);
        osc2.frequency.setValueAtTime(35, secondPulseTime);
        gain2.gain.setValueAtTime(actualVolume, secondPulseTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, secondPulseTime + 0.2);
        osc2.start(secondPulseTime);
        osc2.stop(secondPulseTime + 0.25);
        break;
      }

      case SoundType.WOOD_BLOCK: {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        osc.connect(gain);
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.exponentialRampToValueAtTime(400, time + 0.05);
        gain.gain.setValueAtTime(actualVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        osc.start(time);
        osc.stop(time + 0.1);
        break;
      }

      case SoundType.SOFT_CHIME: {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        gain.connect(ctx.destination);
        osc.connect(gain);
        osc.frequency.setValueAtTime(1200, time);
        gain.gain.setValueAtTime(actualVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.8);
        osc.start(time);
        osc.stop(time + 1.0);
        break;
      }

      case SoundType.OCEAN_WAVE: {
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(2.0);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, time);
        filter.frequency.exponentialRampToValueAtTime(800, time + 0.3);
        filter.frequency.exponentialRampToValueAtTime(200, time + 0.8);
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0, time);
        noiseGain.gain.linearRampToValueAtTime(actualVolume, time + 0.3);
        noiseGain.gain.linearRampToValueAtTime(0, time + 0.8);
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(time);
        noise.stop(time + 1.0);
        break;
      }

      case SoundType.GENTLE_WIND: {
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(1.5);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, time);
        filter.frequency.linearRampToValueAtTime(600, time + 0.4);
        filter.frequency.linearRampToValueAtTime(400, time + 0.9);
        const windGain = ctx.createGain();
        windGain.gain.setValueAtTime(0, time);
        windGain.gain.linearRampToValueAtTime(actualVolume * 0.8, time + 0.4);
        windGain.gain.linearRampToValueAtTime(0, time + 0.9);
        noise.connect(filter);
        filter.connect(windGain);
        windGain.connect(ctx.destination);
        noise.start(time);
        noise.stop(time + 1.5);
        break;
      }

      case SoundType.RAIN_DROPS: {
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(0.2);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3000, time);
        filter.Q.setValueAtTime(10, time);
        const rainGain = ctx.createGain();
        rainGain.gain.setValueAtTime(actualVolume, time);
        rainGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        noise.connect(filter);
        filter.connect(rainGain);
        rainGain.connect(ctx.destination);
        noise.start(time);
        noise.stop(time + 0.2);
        break;
      }

      case SoundType.WHITE_NOISE: {
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(0.5);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, time);
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(actualVolume * 0.5, time);
        noiseGain.gain.linearRampToValueAtTime(0.01, time + 0.4);
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(time);
        noise.stop(time + 0.5);
        break;
      }

      case SoundType.CAT_PURR: {
        // Low frequency thrumming
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const mainGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(25, time); // Fundamental purr frequency

        lfo.type = 'square';
        lfo.frequency.setValueAtTime(22, time); // Purr "vibration" speed
        lfoGain.gain.setValueAtTime(0.5, time);

        lfo.connect(lfoGain);
        lfoGain.connect(mainGain.gain);

        mainGain.connect(ctx.destination);
        osc.connect(mainGain);

        mainGain.gain.setValueAtTime(actualVolume * 0.5, time);
        mainGain.gain.linearRampToValueAtTime(actualVolume, time + 0.3);
        mainGain.gain.linearRampToValueAtTime(actualVolume * 0.2, time + 0.7);

        lfo.start(time);
        osc.start(time);
        lfo.stop(time + 0.8);
        osc.stop(time + 0.8);
        break;
      }

      case SoundType.LULLABY_MELODY: {
        const melody = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        const freq = melody[beatCounterRef.current % melody.length];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        gain.connect(ctx.destination);
        osc.connect(gain);
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(actualVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 1.2);
        osc.start(time);
        osc.stop(time + 1.5);
        break;
      }
    }
  }, [soundType, volume]);

  const scheduler = useCallback(() => {
    if (!audioContextRef.current) return;
    while (nextNoteTimeRef.current < audioContextRef.current.currentTime + scheduleAheadTime) {
      playSound(nextNoteTimeRef.current);
      onBeat();
      const secondsPerBeat = 60.0 / bpm;
      nextNoteTimeRef.current += secondsPerBeat;
      beatCounterRef.current += 1;
    }
    timerIDRef.current = window.setTimeout(scheduler, lookahead);
  }, [bpm, playSound, onBeat]);

  useEffect(() => {
    if (isPlaying) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      nextNoteTimeRef.current = audioContextRef.current.currentTime;
      beatCounterRef.current = 0;
      scheduler();
    } else {
      if (timerIDRef.current) {
        clearTimeout(timerIDRef.current);
      }
    }
    return () => {
      if (timerIDRef.current) clearTimeout(timerIDRef.current);
    };
  }, [isPlaying, scheduler]);

  return null;
};

export default MetronomeEngine;
