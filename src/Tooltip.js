import React, { useState, useRef, useEffect } from 'react';

export default function Tooltip({ text }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  // Close on outside tap (mobile)
  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setVisible(false);
      }
    }
    if (visible) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [visible]);

  return (
    <span className="tt-wrap" ref={ref}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={e => { e.stopPropagation(); setVisible(v => !v); }}>
      <span className="tt-trigger">?</span>
      {visible && <span className="tt-bubble">{text}</span>}
    </span>
  );
}
