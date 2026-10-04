// Dependencies
import { ExternalLink } from 'lucide-react';
import { CONTACT_LINKS } from '../constants';

// Interfaces
interface Props {
    t: (key: string) => string;
    contactParagraphs: string[];
}

export function ContactTab({ t, contactParagraphs }: Props) {
    return (
        <div className="space-y-5">
            <div className="mb-6">
                <h2 className="text-2xl text-on-primary-container uppercase tracking-wider font-extrabold border-b border-outline/40 pb-2">
                    {t('contact_title')}
                </h2>
                <div className="text-sm text-on-surface/65 mt-1 italic">
                    {t('contact_subtitle')}
                </div>
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-on-surface-variant text-left max-w-prose">
                {contactParagraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
                {CONTACT_LINKS.map(({ Icon, platform, href }) => (
                    <a
                        key={platform}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-chip flex flex-col items-center justify-center gap-2.5 py-8 hover:border-primary/60 transition-colors group"
                    >
                        <Icon size={22} className="text-on-primary-container shrink-0" />
                        <span className="text-sm font-bold text-on-surface uppercase tracking-wide">{platform}</span>
                        <span className="flex items-center gap-1 text-[10px] text-on-surface/40 group-hover:text-primary transition-colors">
                            <ExternalLink size={10} />
                        </span>
                    </a>
                ))}
            </div>
        </div>
    );
}
