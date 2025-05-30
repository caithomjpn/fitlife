export const getColors = (theme: 'light' | 'dark') => ({
  primary: theme === 'dark' ? '#90caf9' : '#0072B2',
  secondary: theme === 'dark' ? '#ffcc80' : '#E69F00',
  accent: theme === 'dark' ? '#f48fb1' : '#CC79A7',
  background: theme === 'dark' ? '#121212' : '#F0F0F0',
  textDark: theme === 'dark' ? '#ffffff' : '#333333',

  aerobic: '#E69F00',
  anaerobic: '#CC79A7',
});
