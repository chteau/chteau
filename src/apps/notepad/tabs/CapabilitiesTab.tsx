// Dependencies
import { SKILLS } from '../constants';

// Interfaces
interface Props {
    t: (key: string) => string;
}

/**
 * @file - Capabilities Tab Component
 * 
 * @description - Capabilities Tab Component
 * @param t - Translation Function
 */
export function CapabilitiesTab({ t }: Props) {
    return (
        <div className="space-y-6">
            <div className="mb-6">
                <div className="text-xs text-on-surface/65 font-bold tracking-widest mb-1">
                    ENTRY #101_PROTOCOLS
                </div>
                <h2 className="text-2xl text-on-primary-container uppercase tracking-wider font-extrabold border-b border-outline/40 pb-2">
                    {t('skills_title')}
                </h2>
                <div className="text-sm text-on-surface/65 mt-1 italic">
                    {t('skills_subtitle')}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-w-xl">
                {SKILLS.map(({ Icon, label }) => (
                    <div
                        key={label}
                        className="flex items-center gap-2.5 px-3 py-2.5 border border-outline/30 bg-surface-container-low hover:border-outline transition-colors"
                    >
                        <Icon size={14} className="text-on-primary-container shrink-0" />
                        <span className="text-sm text-on-surface">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
