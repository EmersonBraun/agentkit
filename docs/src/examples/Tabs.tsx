import React, { useState, useRef, useCallback } from 'react';

const TABS = [
  {
    id: 'overview',
    label: 'Overview',
    content:
      'AgentKit provides a composable set of primitives for building interactive UI components. It emphasizes accessibility, keyboard navigation, and clean API design. Every component is built with progressive enhancement in mind.',
  },
  {
    id: 'features',
    label: 'Features',
    content:
      'Built-in ARIA support ensures components are screen-reader friendly out of the box. Smooth CSS animations deliver polished transitions without sacrificing performance. Keyboard navigation follows WAI-ARIA authoring practices.',
  },
  {
    id: 'api',
    label: 'API',
    content:
      'Components accept a minimal set of props and rely on sensible defaults. All interactive elements expose ref forwarding and standard HTML event handlers. Style overrides are supported through inline style props or className.',
  },
  {
    id: 'examples',
    label: 'Examples',
    content:
      'This Tabs component itself serves as a live example of the patterns AgentKit promotes. Combine it with other primitives such as Accordion or Modal to build complex layouts. Check the docs for copy-paste starter templates.',
  },
];

export function Tabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = (index + 1) % TABS.length;
        setActiveIndex(next);
        tabRefs.current[next]?.focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = (index - 1 + TABS.length) % TABS.length;
        setActiveIndex(prev);
        tabRefs.current[prev]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setActiveIndex(0);
        tabRefs.current[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        const last = TABS.length - 1;
        setActiveIndex(last);
        tabRefs.current[last]?.focus();
      }
    },
    [],
  );

  const containerStyle: React.CSSProperties = {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: 560,
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  };

  const tabListStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  };

  const indicatorStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    width: `${100 / TABS.length}%`,
    backgroundColor: '#6366f1',
    borderRadius: '2px 2px 0 0',
    transform: `translateX(${activeIndex * 100}%)`,
    transition: 'transform 240ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const panelStyle: React.CSSProperties = {
    padding: '20px 24px',
    minHeight: 96,
    backgroundColor: '#ffffff',
    color: '#334155',
    fontSize: 15,
    lineHeight: 1.65,
  };

  return (
    <div style={containerStyle}>
      <div role="tablist" aria-label="Component documentation" style={tabListStyle}>
        {TABS.map((tab, index) => {
          const isActive = index === activeIndex;
          const tabStyle: React.CSSProperties = {
            flex: 1,
            padding: '12px 8px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: isActive ? 600 : 400,
            color: isActive ? '#6366f1' : '#64748b',
            transition: 'color 180ms ease, background-color 180ms ease',
            outline: 'none',
            borderRadius: 0,
          };

          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              ref={(el) => { tabRefs.current[index] = el; }}
              style={tabStyle}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f1f5f9';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  'inset 0 0 0 2px #6366f1';
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              {tab.label}
            </button>
          );
        })}
        <span aria-hidden="true" style={indicatorStyle} />
      </div>

      {TABS.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={index !== activeIndex}
          style={panelStyle}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
