// Dependencies
import SkillSphere from '../SkillSphere';
import { SKILL_ICONS } from '../skillIcons';

// Interfaces
interface Props {
    t: (key: string) => string;
}

export function CapabilitiesTab({ t }: Props) {
    return (
        <div className="space-y-2">
            <div className="mb-6">
                <h2 className="text-2xl text-on-primary-container uppercase tracking-wider font-extrabold border-b border-outline/40 pb-2">
                    {t('skills_title')}
                </h2>
                <div className="text-sm text-on-surface/65 mt-1 italic">
                    {t('skills_subtitle')}
                </div>
            </div>

            {/* Plain-text equivalent for screen readers — the sphere below is a decorative, hover-labelled visualization. */}
            <ul className="sr-only">
                {SKILL_ICONS.map((icon) => (
                    <li key={icon.key}>{icon.label}</li>
                ))}
            </ul>

            <SkillSphere />
        </div>
    );
}
