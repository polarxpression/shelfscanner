
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '@/locales/en-US.json';
import ptBR from '@/locales/pt-BR.json';

type Translations = typeof en;
type TranslationKey = keyof Translations;

interface TranslationContextType {
  translations: Translations;
  language: string;
  setLanguage: (language: string) => void;
  t: (key: TranslationKey, substitutions?: Record<string, string>) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const languages: Record<string, Translations> = {
  'en-US': en,
  'pt-BR': ptBR,
};

function getNavigatorLanguage() {
  if (typeof navigator === 'undefined') return 'en-US';
  const lang = navigator.language;
  return Object.keys(languages).includes(lang) ? lang : 'en-US';
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('en-US');

  useEffect(() => {
    const browserLang = getNavigatorLanguage();
    setLanguage(browserLang);
  }, []);

  const translations = languages[language] || languages['en-US'];

  const t = (key: TranslationKey, substitutions?: Record<string, string>): string => {
    let translation = translations[key] || en[key] || key;
    if (substitutions) {
      Object.entries(substitutions).forEach(([subKey, subValue]) => {
        translation = translation.replace(`{{${subKey}}}`, subValue);
      });
    }
    return translation;
  };
  
  const value = {
    translations,
    language,
    setLanguage,
    t,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
