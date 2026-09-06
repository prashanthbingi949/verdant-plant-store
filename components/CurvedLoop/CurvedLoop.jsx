import { useRef, useEffect, useState, useMemo, useId } from 'react';
import './CurvedLoop.css';

const CurvedLoop = ({
  marqueeText = '',
  speed = 2,
  className,
  curveAmount = 400,
  direction = 'left',
  interactive = true
}) => {
  const text = useMemo(() => {
    const hasTrailing = /\s|\u00A0$/.test(marqueeText);
    return (hasTrailing ? marqueeText.replace(/\s+$/, '') : marqueeText) + '\u00A0';
  }, [marqueeText]);

  const measureRef = useRef(null);
  const textPathRef = useRef(null);
  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(24);
  const uid = useId();
  const pathId = `curve-${uid}`;

  // Keep the curve visible inside the SVG bounds while retaining a clear,
  // natural wave instead of a deep U-shape.
  const amount = Math.max(14, Math.min(Math.abs(curveAmount), 28));
  const pathD = `M-120,72 C70,${72 - amount} 220,${72 + amount} 410,72 S750,${72 - amount} 940,72 S1280,${72 + amount} 1560,72`;

  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const dirRef = useRef(direction);
  const velRef = useRef(0);

  const totalText = spacing
    ? Array(Math.ceil(2400 / spacing) + 3)
        .fill(text)
        .join('')
    : text;
  const ready = spacing > 0;

  useEffect(() => {
    if (measureRef.current) {
      setSpacing(measureRef.current.getComputedTextLength());
    }
  }, [text, className]);

  useEffect(() => {
    if (!spacing || !textPathRef.current) return;
    const initial = 24;
    textPathRef.current.setAttribute('startOffset', `${initial}px`);
    setOffset(initial);
  }, [spacing]);

  useEffect(() => {
    if (!spacing || !ready) return;
    let frame = 0;

    const step = () => {
      if (!dragRef.current && textPathRef.current) {
        const delta = dirRef.current === 'right' ? speed : -speed;
        const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '24');
        let newOffset = currentOffset + delta;

        if (newOffset <= -spacing) newOffset += spacing;
        if (newOffset > spacing) newOffset -= spacing;

        textPathRef.current.setAttribute('startOffset', `${newOffset}px`);
        setOffset(newOffset);
      }

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [spacing, speed, ready]);

  const onPointerDown = (e) => {
    if (!interactive) return;
    dragRef.current = true;
    lastXRef.current = e.clientX;
    velRef.current = 0;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!interactive || !dragRef.current || !textPathRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velRef.current = dx;

    const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '24');
    let newOffset = currentOffset + dx;

    if (newOffset <= -spacing) newOffset += spacing;
    if (newOffset > spacing) newOffset -= spacing;

    textPathRef.current.setAttribute('startOffset', `${newOffset}px`);
    setOffset(newOffset);
  };

  const endDrag = () => {
    if (!interactive) return;
    dragRef.current = false;
    if (Math.abs(velRef.current) > 0.1) {
      dirRef.current = velRef.current > 0 ? 'right' : 'left';
    }
  };

  return (
    <div
      className="curved-loop-jacket"
      style={{ visibility: ready ? 'visible' : 'hidden', cursor: interactive ? 'grab' : 'default' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <svg className="curved-loop-svg" viewBox="0 0 1440 144" preserveAspectRatio="none" aria-hidden="true">
        <text
          ref={measureRef}
          xmlSpace="preserve"
          className={className}
          style={{ visibility: 'hidden', opacity: 0, pointerEvents: 'none' }}
        >
          {text}
        </text>
        <defs>
          <path id={pathId} d={pathD} fill="none" stroke="transparent" />
        </defs>
        {ready && (
          <text fontWeight="bold" xmlSpace="preserve" className={className}>
            <textPath ref={textPathRef} href={`#${pathId}`} startOffset={`${offset}px`} xmlSpace="preserve">
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
};

export default CurvedLoop;
