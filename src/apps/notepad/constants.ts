import {
    Flame, Globe, Code2, Monitor, FileCode, Gamepad2,
    Database, GitBranch, Terminal, Server, Zap, Layers,
    Hash, Mail,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type TabId = 'origin' | 'journey' | 'capabilities' | 'contact';

export interface JourneyEntry { year: string; title: string; desc: string; }

export const SKILLS: Array<{ Icon: LucideIcon; label: string }> = [
    { Icon: Flame,     label: 'Luau' },
    { Icon: Globe,     label: 'Web Development' },
    { Icon: Code2,     label: 'TypeScript / Javascript' },
    { Icon: Monitor,   label: 'React / Next.js' },
    { Icon: FileCode,  label: 'PHP' },
    { Icon: Gamepad2,  label: 'Game Development' },
    { Icon: Database,  label: 'Supabase & MySQL' },
    { Icon: GitBranch, label: 'Version Control (git)' },
    { Icon: Terminal,  label: 'Node.JS' },
    { Icon: Server,    label: 'Golang' },
    { Icon: Zap,       label: 'Dart' },
    { Icon: Layers,    label: 'Flutter' },
];

export const CONTACT_LINKS: Array<{ Icon: LucideIcon; platform: string; href: string }> = [
    { Icon: Gamepad2, platform: 'Roblox',  href: 'https://www.roblox.com/users/925308243/profile' },
    { Icon: Hash,     platform: 'Discord', href: 'https://discord.com/users/830189337244991488' },
    { Icon: Mail,     platform: 'Email',   href: 'mailto:cteau@proton.me' },
];
