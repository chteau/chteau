export interface Game {
    title: string;
    universeID: number;
    role: 1 | 2 | 3 | 4 | 5;
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
    {
        title: 'Freeze a Brainrot',
        universeID: 9611718147,
        role: 3,
        href: 'https://www.roblox.com/games/87425630065477/Freeze-a-Brainrot',
        released: true,
        description: 'Run from the Guardians, collect brainrots the farther you go, and cash in for upgrades in this chase-survival game.',
    },
    {
        title: 'Survive Stitch For Brainrots',
        universeID: 9579246063,
        role: 3,
        href: 'https://www.roblox.com/games/82823530623262/Survive-Stitch-For-Brainrots',
        released: true,
        description: 'Run from Stitch to survive, collecting brainrots along the way and earning cash for upgrades.',
    },
    {
        title: 'Save Brainrots from Anime',
        universeID: 9612427320,
        role: 3,
        href: 'https://www.roblox.com/games/94281783862344/Save-Brainrots-from-Anime',
        released: true,
        description: 'Escape anime villains while collecting brainrots and earning cash to upgrade your run.',
    },
    {
        title: 'Cars vs Brainrots',
        universeID: 9535870518,
        role: 3,
        href: 'https://www.roblox.com/games/94677952164241/Cars-vs-Brainrots',
        released: true,
        description: 'Dodge oncoming cars while collecting brainrots and cashing in for upgrades.',
    },
    {
        title: 'Cardverse',
        universeID: 9527125543,
        role: 5,
        href: 'https://www.roblox.com/games/97056781244478/Cardverse',
        released: true,
        description: 'Generate and collect Roblox-themed cards, hunting for rare users, variants, and mutations to build the ultimate collection.',
    },
    {
        title: 'Office Tower Tycoon',
        universeID: 9344342889,
        role: 3,
        href: 'https://www.roblox.com/games/114383798542773/Office-Tower-Tycoon',
        released: true,
        description: 'Build and manage your own office tower, hire workers, and grow a high-tech corporate HQ.',
    },
    {
        title: 'Stranded Together 18+',
        universeID: 10765692470,
        role: 4,
        href: 'https://www.roblox.com/games/108418072803677/Stranded-Together-18',
        released: true,
        description: 'A social island experience built around hanging out and roleplaying with friends.',
    },
    {
        title: 'Swim For Brainrot',
        universeID: 9758951621,
        role: 2,
        href: 'https://www.roblox.com/games/75450635546793/Swim-For-Brainrot',
        released: true,
        description: 'Collect brainrots from islands while escaping the sharks chasing you through the water.',
    },
    {
        title: 'The Pub 18+',
        universeID: 5284329905,
        role: 3,
        href: 'https://www.roblox.com/games/15321209040/The-Pub-18',
        released: true,
        description: 'A social hangout game in active development, built around community and roleplay.',
    },
    {
        title: 'Anime Obby',
        universeID: 5918942322,
        role: 3,
        href: 'https://www.roblox.com/games/17299894983/Anime-Obby',
        released: true,
        description: 'An obstacle course game with 100+ stages inspired by anime.',
    },
];

export const ROLE_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
    1: 'OWNER',
    2: 'DEVELOPER',
    3: 'CONTRIBUTOR',
    4: 'TESTER',
    5: 'INVESTOR',
};

export const ROLE_STYLES: Record<1 | 2 | 3 | 4 | 5, string> = {
    1: 'bg-amber-400 text-black',
    2: 'bg-primary text-white',
    3: 'bg-surface-container border border-outline/40 text-on-surface-variant',
    4: 'bg-sky-400 text-black',
    5: 'bg-emerald-400 text-black',
};

export interface Studio {
    name: string;
    href: string;
    description: string;
}

export const STUDIOS: Studio[] = [
    {
        name: 'IX Studio',
        href: 'https://ixstudiodev.com/',
        description: 'Game development studio building experiences for the Metaverse platform, in collaboration with international brands.',
    },
];

/** Roblox user IDs featured in the "Spotlight" section — fetched live for username, verified badge, and avatar. */
export const SPOTLIGHT_USER_IDS: number[] = [4337879873, 105519417, 5647093294, 10595767136, 1274097373];
