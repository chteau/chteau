// Dependencies
import { Music } from 'lucide-react';

// Interfaces
interface Props {
    t: (key: string) => string;
    bioParagraphs: string[];
    whatIDoItems: string[];
    lastfmUrl: string;
}

/** One label/value row in the "Quick Facts" sidebar. */
function FactRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">{label}</div>
            <div className="text-sm text-on-surface leading-snug">{value}</div>
        </div>
    );
}

export function OriginTab({ t, bioParagraphs, whatIDoItems, lastfmUrl }: Props) {
    return (
        <div className="space-y-8">
            <div className="mb-6">
                <h2 className="text-2xl text-on-primary-container uppercase tracking-wider font-extrabold border-b border-outline/40 pb-2">
                    {t('bio_title')}
                </h2>
                <div className="text-sm text-on-surface/65 mt-1 italic">
                    {t('bio_subtitle')}
                </div>
            </div>

            <div className="grid md:grid-cols-[1fr_280px] gap-8">
                <div className="space-y-4 text-sm leading-relaxed text-on-surface-variant max-w-prose text-left">
                    {bioParagraphs.map((p, idx) => (
                        <p key={idx} className={p.startsWith('"') ? 'border-l-2 border-outline/50 pl-4 py-1 bg-on-primary-container/5 italic text-on-primary-container' : ''}>
                            {p}
                        </p>
                    ))}
                </div>

                <aside className="glass-chip p-4 space-y-4 h-fit">
                    <h3 className="text-xs font-bold text-on-primary-container tracking-widest border-b border-outline/20 pb-1.5 uppercase">
                        {t('bio_facts_title')}
                    </h3>
                    <FactRow label={t('bio_fact_dayjob_label')} value={t('bio_fact_dayjob_value')} />
                    <FactRow label={t('bio_fact_building_label')} value={t('bio_fact_building_value')} />
                    <FactRow label={t('bio_fact_open_label')} value={t('bio_fact_open_value')} />
                    <a
                        href={lastfmUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-1.5 text-on-primary-container hover:text-primary transition-colors"
                    >
                        <Music size={12} className="mt-0.5 shrink-0" />
                        <span>
                            <span className="block text-[10px] font-bold uppercase tracking-widest opacity-60">
                                {t('bio_fact_listening_label')}
                            </span>
                            <span className="text-sm leading-snug">Loathe</span>
                        </span>
                    </a>
                </aside>
            </div>

            <div className="max-w-prose">
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
