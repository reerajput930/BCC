// Round lotus badge. Decorative: always shown next to the written name.
export default function LogoMark({ size = 48, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="24" cy="24" r="24" fill="#783d2f" />
      <circle cx="24" cy="24" r="21" fill="none" stroke="#b48c3c" strokeWidth="1" />
      <g
        fill="none"
        stroke="#faf7f0"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24 13.5 C26.6 17 26.6 24 24 28.5 C21.4 24 21.4 17 24 13.5 Z" />
        <path d="M23.4 28.5 C19.6 26.2 17.6 22.2 18.1 17.6 C20.6 19 22 20.6 22.5 22.6" />
        <path d="M24.6 28.5 C28.4 26.2 30.4 22.2 29.9 17.6 C27.4 19 26 20.6 25.5 22.6" />
        <path d="M24 29 C18.2 29.2 14 26.3 12 22.2 C15 21.6 18 22.6 20.2 24.6" />
        <path d="M24 29 C29.8 29.2 34 26.3 36 22.2 C33 21.6 30 22.6 27.8 24.6" />
      </g>
      <path d="M18.5 30.5 H29.5" stroke="#b48c3c" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
