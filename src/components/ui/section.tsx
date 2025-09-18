import { cn } from "@/lib/utils";

interface SectionProps {
  title: string;
  desc?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, desc, right, children, className }: SectionProps) {
  return (
    <section className={cn("mb-6", className)}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold leading-tight text-gray-900">{title}</h2>
          {desc && <p className="text-sm text-gray-500">{desc}</p>}
        </div>
        {right && <div>{right}</div>}
      </div>
      <div className="rounded-xl border bg-white">
        {children}
      </div>
    </section>
  );
}

export function CardBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-4 md:p-6", className)}>{children}</div>;
}

// Helper components
export function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-sm font-medium text-gray-700">{children}</div>;
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-gray-500">{children}</p>;
}

export function Field({ label, children, muted = false }: { 
  label: string; 
  children: React.ReactNode; 
  muted?: boolean;
}) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className={muted ? "text-sm text-gray-400" : "text-sm text-gray-800"}>
        {children}
      </div>
    </div>
  );
}
