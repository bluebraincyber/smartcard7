import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-3 px-4 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h8v2H6V8zm0 4h12v2H6v-2z"/>
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">SmartCard</span>
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <Link href="/dashboard" className="hover:text-primary transition-colors">
            Painel
          </Link>
          <span>•</span>
          <Link href="/dashboard/store" className="hover:text-primary transition-colors">
            Minha Loja
          </Link>
          <span>•</span>
          <Link href="/dashboard/products" className="hover:text-primary transition-colors">
            Produtos
          </Link>
          <span>•</span>
          <span className="text-gray-400">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
