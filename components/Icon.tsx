import React from 'react';

type IconName = string;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

const clean = (n: string) => n.replace(/^fa-?/, '').replace(/-/g, '_');

const Icon: React.FC<IconProps> = ({ name, className = '', ...rest }) => {
  const key = clean(name || 'circle');
  const spin = /fa_spin|fa-spin|spinner|fa-spinner/.test(name + ' ' + className);

  const common = {
    width: '1em',
    height: '1em',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: `${className} ${spin ? 'animate-spin' : ''}`.trim(),
    ...rest,
  } as any;

  const icons: Record<string, JSX.Element> = {
    times: <path d="M18 6L6 18M6 6l12 12" />,
    x: <path d="M18 6L6 18M6 6l12 12" />,
    star: <path d="M12 17.3L5.6 20l1.1-6.4L2 9.6l6.5-.9L12 3l3.5 5.7 6.5.9-4.7 3.9L18.4 20z" />,
    exclamation_circle: <><circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><path d="M12 16h.01" /></>,
    calendar_alt: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></>,
    share_nodes: <><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="M16 6l-4-3-4 3" /><path d="M12 3v10" /></>,
    kaaba: <><path d="M3 7l9-4 9 4v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M9 12h6v6H9z" /></>,
    calendar_day: <><path d="M3 7h18M16 3v4M8 3v4" /><rect x="3" y="7" width="18" height="14" rx="2" /></>,
    chevron_left: <path d="M15 6l-6 6 6 6" />,
    chevron_down: <path d="M6 9l6 6 6-6" />,
    book_quran: <><path d="M3 5h18v14H3z" /><path d="M7 5v14" /><path d="M14 9v6" /></>,
    book_open_reader: <path d="M2 7s4 1 10 1 10-1 10-1v12s-4-1-10-1S2 19 2 19V7z" />,
    eye: <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></>,
    spinner: <path d="M21 12a9 9 0 1 1-4.9-7.9" />, 
    arrow_trend_up: <><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7v6h6" /></>,
    arrow_trend_down: <><path d="M3 7l6 6 4-4 8 8" /><path d="M14 17v-6h6" /></>,
    minus: <path d="M5 12h14" />,
    check_circle: <><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></>,
    heart: <path d="M20.8 4.6c-1.5-1.4-3.9-1.4-5.4.1L12 8.1 8.6 4.7C7.1 3.3 4.7 3.3 3.2 4.7c-1.6 1.5-1.6 4 0 5.5L12 18l8.8-7.8c1.6-1.5 1.6-4 0-5.6z" />,
    headphones: <><path d="M3 18v-5a9 9 0 0 1 18 0v5" /><path d="M7 18v-5a5 5 0 0 1 10 0v5" /></>,
    person_praying: <><path d="M12 2v6" /><path d="M8 12h8" /><path d="M6 20h12" /></>,
    trash_can: <><path d="M3 6h18" /><path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" /><path d="M10 2h4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    cog: <><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 0 1 2.29 18.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82L3.3 5.71A2 2 0 0 1 6.13 2.88l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V5a2 2 0 0 1 4 0v.09c.3.12.58.29.83.5a1.65 1.65 0 0 0 1.82.33l.06-.06A2 2 0 0 1 21.7 5.1l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09c-.66 0-1.21.31-1.51 1z" /></>,
    file_export: <><path d="M14 2v6h6" /><path d="M21 15v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" /></>,
    file_import: <><path d="M10 14l4-4m0 0l-4-4m4 4H3" /><path d="M21 15v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    house_chimney: <path d="M3 11l9-7 9 7v8a1 1 0 0 1-1 1h-4v-6H8v6H4a1 1 0 0 1-1-1z" />, 
    chart_line: <><path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 6-6" /></>,
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
    sun: <><path d="M12 4V2M12 22v-2M4.22 4.22L2.81 2.81M21.19 21.19l-1.41-1.41M4.22 19.78L2.81 21.19M21.19 2.81l-1.41 1.41M20 12h2M2 12h2" /><circle cx="12" cy="12" r="3" /></>,
    default: <circle cx="12" cy="12" r="9" />,
  };

  const svg = icons[key] || icons.default;

  return (
    <svg {...common}>
      {svg}
    </svg>
  );
};

export default Icon;
