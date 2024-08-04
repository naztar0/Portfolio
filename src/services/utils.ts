import { JSX } from 'solid-js';
import { ThemeType } from '@/constants/theme';
import { hexToHsl, hslToHex } from './color';

export const getSystemTheme = () => (
  window.matchMedia('(prefers-color-scheme: dark)').matches ? ThemeType.DARK : ThemeType.LIGHT
);

export const calculateAge = (birthday: Date) => {
  const ageDifMs = Date.now() - birthday.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const vhToPx = (vh: number) => vh * window.innerHeight / 100;
export const vwToPx = (vw: number) => vw * window.innerWidth / 100;
export const pxToVw = (px: number, width=1920) => px * 100 / width;
export const scaleAny = (value: number, width=1920) => value * window.innerWidth / width;

export const escapeFI = (span: JSX.Element) => {
  const escape = (str: string) => str.replace(/fi/g, 'f<span style="font-size: 1px"> </span>i');
  if (span instanceof HTMLElement) {
    span.innerHTML = escape(span.innerHTML);
  }
  return span;
};

export class Vector2 {
  x: number;
  y: number;

  constructor(x?: number, y?: number) {
    this.x = x || -1;
    this.y = y || -1;
  }

  static dist(a: Vector2, b: Vector2) {
    const x = a.x - b.x;
    const y = a.y - b.y;
    return Math.sqrt(x * x + y * y);
  }

  static normalize(out: Vector2, a: Vector2) {
    const length = Math.sqrt(a.x * a.x + a.y * a.y);
    if (length > 0) {
      out.x = a.x / length;
      out.y = a.y / length;
    }
  }

  static add(out: Vector2, a: Vector2, b: Vector2) {
    out.x = a.x + b.x;
    out.y = a.y + b.y;
  }

  static scale(out: Vector2, a: Vector2, scale: number) {
    out.x = a.x * scale;
    out.y = a.y * scale;
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  copy() {
    return new Vector2(this.x, this.y);
  }
}

export const generateGradientColor = (hex: string, shift: number) => {
  const hsl = hexToHsl(hex);
  hsl[0] = (hsl[0] + shift) % 360;
  return hslToHex(hsl[0], hsl[1], hsl[2]);
};

export type RenderEngine = 'Blink' | 'WebKit' | 'Gecko' | 'Unknown';

export const getRenderingEngine = (): RenderEngine => {
  const engines = navigator.userAgent.matchAll(/(?<engine>Chrome|WebKit|Gecko)/g);

  const detectedEngines = new Set<string>();
  for (const match of engines) {
    if (match.groups?.engine) {
      detectedEngines.add(match.groups.engine);
    }
  }

  if (detectedEngines.has('Gecko') && !detectedEngines.has('Chrome')) {
    return 'Gecko';
  } else if (detectedEngines.has('WebKit') && !detectedEngines.has('Chrome')) {
    return 'WebKit';
  } else if (detectedEngines.has('Chrome')) {
    return 'Blink';
  } else {
    return 'Unknown';
  }
};
