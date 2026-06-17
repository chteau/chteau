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
                <div className="text-xs text-on-surface/65 font-bold tracking-widest mb-1">
                    ENTRY #020_COMMS
                </div>
                <h2 className="text-2xl text-on-primary-container uppercase tracking-wider font-extrabold border-b border-outline/40 pb-2">
                    {t('contact_title')}
                </h2>
                <div className="text-sm text-on-surface/65 mt-1 italic">
                    {t('contact_subtitle')}
                </div>
            </div>

            <div className="space-y-5 max-w-xl">
                <div className="space-y-3 text-sm leading-relaxed text-on-surface-variant text-left">
                    {contactParagraphs.map((p, idx) => (
                        <p key={idx}>{p}</p>
                    ))}
                </div>

                <div className="flex flex-col gap-2">
                    {CONTACT_LINKS.map(({ Icon, platform, href }) => (
                        <a
                            key={platform}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between px-4 py-3 border border-outline/30 bg-surface-container-low hover:border-outline hover:bg-surface-container-high transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={14} className="text-on-primary-container shrink-0" />
                                <span className="text-sm font-bold text-on-surface uppercase tracking-wide">{platform}</span>
                            </div>
                            <ExternalLink size={11} className="text-on-surface/30 group-hover:text-on-surface/70 transition-colors" />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
