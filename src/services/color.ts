export const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = (max + min) / 2;
  let s;
  const l = h;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d) + (g < b ? 6 : 0);
        break;
      case g:
        h = ((b - r) / d) + 2;
        break;
      case b:
        h = ((r - g) / d) + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
};

export const hslToRgb = (h: number, s: number, l: number) => {
  h /= 360;
  s /= 100;
  l /= 100;
  let r;
  let g;
  let b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + ((q - p) * 6 * t);
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + ((q - p) * (2 / 3 - t) * 6);
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - (l * s);
    const p = (2 * l) - q;
    r = hue2rgb(p, q, h + (1 / 3));
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - (1 / 3));
  }

  return [r * 255, g * 255, b * 255];
};

export const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

export const rgbToHex = (r: number, g: number, b: number) => {
  return `#${((r << 16) + (g << 8) + b).toString(16).padStart(6, '0')}`;
};

export const hslToHex = (h: number, s: number, l: number) => {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
};

export const hexToHsl = (hex: string) => {
  const rgb = hexToRgb(hex);
  return rgbToHsl(rgb[0], rgb[1], rgb[2]);
};
