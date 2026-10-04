// Dependencies
import type { JourneyEntry } from '../constants';

// Interfaces
interface Props {
    t: (key: string) => string;
    entries: JourneyEntry[];
}

export function JourneyTab({ t, entries }: Props) {
    return (
        <div className="space-y-4">
            <div className="mb-6">
                <h2 className="text-2xl text-on-primary-container uppercase tracking-wider font-extrabold border-b border-outline/40 pb-2">
                    {t('journey_title')}
                </h2>
                <div className="text-sm text-on-surface/65 mt-1 italic">
                    {t('journey_subtitle')}
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                {entries.map((item, idx) => {
                    const isLast = idx === entries.length - 1;
                    return (
                        <div
                            key={idx}
                            className={`glass-chip p-4 hover:border-primary/50 transition-colors ${isLast ? 'sm:col-span-2' : ''}`}
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <span
                                    className={`w-2.5 h-2.5 shrink-0 border ${
                                        isLast ? 'bg-primary border-primary' : 'bg-primary-container/60 border-primary/50'
                                    }`}
                                    style={isLast ? { boxShadow: '0 0 10px 1px var(--color-primary)' } : undefined}
                                />
                                <span
                                    className={`text-xs font-bold px-1.5 py-0.5 border ${
                                        isLast
                                            ? 'border-primary/60 text-white bg-primary/80'
                                            : 'border-outline/40 text-on-primary-container bg-primary-container/10'
                                    }`}
                                >
                                    {item.year}
                                </span>
                                <span className="text-xs font-bold text-on-surface uppercase tracking-wide">
                                    {item.title}
                                </span>
                            </div>
                            <p className="text-sm text-on-surface-variant leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
