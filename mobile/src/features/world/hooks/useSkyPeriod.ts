import { useCallback, useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export type SkyPeriod = 'dawn' | 'day' | 'dusk' | 'night';

export type CelestialKind = 'sun' | 'moon' | 'none';

/** Soft sun/moon cue in the sky (2D Views). Positions are 0–1 of the scene. */
export interface CelestialCue {
  kind: CelestialKind;
  /** 0 = east/left, 1 = west/right. */
  x: number;
  /** 0 = near horizon, 1 = high / zenith. */
  elevation: number;
  opacity: number;
}

export interface SkyPalette {
  period: SkyPeriod;
  /** Soft stacked bands, top → bottom (teal/slate, not purple/cream). */
  bands: [string, string, string];
  /** Text / hint colour that contrasts with the sky. */
  ink: string;
  inkMuted: string;
  /** Planet body colours. */
  planetCore: string;
  planetRim: string;
  planetSea: string;
  planetLand: string;
  celestial: CelestialCue;
}

function periodFromHour(hour: number): SkyPeriod {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'dusk';
  return 'night';
}

/**
 * Sun arc from local clock: dawn low-east → midday high → dusk low-west.
 * Night: dim moon (optional cue) or none near midnight.
 */
export function celestialFromLocalTime(date = new Date()): CelestialCue {
  const t = date.getHours() + date.getMinutes() / 60;

  // Sun visible ~05:00–21:00 along a gentle east→west arc.
  if (t >= 5 && t < 21) {
    const u = (t - 5) / 16; // 0..1 across the day
    const elevation = Math.sin(u * Math.PI);
    // Soften opacity near horizons so it isn’t garish.
    const horizonFade = Math.min(1, elevation * 2.2 + 0.25);
    return {
      kind: 'sun',
      x: u,
      elevation,
      opacity: 0.55 + 0.35 * horizonFade,
    };
  }

  // Dim moon overnight (optional cue); hide deepest midnight window.
  if (t >= 21 || t < 5) {
    const nightU = t >= 21 ? (t - 21) / 8 : (t + 3) / 8; // 21→05 mapped ~0..1
    const elevation =
      Math.sin(Math.min(1, Math.max(0, nightU)) * Math.PI) * 0.55;
    if (elevation < 0.08) {
      return { kind: 'none', x: 0.5, elevation: 0, opacity: 0 };
    }
    return {
      kind: 'moon',
      x: 0.15 + nightU * 0.7,
      elevation,
      opacity: 0.28 + elevation * 0.25,
    };
  }

  return { kind: 'none', x: 0.5, elevation: 0, opacity: 0 };
}

const PALETTES: Record<SkyPeriod, Omit<SkyPalette, 'period' | 'celestial'>> = {
  dawn: {
    bands: ['#1e3a4c', '#5b7c8a', '#9bb8b0'],
    ink: '#0f172a',
    inkMuted: '#334155',
    planetCore: '#0f766e',
    planetRim: '#134e4a',
    planetSea: '#0d9488',
    planetLand: '#2dd4bf',
  },
  day: {
    bands: ['#7dd3e8', '#b8e0eb', '#d5ebe6'],
    ink: '#0f172a',
    inkMuted: '#475569',
    planetCore: '#0f766e',
    planetRim: '#115e59',
    planetSea: '#14b8a6',
    planetLand: '#5eead4',
  },
  dusk: {
    bands: ['#1e293b', '#475569', '#78716c'],
    ink: '#f1f5f9',
    inkMuted: '#cbd5e1',
    planetCore: '#0f766e',
    planetRim: '#134e4a',
    planetSea: '#0d9488',
    planetLand: '#2dd4bf',
  },
  night: {
    bands: ['#0b1220', '#152033', '#1e293b'],
    ink: '#e2e8f0',
    inkMuted: '#94a3b8',
    planetCore: '#134e4a',
    planetRim: '#042f2e',
    planetSea: '#0f766e',
    planetLand: '#14b8a6',
  },
};

function skyNow(date = new Date()): SkyPalette {
  const period = periodFromHour(date.getHours());
  return {
    period,
    ...PALETTES[period],
    celestial: celestialFromLocalTime(date),
  };
}

/** Local-clock sky; refreshes on interval and when app returns to foreground. */
export function useSkyPeriod(intervalMs = 60_000): SkyPalette {
  const [sky, setSky] = useState<SkyPalette>(() => skyNow());

  const refresh = useCallback(() => {
    setSky(skyNow());
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    const onAppState = (next: AppStateStatus) => {
      if (next === 'active') refresh();
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [intervalMs, refresh]);

  return sky;
}
