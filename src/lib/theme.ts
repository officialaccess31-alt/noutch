export const theme = {
  color: {
    ink: '#111111',
    muted: '#737373',
    line: '#dedede',
    paper: '#fafafa',
    white: '#ffffff',
    tableHead: '#f7f7f7',
    primary: '#111111',
    sidebar: '#171717',
    sidebarText: '#a3a3a3',
    sidebarHover: '#222222',
    sidebarActive: '#2c2c2c',
    sidebarAccent: '#ffffff',
    okText: '#0f7a5d',
    okBg: '#e7f7f1',
  },
  font: {
    body: 'var(--font-satoshi), sans-serif',
    display: 'var(--font-satoshi), sans-serif',
  },
  radius: { sm: '8px', md: '11px', lg: '12px' },
  drawer: '900px', // below this width the sidebar becomes a slide-in menu
  mobile: '700px',
} as const
