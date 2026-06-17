/**
 * OS-level translation dictionary. App-scoped strings (notepad/terminal/
 * explorer) now live in each app package's `locales/*.json`; only shell
 * chrome keys (desktop labels, start menu, taskbar, power, toasts) remain here.
 */
export const TRANSLATIONS = {
    en: {
        desktop_notepad: "Chteau.txt",
        desktop_explorer: "Projects",
        desktop_terminal: "Core_Sys",
        desktop_github: "GitHub",

        start_menu_btn: "CHTEAU",
        start_programs: "PROGRAMS",
        start_filter: "CRT FILTER",
        start_power: "SHUT DOWN",
        start_language: "LANGUAGE",

        welcome_title: "Cheeteau",
        welcome_subtitle: "Full-Stack Developer Portfolio",
        welcome_prompt_title: "SYSTEM PROMPT",
        welcome_email_placeholder: "your_email@domain.com",
        welcome_email_btn: "INITIALIZE SIGNAL",
        welcome_email_success: "INTEGRATED",
        welcome_text: "Welcome to the interactive portfolio workspace.",

        trackbar_crt: "CRT Filter",
        trackbar_status: "Active Link",

        power_title: "System Shutdown",
        power_desc: "The connection has been terminated. Click the button below to restart.",
        power_btn: "Power system on",

        toast_welcome_title: "SYSTEM ONLINE",
        toast_welcome_desc: "Cheeteau workspace initialized successfully.",
        toast_crt_on: "CRT FILTER ON",
        toast_crt_off: "CRT FILTER OFF"
    },
    fr: {
        desktop_notepad: "Chteau.txt",
        desktop_explorer: "Projets",
        desktop_terminal: "Sys_Core",
        desktop_github: "Git_Hub",
        start_menu_btn: "CHTEAU",
        start_programs: "PROGRAMMES",
        start_filter: "ÉCRAN TRC",
        start_power: "ÉTEINDRE",
        start_language: "LANGUE",

        welcome_title: "Cheeteau",
        welcome_subtitle: "Portfolio de Développeur Full-Stack",
        welcome_prompt_title: "CONSOLE DE SÉCURITÉ",
        welcome_email_placeholder: "votre_email@domaine.com",
        welcome_email_btn: "INITIALISER LE SIGNAL",
        welcome_email_success: "INTÉGRÉ",
        welcome_text: "Bienvenue sur l'espace de travail interactif du portfolio.",

        trackbar_crt: "Écran TRC",
        trackbar_status: "Lien Actif",

        power_title: "Arrêt du Système",
        power_desc: "La connexion a été interrompue. Cliquez sur le bouton ci-dessous pour redémarrer.",
        power_btn: "Allumer le système",

        toast_welcome_title: "SYSTÈME EN LIGNE",
        toast_welcome_desc: "L'espace de travail Cheeteau a été initialisé avec succès.",
        toast_crt_on: "FILTRE TRC ACTIVÉ",
        toast_crt_off: "FILTRE TRC DÉSACTIVÉ"
    },
    br: {
        desktop_notepad: "Chteau.txt",
        desktop_explorer: "Raktresoù",
        desktop_terminal: "Sist_Kreiz",
        desktop_github: "Git_Hub",
        start_menu_btn: "CHTEAU",
        start_programs: "PROGRAMMOÙ",
        start_filter: "SKRAMM CRT",
        start_power: "LAZHAÑ",
        start_language: "YEZH",

        welcome_title: "Cheeteau",
        welcome_subtitle: "Lañser Raktresoù Full-Stack",
        welcome_prompt_title: "KREIZENN DIOGELROEZ",
        welcome_email_placeholder: "da_bost_el@domain.com",
        welcome_email_btn: "DIGERIÑ AR GOULEIER",
        welcome_email_success: "STAGET",
        welcome_text: "Degemer mat war etrefas raktresoù micherel.",

        trackbar_crt: "Skramm CRT",
        trackbar_status: "Liamm Oberiant",

        power_title: "Reizhiad Lazhet",
        power_desc: "Kevreadur an etrefas a zo bet troc'het. Klikit amañ dindan evit adlañsañ.",
        power_btn: "Enaouiñ ar reizhiad",

        toast_welcome_title: "REIZHIAD OBERIANT",
        toast_welcome_desc: "Digoret eo bet gant berzh an takad Cheeteau.",
        toast_crt_on: "REIZHIAD CRT WAR-ENAOU",
        toast_crt_off: "REIZHIAD CRT LAZHET"
    }
} as const;


