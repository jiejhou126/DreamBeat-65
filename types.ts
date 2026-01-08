
export enum SoundType {
  HEARTBEAT = 'HEARTBEAT',
  WOOD_BLOCK = 'WOOD_BLOCK',
  SOFT_CHIME = 'SOFT_CHIME',
  OCEAN_WAVE = 'OCEAN_WAVE',
  RAIN_DROPS = 'RAIN_DROPS',
  WHITE_NOISE = 'WHITE_NOISE',
  LULLABY_MELODY = 'LULLABY_MELODY',
  WOMB_BEAT = 'WOMB_BEAT',
  GENTLE_WIND = 'GENTLE_WIND',
  CAT_PURR = 'CAT_PURR',
}

export interface SleepTip {
  title: string;
  content: string;
}

export interface MetronomeState {
  isPlaying: boolean;
  bpm: number;
  soundType: SoundType;
  volume: number;
}
