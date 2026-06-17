export const ROBLOX_USER_ID = '925308243';

export interface Game {
    title: string;
    universeID: number;
    role: 1 | 2 | 3;
    href: string;
    released: boolean;
    description: string;
}

export const GAMES: Game[] = [
    {
        title: 'Night Shift: Observation Duty',
        universeID: 5652703661,
        role: 1,
        href: 'https://www.roblox.com/games/16398007442/Night-Shift-Observation-Duty',
        released: true,
        description: "A Roblox game inspired by \"I'm on observation duty\". You're an employee of the secure-view company, responsible for monitoring various locations where anomalies have been spotted.",
    },
    {
        title: 'Gravity Playground',
        universeID: 4938416935,
        role: 3,
        href: 'https://www.roblox.com/games/14280398854/Gravity-Playground',
        released: true,
        description: 'A game about running and playing around with gravity. The first game I worked on with 1M+ visits.',
    },
    {
        title: 'Ascension Incremental',
        universeID: 9668694532,
        role: 3,
        href: 'https://www.roblox.com/games/98388247482875/Ascension-Incremental',
        released: true,
        description: 'An incremental game where you gain points per second, buy upgrades, reach the highest ascension, roll runes, and climb the leaderboard.',
    },
    {
        title: 'Crushed by Speeding Wall For Brainrots',
        universeID: 9583687222,
        role: 3,
        href: 'https://www.roblox.com/games/101354784559824/Crushed-by-Speeding-Wall-For-Brainrots',
        released: true,
        description: 'Collect brainrots, earn cash, upgrade your speed, rebirth for multipliers, and unlock boots in this chaotic wall-dodging game.',
    },
    {
        title: 'Pop Starz ⭐',
        universeID: 7025744580,
        role: 3,
        href: 'https://www.roblox.com/games/118770786913389/Pop-Starz',
        released: true,
        description: 'Step onto the red carpet and live the dream life. Climb the fame ladder, collect rare clothing, own luxury apartments, and roleplay with friends.',
    },
];

export const ROLE_LABELS: Record<1 | 2 | 3, string> = {
    1: 'OWNER',
    2: 'DEVELOPER',
    3: 'CONTRIBUTOR',
};

export const ROLE_STYLES: Record<1 | 2 | 3, string> = {
    1: 'bg-amber-400 text-black',
    2: 'bg-primary text-white',
    3: 'bg-surface-container border border-outline/40 text-on-surface-variant',
};
