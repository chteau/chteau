"use client";

// Dependencies
import React, { useState, useEffect } from 'react';
import { BookOpen, Key, Mail, Clock } from 'lucide-react';
import { defineApp } from '../../runtime/defineApp';
import { loadAppLocale, getArray, type LocaleBundle } from '../../runtime/localeResolver';
import type { TabId } from './constants';
import { OriginTab }       from './tabs/OriginTab';
import { JourneyTab }      from './tabs/JourneyTab';
import { CapabilitiesTab } from './tabs/CapabilitiesTab';
import { ContactTab }      from './tabs/ContactTab';

export default defineApp(({ runtime }) => {
    const { t, locale } = runtime;
    const [activeTab, setActiveTab] = useState<TabId>('origin');
    const [bundle, setBundle] = useState<LocaleBundle>({});

    useEffect(() => {
        let active = true;
        loadAppLocale('notepad', locale).then((b) => {
            if (active) setBundle(b);
        });
        return () => { active = false; };
    }, [locale]);

    const bioParagraphs     = getArray(bundle, 'bio_paragraphs');
    const whatIDoItems      = getArray(bundle, 'what_i_do');
    const contactParagraphs = getArray(bundle, 'contact_paragraphs');

    const journeyYears  = getArray(bundle, 'journey_years');
    const journeyTitles = getArray(bundle, 'journey_titles');
    const journeyDescs  = getArray(bundle, 'journey_descs');
    const journeyEntries = journeyYears.map((year, i) => ({
        year,
        title: journeyTitles[i] ?? '',
        desc:  journeyDescs[i]  ?? '',
    }));

    const tabs: { id: TabId; Icon: React.ElementType; label: string }[] = [
        { id: 'origin',       Icon: BookOpen, label: t('tab_bio') },
        { id: 'journey',      Icon: Clock,    label: t('tab_journey') },
        { id: 'capabilities', Icon: Key,      label: t('tab_skills') },
        { id: 'contact',      Icon: Mail,     label: t('tab_contact') },
    ];

    return (
        <div className="flex flex-col h-full bg-white text-on-surface font-mono select-text" id="app-notepad">
            {/* Menu bar */}
            <div className="bg-surface-container border-b border-outline/40 px-2 py-1 flex items-center gap-4 text-xs select-none">
                {['File', 'Edit', 'Search', 'Help'].map((item) => (
                    <span key={item} className="cursor-pointer hover:text-on-surface/60 transition-colors text-xs uppercase">
                        {item}
                    </span>
                ))}
            </div>

            <div className="grow flex flex-col md:flex-row overflow-hidden">
                {/* Sidebar */}
                <div className="w-full md:w-44 md:shrink-0 bg-surface-container-low md:border-r border-b md:border-b-0 border-outline/30 flex md:flex-col overflow-x-auto md:overflow-x-visible select-none">
                    {tabs.map(({ id, Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-2 p-3 text-left border-r md:border-r-0 md:border-b border-outline/20 text-xs transition-colors uppercase cursor-pointer shrink-0 whitespace-nowrap ${activeTab === id
                                ? 'bg-primary-container text-white border-l-2 border-l-primary font-bold'
                                : 'text-on-surface/70 hover:bg-surface-container-high hover:text-on-surface'
                            }`}
                        >
                            <Icon size={14} className={activeTab === id ? 'text-white' : ''} />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="grow p-5 overflow-y-auto scrollbar-custom bg-white flex flex-col justify-between">
                    <div>
                        {activeTab === 'origin'       && <OriginTab       t={t} bioParagraphs={bioParagraphs} whatIDoItems={whatIDoItems} />}
                        {activeTab === 'journey'      && <JourneyTab      t={t} entries={journeyEntries} />}
                        {activeTab === 'capabilities' && <CapabilitiesTab t={t} />}
                        {activeTab === 'contact'      && <ContactTab      t={t} contactParagraphs={contactParagraphs} />}
                    </div>

                    <div className="mt-8 text-[11px] text-on-surface/50 uppercase text-right border-t border-outline/20 pt-2">
                        CHTEAU_PORTFOLIO_STREAM // CODESPEED: OPTIMAL
                    </div>
                </div>
            </div>

            {/* Status bar */}
            <div className="bg-surface-container-high border-t border-outline/30 p-1 px-3 text-xs flex justify-between uppercase select-none text-on-surface-variant">
                <span>Ln {activeTab === 'origin' ? '12, Col 4' : '3, Col 8'}</span>
                <span>UTF-8 // UTF-8</span>
            </div>
        </div>
    );
});
