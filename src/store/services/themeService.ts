import { onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import Cookies from 'js-cookie';
import { ThemeType } from '@/constants/theme';
import { AppTheme } from '@/types/theme';

const initThemeConf: AppTheme = {
  type: ThemeType.SYSTEM,
};

export const getTheme = (): AppTheme => {
  let theme = Cookies.get('theme');
  if (!theme) {
    theme = JSON.stringify(initThemeConf);
    Cookies.set('theme', theme);
  }
  return JSON.parse(theme);
};

export const ThemeService = () => {
  const [theme, setTheme] = createStore<AppTheme>(initThemeConf);

  onMount(() => {
    const theme = getTheme();
    setTheme(() => (theme));
  });

  const updateTheme = (update: AppTheme) => {
    setTheme(() => (update));
    Cookies.set('theme', JSON.stringify(update));
  };

  const updateThemeType = (type: ThemeType) => {
    updateTheme({ ...theme, type });
  };

  return {
    theme,
    updateThemeType,
  };
};
