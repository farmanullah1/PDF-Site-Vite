import { Link } from 'react-router-dom';

interface ToolCardProps {
  tool: {
    id: string;
    name: string;
    description: string;
    icon: string;
    accent: string;
    route: string;
  };
}

const ICON_COLORS: Record<string, string> = {
  primary: '#e5322d',
  secondary: '#4a7aab',
  tertiary: '#7253e2',
};

export default function ToolCard({ tool }: ToolCardProps) {
  const color = ICON_COLORS[tool.accent] ?? ICON_COLORS.primary;

  return (
    <Link
      to={tool.route}
      className="flex flex-col items-start gap-3 p-3 tool-card group"
      aria-label={`${tool.name} — ${tool.description}`}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm"
        style={{ background: color }}
        aria-hidden="true"
      >
        <CardIcon name={tool.icon} color={color} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[1.25rem] font-semibold leading-tight text-[#161616]">{tool.name}</span>
        <span className="text-[0.875rem] leading-normal text-[#47474f] line-clamp-2">{tool.description}</span>
      </div>
    </Link>
  );
}

function CardIcon({ name, color }: { name: string; color: string }) {
  // Lightweight icon registry so we don't import every Lucide icon at module scope.
  return <IconByName name={name} color={color} size={22} />;
}

import * as LucideIcons from 'lucide-react';

const iconCache = new Map<string, React.FC<{ color?: string; size?: number }>>();
let warned = false;

function IconByName({ name, color, size = 22 }: { name: string; color?: string; size?: number }) {
  const Component = iconCache.get(name);
  if (Component) return <Component color={color} size={size} />;
  const MaybeIcon = (LucideIcons as unknown as Record<string, React.FC<{ color?: string; size?: number }>>)[name];
  if (typeof MaybeIcon === 'function') {
    iconCache.set(name, MaybeIcon);
    return <MaybeIcon color={color} size={size} />;
  }
  if (!warned) {
    console.warn(`[PDF Site] Unknown icon: ${name}`);
    warned = true;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <path d="M12 17h.01"/>
    </svg>
  );
}
