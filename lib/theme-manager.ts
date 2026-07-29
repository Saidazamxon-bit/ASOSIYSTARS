export type ThemeName = 'default' | 'aqua' | 'cyberpunk' | 'valentine' | 'retro'

const THEME_MAP: Record<ThemeName, Record<string, string>> = {
  default: {
    '--bg-gradient-start': '#0f172a',
    '--bg-gradient-end': '#0ea5e9',
    '--accent': '#0ea5e9',
    '--accent-foreground': '#ffffff',
    '--avatar-start': '#111827',
    '--avatar-end': '#0ea5e9',
    '--badge-bg': 'linear-gradient(90deg,#0ea5e9,#7c3aed)',
    '--badge-foreground': '#fff',
    '--level-bg': 'linear-gradient(90deg,#7c3aed,#22d3ee)',
    '--level-foreground': '#fff',
    '--card-border': 'rgba(14,165,233,0.12)',
    '--glow': '0 8px 30px rgba(14,165,233,0.15)',
    '--shadow': '0 6px 20px rgba(2,6,23,0.45)',
    '--hover': 'linear-gradient(90deg, rgba(14,165,233,0.06), rgba(124,58,237,0.06))',
    '--noise': 'rgba(255,255,255,0.02)'
  },
  aqua: {
    '--bg-gradient-start': '#032f44',
    '--bg-gradient-end': '#7dd3fc',
    '--accent': '#22d3ee',
    '--accent-foreground': '#031f2d',
    '--avatar-start': '#08303a',
    '--avatar-end': '#7dd3fc',
    '--badge-bg': 'linear-gradient(90deg,#22d3ee,#7dd3fc)',
    '--badge-foreground': '#031f2d',
    '--level-bg': 'linear-gradient(90deg,#7dd3fc,#22d3ee)',
    '--level-foreground': '#022022',
    '--card-border': 'rgba(34,211,238,0.12)',
    '--glow': '0 10px 40px rgba(34,211,238,0.12)',
    '--shadow': '0 6px 20px rgba(1,18,24,0.5)',
    '--hover': 'linear-gradient(90deg, rgba(34,211,238,0.06), rgba(125,211,252,0.06))',
    '--noise': 'rgba(0,0,0,0.02)'
  },
  cyberpunk: {
    '--bg-gradient-start': '#0f172a',
    '--bg-gradient-end': '#7c3aed',
    '--accent': '#8b5cf6',
    '--accent-foreground': '#f8f7ff',
    '--avatar-start': '#0b1020',
    '--avatar-end': '#7c3aed',
    '--badge-bg': 'linear-gradient(90deg,#7c3aed,#22d3ee)',
    '--badge-foreground': '#fff',
    '--level-bg': 'linear-gradient(90deg,#22d3ee,#8b5cf6)',
    '--level-foreground': '#fff',
    '--card-border': 'rgba(124,58,237,0.12)',
    '--glow': '0 10px 40px rgba(124,58,237,0.14)',
    '--shadow': '0 6px 20px rgba(6,7,20,0.6)',
    '--hover': 'linear-gradient(90deg, rgba(124,58,237,0.06), rgba(34,211,238,0.06))',
    '--noise': 'rgba(255,255,255,0.01)'
  },
  valentine: {
    '--bg-gradient-start': '#221425',
    '--bg-gradient-end': '#f43f5e',
    '--accent': '#f43f5e',
    '--accent-foreground': '#ffffff',
    '--avatar-start': '#3b1020',
    '--avatar-end': '#f9c0d9',
    '--badge-bg': 'linear-gradient(90deg,#f43f5e,#f9c0d9)',
    '--badge-foreground': '#fff',
    '--level-bg': 'linear-gradient(90deg,#f9c0d9,#f43f5e)',
    '--level-foreground': '#fff',
    '--card-border': 'rgba(244,63,94,0.12)',
    '--glow': '0 10px 40px rgba(244,63,94,0.12)',
    '--shadow': '0 6px 20px rgba(24,6,12,0.6)',
    '--hover': 'linear-gradient(90deg, rgba(244,63,94,0.06), rgba(249,192,217,0.06))',
    '--noise': 'rgba(255,255,255,0.015)'
  },
  retro: {
    '--bg-gradient-start': '#3f2f11',
    '--bg-gradient-end': '#d6b47a',
    '--accent': '#d6b47a',
    '--accent-foreground': '#1b1206',
    '--avatar-start': '#3f2f11',
    '--avatar-end': '#d6b47a',
    '--badge-bg': 'linear-gradient(90deg,#d6b47a,#f8e7c2)',
    '--badge-foreground': '#1b1206',
    '--level-bg': 'linear-gradient(90deg,#d6b47a,#3f2f11)',
    '--level-foreground': '#1b1206',
    '--card-border': 'rgba(214,180,122,0.12)',
    '--glow': '0 8px 30px rgba(214,180,122,0.08)',
    '--shadow': '0 6px 20px rgba(40,30,20,0.6)',
    '--hover': 'linear-gradient(90deg, rgba(214,180,122,0.06), rgba(63,47,17,0.06))',
    '--noise': 'rgba(0,0,0,0.02)'
  }
}

export function applyThemeVars(theme: ThemeName | string) {
  const name = (theme || 'default') as ThemeName
  const vars = THEME_MAP[name] || THEME_MAP.default
  const root = typeof document !== 'undefined' ? document.documentElement : null
  if (!root) return
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
  // also set data-theme attribute for old CSS fallbacks
  root.setAttribute('data-theme', name)
}
