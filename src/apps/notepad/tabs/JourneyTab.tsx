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
                <div className="text-xs text-on-surface/65 font-bold tracking-widest mb-1">
                    ENTRY #010_TIMELINE
                </div>
                <h2 className="text-2xl text-on-primary-container uppercase tracking-wider font-extrabold border-b border-outline/40 pb-2">
                    {t('journey_title')}
                </h2>
                <div className="text-sm text-on-surface/65 mt-1 italic">
                    {t('journey_subtitle')}
                </div>
            </div>

            <div className="relative max-w-xl">
                <div className="absolute left-1.75 top-2 bottom-2 w-px bg-outline/20" />
                <div className="space-y-6">
                    {entries.map((item, idx) => (
                        <div key={idx} className="flex gap-4 relative">
                            <div className="w-4 h-4 rounded-full border border-outline/50 bg-gray-200 shrink-0 mt-0.5 relative z-10" />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-bold px-1.5 py-0.5 border ${idx === entries.length - 1
                                        ? 'border-outline text-on-primary-container bg-on-primary-container/10'
                                        : 'border-outline/40 text-on-surface/50'
                                        }`}>
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
