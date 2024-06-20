import { JSX } from 'solid-js';
import { ThemeType } from '@/constants/theme';

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
