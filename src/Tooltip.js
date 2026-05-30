import React, { useState, useRef, useEffect } from 'react';

export default function Tooltip({ text }) {
  const [visible, setVisible] = useState(false);
  const [style, setStyle] = useState({});
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
      const bubbleWidth = 280;
      const spaceRight = window.innerWidth - rect.left;
      const spaceLeft  = rect.right;

      let left, transform;
      if (spaceRight < bubbleWidth / 2 + 20) {
        // Near right edge — align right
        left = rect.right;
        transform = 'translate(-100%, -100%) translateY(-8px)';
      } else if (spaceLeft < bubbleWidth / 2 + 20) {
        // Near left edge — align left
        left = rect.left;
        transform = 'translate(0%, -100%) translateY(-8px)';
      } else {
        // Centre align (default)
        left = rect.left + rect.width / 2;
        transform = 'translate(-50%, -100%) translateY(-8px)';
      }

      setStyle({
        position: 'fixed',
        top: rect.top + window.scrollY,
        left,
        transform,
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
        <span className="tt-bubble" style={style}>{text}</span>
      )}
    </span>
  );
}
