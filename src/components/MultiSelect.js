import React, { useState, useEffect, useRef, useId } from 'react';
import Icon from './Icon';

const MultiSelect = ({ label, options, selected, onChange, renderLabel = (o) => o, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const id = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const allSelected = options.length > 0 && selected.length === options.length;
  const toggleAll = () => onChange(allSelected ? [] : [...options]);
  const toggle = (val) => onChange(selected.includes(val) ? selected.filter(x => x !== val) : [...selected, val]);
  const summary = allSelected ? 'All' : selected.length === 0 ? 'None'
    : selected.length <= 2 ? selected.map(renderLabel).join(', ') : `${selected.length} selected`;

  return (
    <div className={`field select ${className}`} ref={ref}>
      <span className="field-label" id={`${id}-label`}>{label}</span>
      <button type="button" className="select-btn" aria-haspopup="listbox" aria-expanded={open}
        aria-labelledby={`${id}-label`} onClick={() => setOpen(o => !o)}>
        <span>{summary}</span>
        <Icon name="chevron" />
      </button>
      {open && (
        <div className="select-menu" role="listbox" aria-multiselectable="true" aria-labelledby={`${id}-label`}>
          <label className="select-option all">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} /> Select all
          </label>
          {options.map(opt => (
            <label key={opt} className="select-option">
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
              {renderLabel(opt) || 'Uncategorised'}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
