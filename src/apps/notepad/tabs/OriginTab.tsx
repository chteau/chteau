// Interfaces
interface Props {
    t: (key: string) => string;
    bioParagraphs: string[];
    whatIDoItems: string[];
}

export function OriginTab({ t, bioParagraphs, whatIDoItems }: Props) {
    return (
        <div className="space-y-4">
            <div className="mb-6">
                <div className="text-xs text-on-surface/65 font-bold tracking-widest mb-1">
                    ENTRY #000_BIO
                </div>
                <h2 className="text-2xl text-on-primary-container uppercase tracking-wider font-extrabold border-b border-outline/40 pb-2">
                    {t('bio_title')}
                </h2>
                <div className="text-sm text-on-surface/65 mt-1 italic">
                    {t('bio_subtitle')}
                </div>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-on-surface-variant max-w-xl text-left">
                {bioParagraphs.map((p, idx) => (
                    <p key={idx} className={p.startsWith('"') ? 'border-l-2 border-outline/50 pl-4 py-1 bg-on-primary-container/5 italic text-on-primary-container' : ''}>
                        {p}
                    </p>
                ))}
            </div>

            <div className="mt-8 max-w-xl">
                <h3 className="text-xs font-bold text-on-primary-container tracking-widest border-b border-outline/20 pb-1 mb-3 uppercase">
                    {t('what_i_do_title')}
                </h3>
                <ul className="space-y-2">
                    {whatIDoItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-on-surface-variant leading-relaxed">
                            <span className="text-on-primary-container mt-0.5 shrink-0">•</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
