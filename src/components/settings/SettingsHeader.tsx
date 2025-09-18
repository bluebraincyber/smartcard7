import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function SettingsHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8 space-y-2">
      <div className="flex items-center space-x-4">
        <Link 
          href="/dashboard" 
          className="p-2 rounded-full hover:bg-accent transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5 text-foreground/70" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground pl-12">
          {description}
        </p>
      )}
    </div>
  );
}
