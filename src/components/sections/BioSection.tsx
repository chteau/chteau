"use client";

import { useState } from 'react';
import { BookOpen, Clock, Key, Mail, type LucideIcon } from 'lucide-react';
import { useSectionLocale } from '../../lib/useSectionLocale';
import { getArray } from '../../lib/localeResolver';
import { OriginTab } from '../../apps/notepad/tabs/OriginTab';
import { JourneyTab } from '../../apps/notepad/tabs/JourneyTab';
import { CapabilitiesTab } from '../../apps/notepad/tabs/CapabilitiesTab';
import { ContactTab } from '../../apps/notepad/tabs/ContactTab';
import { LASTFM_URL } from '../../apps/notepad/constants';

type TabId = 'origin' | 'journey' | 'capabilities' | 'contact';

/**
 * Bio section — about me, journey, skills, and contact links merged into one
 * panel with an internal tab strip. Reuses the notepad content tabs as-is;
 * only the chrome around them changed.
 */
export default function BioSection({ initialTab = 'origin' }: { initialTab?: TabId }) {
    const [activeTab, setActiveTab] = useState<TabId>(initialTab);
    const { t, bundle } = useSectionLocale('notepad');

    const bioParagraphs = getArray(bundle, 'bio_paragraphs');
    const whatIDoItems = getArray(bundle, 'what_i_do');
    const contactParagraphs = getArray(bundle, 'contact_paragraphs');

    const journeyYears = getArray(bundle, 'journey_years');
    const journeyTitles = getArray(bundle, 'journey_titles');
    const journeyDescs = getArray(bundle, 'journey_descs');
    const journeyEntries = journeyYears.map((year, i) => ({
        year,
        title: journeyTitles[i] ?? '',
        desc: journeyDescs[i] ?? '',
    }));

    const tabs: { id: TabId; Icon: LucideIcon; label: string }[] = [
        { id: 'origin', Icon: BookOpen, label: t('tab_bio') },
        { id: 'journey', Icon: Clock, label: t('tab_journey') },
        { id: 'capabilities', Icon: Key, label: t('tab_skills') },
        { id: 'contact', Icon: Mail, label: t('tab_contact') },
    ];

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map(({ id, Icon, label }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors cursor-pointer ${
                            activeTab === id
                                ? 'bg-primary text-white'
                                : 'glass-chip text-on-surface-variant hover:text-on-surface'
                        }`}
                    >
                        <Icon size={12} />
                        <span>{label}</span>
                    </button>
                ))}
            </div>

            {activeTab === 'origin' && (
                <OriginTab t={t} bioParagraphs={bioParagraphs} whatIDoItems={whatIDoItems} lastfmUrl={LASTFM_URL} />
            )}
            {activeTab === 'journey' && <JourneyTab t={t} entries={journeyEntries} />}
            {activeTab === 'capabilities' && <CapabilitiesTab t={t} />}
            {activeTab === 'contact' && <ContactTab t={t} contactParagraphs={contactParagraphs} />}
        </div>
    );
}
