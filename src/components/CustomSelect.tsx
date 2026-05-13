import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: (string | SelectOption)[];
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  onKeyDown,
  placeholder = "Seleccionar...",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      // Give time for animation to focus
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    return options.filter(o => {
      const label = typeof o === 'string' ? o : o.label;
      return label.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [options, searchTerm]);

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
  };

  const getLabel = (val: string) => {
    const opt = options.find(o => typeof o === 'string' ? o === val : o.value === val);
    if (!opt) return placeholder;
    return typeof opt === 'string' ? opt : opt.label;
  };

  return (
    <div className={`relative w-full ${isOpen ? 'z-[100]' : 'z-auto'}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isOpen) {
            setIsOpen(true);
            e.preventDefault();
          } else if (e.key === 'Escape') {
            setIsOpen(false);
          } else if (onKeyDown) {
            onKeyDown(e);
          }
        }}
        className={`modern-input text-left flex items-center justify-between transition-all duration-300
          ${isOpen ? 'ring-4 ring-primary/10 border-primary bg-[var(--surface)]' : ''}
          ${className}
        `}
      >
        <span className={`truncate mr-2 ${value ? 'text-[var(--on-surface)]' : 'text-[var(--on-surface-variant)] opacity-60'}`}>
          {getLabel(value)}
        </span>
        <ChevronDown 
          size={18} 
          className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-[var(--on-surface-variant)]'}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 12, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 z-[999] w-full bg-[var(--surface-card)]/95 backdrop-blur-3xl border border-[var(--outline)] rounded-[1.5rem] md:rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)] overflow-hidden"
          >
            {/* Search Input Area */}
            <div className="p-2 border-b border-[var(--outline)] bg-[var(--surface)]/50">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full bg-transparent border-none pl-9 pr-8 py-2 text-sm font-bold text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-variant)]/40"
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      // Logic could be added here for keyboard navigation
                    }
                  }}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] hover:text-primary transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[240px] overflow-y-auto custom-scrollbar pt-1 pb-2">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((o) => {
                  const optValue = typeof o === 'string' ? o : o.value;
                  const optLabel = typeof o === 'string' ? o : o.label;
                  const isSelected = value === optValue;
                  
                  return (
                    <button
                      key={optValue}
                      type="button"
                      onClick={() => handleSelect(optValue)}
                      className={`w-full px-6 py-3.5 text-left text-sm font-bold flex items-center justify-between transition-all
                        ${isSelected 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-primary/5 text-[var(--on-surface)]'}
                      `}
                    >
                      <span className="truncate">{optLabel}</span>
                      {isSelected && <Check size={16} />}
                    </button>
                  );
                })
              ) : (
                <div className="px-6 py-8 text-center text-[var(--on-surface-variant)] opacity-50 italic text-sm">
                  No se encontraron resultados
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

