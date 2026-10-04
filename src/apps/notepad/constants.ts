import { Gamepad2, Hash, Mail } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type TabId = 'origin' | 'journey' | 'capabilities' | 'contact';

export interface JourneyEntry { year: string; title: string; desc: string; }

export const LASTFM_URL = 'https://www.last.fm/user/Cheeteau';

export const CONTACT_LINKS: Array<{ Icon: LucideIcon; platform: string; href: string }> = [
    { Icon: Gamepad2, platform: 'Roblox',  href: 'https://www.roblox.com/users/925308243/profile' },
    { Icon: Hash,     platform: 'Discord', href: 'https://discord.com/users/830189337244991488' },
    { Icon: Mail,     platform: 'Email',   href: 'mailto:cteau@proton.me' },
];
