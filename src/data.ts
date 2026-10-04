/**
 * Shell-level translation dictionary for the galaxy experience. App-scoped
 * strings (bio/projects/github/roblox content) still live in each section's
 * `locales/*.json`; only the galaxy chrome keys (hero, star labels, panel
 * navigation, nav menu, star form, blog, comments) live here.
 */
export const TRANSLATIONS = {
    en: {
        star_projects: "Projects",
        star_github: "GitHub",
        star_roblox: "Roblox",
        star_bio: "About Me",
        star_contact: "Contact",
        star_blog: "Blog",

        welcome_title: "Cheeteau",
        welcome_subtitle: "Full-Stack Developer Portfolio",

        panel_close: "Close",
        panel_back: "Back to galaxy",

        nav_add_star: "Add a Star",

        star_form_title: "Add Your Star",
        star_form_github: "GitHub profile",
        star_form_github_signin: "Sign in with GitHub",
        star_form_github_signedin: "Signed in as",
        star_form_roblox: "Roblox profile",
        star_form_roblox_code_hint: "Paste this code into your Roblox bio (About section) to verify it's really you:",
        star_form_roblox_code_copy: "Copy code",
        star_form_links_hint: "Sign in with GitHub, or verify a Roblox profile above — at least one is required.",
        star_form_message: "Message",
        star_form_placeholder: "Say hi to the galaxy…",
        star_form_submit: "Launch My Star",
        star_form_submitting: "Sending…",
        star_form_success: "Your star is now part of the galaxy. Thanks for stopping by!",
        star_form_close: "Close",

        blog_title: "Blog",
        blog_empty: "No posts yet — check back soon.",

        comments_title: "Comments",
        comments_signin: "Sign in with GitHub to comment",
        comments_signout: "Sign out",
        comments_placeholder: "Add a comment…",
        comments_submit: "Post Comment",
        comments_submitting: "Posting…",
        comments_empty: "No comments yet — be the first!",
    },
    fr: {
        star_projects: "Projets",
        star_github: "GitHub",
        star_roblox: "Roblox",
        star_bio: "À propos",
        star_contact: "Contact",
        star_blog: "Blog",

        welcome_title: "Cheeteau",
        welcome_subtitle: "Portfolio de Développeur Full-Stack",

        panel_close: "Fermer",
        panel_back: "Retour à la galaxie",

        nav_add_star: "Ajouter une étoile",

        star_form_title: "Ajoutez votre étoile",
        star_form_github: "Profil GitHub",
        star_form_github_signin: "Se connecter avec GitHub",
        star_form_github_signedin: "Connecté en tant que",
        star_form_roblox: "Profil Roblox",
        star_form_roblox_code_hint: "Collez ce code dans la bio (section « À propos ») de votre profil Roblox pour prouver que c'est bien vous :",
        star_form_roblox_code_copy: "Copier le code",
        star_form_links_hint: "Connectez-vous avec GitHub, ou vérifiez un profil Roblox ci-dessus — au moins l'un des deux est requis.",
        star_form_message: "Message",
        star_form_placeholder: "Dites bonjour à la galaxie…",
        star_form_submit: "Lancer mon étoile",
        star_form_submitting: "Envoi…",
        star_form_success: "Votre étoile fait désormais partie de la galaxie. Merci de votre passage !",
        star_form_close: "Fermer",

        blog_title: "Blog",
        blog_empty: "Aucun article pour l'instant — revenez bientôt.",

        comments_title: "Commentaires",
        comments_signin: "Connectez-vous avec GitHub pour commenter",
        comments_signout: "Se déconnecter",
        comments_placeholder: "Ajouter un commentaire…",
        comments_submit: "Publier",
        comments_submitting: "Publication…",
        comments_empty: "Aucun commentaire pour l'instant — soyez le premier !",
    },
    br: {
        star_projects: "Raktresoù",
        star_github: "GitHub",
        star_roblox: "Roblox",
        star_bio: "Diwar-benn",
        star_contact: "Darempred",
        star_blog: "Blog",

        welcome_title: "Cheeteau",
        welcome_subtitle: "Lañser Raktresoù Full-Stack",

        panel_close: "Serriñ",
        panel_back: "Distreiñ d'ar c'houmoulenn",

        nav_add_star: "Ouzhpennañ ur steredenn",

        star_form_title: "Ouzhpennit ho steredenn",
        star_form_github: "Profil GitHub",
        star_form_github_signin: "Kevankañ gant GitHub",
        star_form_github_signedin: "Kevanket evel",
        star_form_roblox: "Profil Roblox",
        star_form_roblox_code_hint: "Lakait ar c'hod-mañ e bio ho profil Roblox (lodenn Diwar-benn) evit gwiriañ eo mat c'hwi:",
        star_form_roblox_code_copy: "Eilañ ar c'hod",
        star_form_links_hint: "Kevankit gant GitHub, pe wiriit ur profil Roblox a-us — ret eo unan eus an daou d'an nebeutañ.",
        star_form_message: "Kemennadenn",
        star_form_placeholder: "Degemer mat d'ar c'houmoulenn…",
        star_form_submit: "Lañsañ va steredenn",
        star_form_submitting: "O kas…",
        star_form_success: "Ho steredenn a zo bremañ ur parzh eus ar c'houmoulenn. Trugarez deoc'h!",
        star_form_close: "Serriñ",

        blog_title: "Blog",
        blog_empty: "N'eus pennad ebet c'hoazh — distroit a-benn nebeut.",

        comments_title: "Evezhiadennoù",
        comments_signin: "Kevreit gant GitHub evit evezhiañ",
        comments_signout: "Digevreañ",
        comments_placeholder: "Ouzhpennañ un evezhiadenn…",
        comments_submit: "Embann",
        comments_submitting: "O embann…",
        comments_empty: "N'eus evezhiadenn ebet c'hoazh — bezit an hini gentañ!",
    }
} as const;
