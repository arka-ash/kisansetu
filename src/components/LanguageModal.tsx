import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Check, X } from 'lucide-react';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, languages, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {t('select_language', 'Select Language')}
              </h3>
              <p className="text-xs text-slate-300">
                अपनी पसंदीदा भाषा चुनें / Choose your preferred language
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Grid / List */}
        <div className="p-4 max-h-[70vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  onClose();
                }}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 shadow-xs'
                    : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                  <div>
                    <div className="font-bold text-sm leading-tight text-slate-900">
                      {lang.nativeName}
                    </div>
                    <div className="text-xs text-slate-500">{lang.name}</div>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>KisanSetu Multi-Language Portal</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition cursor-pointer"
          >
            {t('close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
