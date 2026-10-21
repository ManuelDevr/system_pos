import { useEffect, useState } from 'react';

const THEME_KEY = 'cma-theme';

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') {
            return 'system';
        }

        const stored = localStorage.getItem(THEME_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
            return stored;
        }

        return 'system';
    });

    const applyTheme = (value) => {
        const root = document.documentElement;

        const isDark =
            value === 'dark' ||
            (value === 'system' &&
                window.matchMedia('(prefers-color-scheme: dark)').matches);

        root.classList.toggle('dark', isDark);
        root.dataset.theme = value;
    };

    useEffect(() => {
        applyTheme(theme);

        localStorage.setItem(THEME_KEY, theme);

        if (theme !== 'system') {
            return;
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => applyTheme('system');

        mediaQuery.addEventListener('change', handler);

        return () => mediaQuery.removeEventListener('change', handler);
    }, [theme]);

    const cycleTheme = () => {
        setTheme((prev) => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'system';
            return 'light';
        });
    };

    const setThemeValue = (value) => {
        if (value === 'light' || value === 'dark' || value === 'system') {
            setTheme(value);
        }
    };

    return {
        theme,
        setTheme: setThemeValue,
        toggleTheme: cycleTheme,
        isDark:
            typeof window !== 'undefined'
                ? document.documentElement.classList.contains('dark')
                : false,
    };
}
