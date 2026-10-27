import type { SVGProps } from 'react'

const paths = {
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-7 9a7 7 0 0 0 14 0M12 19v2.5M8.5 21.5h7',
  wave: 'M2 12h2M6 8v8M10 4v16M14 7v10M18 10v4M22 12h0',
  chip: 'M8 8h8v8H8zM5 5h14v14H5zM9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3',
  speaker: 'M4 9.5h3.5L12 5v14l-4.5-4.5H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11',
  download: 'M12 3v12M7 10.5l5 5 5-5M4 19.5h16',
  arrowRight: 'M4 12h15M14 7l5 5-5 5',
  arrowDown: 'M12 4v15M7 14l5 5 5-5',
  terminal: 'M3 4.5h18v15H3zM7 9.5l3 2.5-3 2.5M12.5 15h4.5',
  shield: 'M12 3 4.5 6v5.5c0 4.3 3.1 8.1 7.5 9.5 4.4-1.4 7.5-5.2 7.5-9.5V6z',
  lock: 'M6 10.5h12v10H6zM8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3M12 14.5v2.5',
  key: 'M14.5 9.5a4.5 4.5 0 1 1-1.3-3.2M13.2 12.8 21 20.5M17.5 17l2-2M15.5 15l1.5-1.5',
  drive: 'M3 13.5h18v6H3zM5.5 13.5 7.5 4.5h9l2 9M16.5 16.5h1.5',
  check: 'M4.5 12.5l5 5L19.5 7',
  x: 'M6 6l12 12M18 6 6 18',
  alert: 'M12 3.5 2.5 20h19zM12 10v4.5M12 17v.5',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12ZM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z',
  play: 'M7 4.5v15l12-7.5z',
  pause: 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  rotate: 'M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4.5H15',
  rotateLeft: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4v4.5H9',
  menu: 'M4 7h16M4 12h16M4 17h16',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9Z',
  file: 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6',
  calc: 'M6 3h12v18H6zM9 7h6M9 11.5h.01M12 11.5h.01M15 11.5h.01M9 15h.01M12 15h.01M15 15h.01M9 18h.01M12 18h3',
  brain: 'M9 4.5a3 3 0 0 0-3 3 3 3 0 0 0-1.5 5.5A3 3 0 0 0 8 18a2.5 2.5 0 0 0 4 1.5V5.5a2.5 2.5 0 0 0-3-1ZM15 4.5a3 3 0 0 1 3 3 3 3 0 0 1 1.5 5.5A3 3 0 0 1 16 18a2.5 2.5 0 0 1-4 1.5',
  wifiOff: 'M3 3l18 18M8.5 16a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 4-2.4M19 12.5a10 10 0 0 0-3.4-2.2M2 9a14.5 14.5 0 0 1 5-2.9M22 9a14.5 14.5 0 0 0-10.5-3.9M12 19.5h.01',
} as const

export type IconName = keyof typeof paths

export function Icon({ name, size = 20, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  )
}
