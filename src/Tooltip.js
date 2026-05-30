import React, { useState, useRef, useEffect } from 'react';

export default function Tooltip({ text }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setVisible(false);
      }
    }
    if (visible) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [visible]);

  function showTooltip() {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({
        top: rect.top + window.scrollY - 8,
        left: rect.left + rect.width / 2,
      });
    }
    setVisible(true);
  }

  return (
    <span className="tt-wrap" ref={ref}
      onMouseEnter={showTooltip}
      onMouseLeave={() => setVisible(false)}
      onClick={e => { e.stopPropagation(); visible ? setVisible(false) : showTooltip(); }}>
      <span className="tt-trigger">?</span>
      {visible && (
        <span className="tt-bubble" style={{ position: 'fixed', top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}>
          {text}
        </span>
      )}
    </span>
  );
}
