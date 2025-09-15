'use client';

// Função para obter o tema salvo ou a preferência do sistema
export function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  if (savedTheme) return savedTheme;
  
  // Verificar preferência do sistema
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Aplicar o tema antes da hidratação do React
export function applyTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remover classes de tema anteriores
  root.classList.remove('light', 'dark');
  
  // Adicionar a classe do tema atual
  root.classList.add(theme);
  root.setAttribute('data-theme', theme);
  
  console.log('Tema aplicado (script):', theme);
}
