import { cn } from "@/lib/utils";

/**
 * EDIS wordmark path, inlined so the whole lockup is a single clickable
 * <a> with no Image wrappers that can swallow clicks.
 */
const WORDMARK_PATH =
  "M0 43.4854V86.9709H44.3208H88.6417V79.6064V72.242H52.0594H15.4771V61.3706V50.4992H47.8384H80.1996V43.1348V35.7703H47.8384H15.4771V25.2496V14.7289H52.0594H88.6417V7.36447V0H44.3208H0V43.4854ZM119.141 43.4854L119.118 86.9709H153.859C192.722 86.9709 195.508 86.7177 204.492 82.3734C214.125 77.7148 221.72 67.6612 224.068 56.4609C225.39 50.1513 225.388 37.5034 224.064 31.2113C221.709 20.0328 214.049 9.49526 204.727 4.61086C196.289 0.190778 194.497 0.0259498 154.732 0.0119222L119.165 0L119.141 43.4854ZM255.372 43.4854V86.9709H262.408H269.443V43.4854V0H262.408H255.372V43.4854ZM319.234 1.03734C306.267 4.59613 299.099 16.9222 301.776 31.0612C303.389 39.5886 308.014 45.1547 316.454 48.729C319.496 50.0174 321.856 50.1492 347.883 50.4859C373.834 50.8219 376.194 50.953 378.214 52.1727C381.358 54.0692 382.708 56.7618 382.704 61.1279C382.701 65.3705 381.104 68.6123 378.024 70.626C376.263 71.7769 373.772 71.9095 350.378 72.0897C324.806 72.2875 324.651 72.2798 321.502 70.687C318.838 69.3396 318.113 68.5036 316.929 65.4112L315.522 61.7367L308.214 61.729L300.907 61.7213L301.381 65.7479C302.65 76.5112 309.943 84.0672 321.173 86.2555C324.07 86.8201 333.767 86.9989 352.456 86.8334C379.041 86.5977 379.619 86.5627 383.721 84.9278C394.349 80.6943 399.927 68.7372 397.494 55.4089C395.911 46.7419 391.212 40.8153 383.466 37.7194C379.694 36.2114 378.447 36.1357 351.401 35.785C326.258 35.4582 323.019 35.2877 320.986 34.1803C317.994 32.5496 316.324 29.2243 316.376 24.9978C316.421 21.3317 317.688 19.0438 321.069 16.5259C322.932 15.1372 324.021 15.0719 348.264 14.879C372.289 14.6883 373.651 14.7465 376.257 16.0714C378.914 17.4229 381.3 20.9032 381.3 23.4267C381.3 24.3876 382.423 24.5482 389.129 24.5482H396.957L396.496 21.5674C395.29 13.7786 391.453 7.59102 385.512 3.85197C379.757 0.230055 377.493 -0.00491718 348.986 0.0624151C329.64 0.108706 321.667 0.369629 319.234 1.03734ZM194.975 16.9369C205.21 21.721 210.304 32.0593 209.438 46.291C208.826 56.3466 204.897 63.5519 197.67 67.871C191.147 71.7699 190.934 71.7952 161.63 72.0659L134.37 72.3177V43.4869V14.6553L162.686 14.8678L191.002 15.0796L194.975 16.9369Z";

interface EdisLogoProps {
  className?: string;
  /**
   * `lockup`   = raven (inline + animated) + EDIS wordmark.
   * `mark`     = raven only (inline — sparkles animate on hover).
   * `wordmark` = "EDIS" text only (static SVG image).
   */
  variant?: "lockup" | "mark" | "wordmark";
  size?: number;
}

export function EdisLogo({
  className,
  variant = "lockup",
  size = 22,
}: EdisLogoProps) {
  if (variant === "mark") {
    return <RavenMark size={size} className={className} />;
  }

  if (variant === "wordmark") {
    return <WordmarkText size={size} className={className} />;
  }

  // variant === "lockup": raven + wordmark side by side, inlined into one
  // span so the whole thing is a single contiguous click target (no <Image>
  // wrapper in between). `translateY` pulls the wordmark down so it optically
  // aligns with the raven's visual center — the raven's body sits lower than
  // its geometric center because the sparkles push the bbox up-left.
  const wordmarkSize = Math.round(size * 0.5);
  const wordmarkOffset = Math.max(1, Math.round(size * 0.12));
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <RavenMark size={size} />
      <WordmarkText
        size={wordmarkSize}
        style={{ transform: `translateY(${wordmarkOffset}px)` }}
      />
    </span>
  );
}

function WordmarkText({
  size,
  className,
  style,
}: {
  size: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const width = Math.round(size * (399 / 87));
  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 399 87"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block shrink-0 text-foreground", className)}
      style={style}
      aria-label="EDIS"
    >
      <path d={WORDMARK_PATH} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}

/**
 * Raven mark rendered inline so we can target the 3 sparkle shapes.
 *
 * Idle loop: the 3 sparkles blink in a staggered cascade once every ~3.6s
 * (most of the cycle is rest — the twinkle lives in the last ~1s). The
 * raven body stays steady. No scale, no glow on the body, no bg — respects
 * the EDIS design system and `prefers-reduced-motion`.
 */
function RavenMark({ size, className }: { size: number; className?: string }) {
  const width = Math.round(size * (160 / 172));
  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 160 172"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("edis-raven block shrink-0", className)}
      aria-hidden="true"
    >
      {/* Main raven body */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M149.647 79.1742L120.935 86.1342L116.15 94.8344L120.935 100.925L119.195 119.196L91.7886 150.953L102.665 166.614H114.845L119.195 171.833H99.6196L83.0884 150.953L85.2632 141.817L71.7778 150.953L81.3481 166.614H90.0493L93.9643 171.833H62.6421L67.4272 166.614H74.8227L62.6421 149.212L33.4956 171.833H16.9653L35.6714 149.212L97.0093 119.196L88.3091 96.5746L91.7886 117.021L23.9253 149.212L67.4272 94.8344L76.563 72.6488L113.105 64.3832L149.647 79.1742ZM100.332 77.434C98.7378 77.434 97.4448 78.727 97.4448 80.3217C97.445 81.9161 98.738 83.2084 100.332 83.2084C101.927 83.2084 103.22 81.9161 103.22 80.3217C103.22 78.727 101.927 77.434 100.332 77.434Z"
        fill="#00E573"
      />
      <path
        d="M85.2637 50.8973C46.0189 61.4131 42.1746 71.1866 41.8013 72.8387C41.765 72.9994 41.8017 73.1591 41.8953 73.2947C44.6685 77.3176 58.2604 77.7366 64.8177 77.4338L68.7329 69.6034L120.5 58.7279L123.111 65.2532C138.849 62.3023 145.526 55.2581 147.216 51.5425C147.384 51.1719 147.232 50.7569 146.869 50.5737C143.317 48.7827 123.937 40.5347 85.2637 50.8973Z"
        fill="#00E573"
      />
      <path
        d="M110.496 39.1519C97.9671 39.1519 77.1441 46.4023 68.2987 50.0275V18.2709H64.3835L57.8581 12.1806H49.1577L36.9771 2.61013L49.1577 5.65528L57.8581 2.61013L76.9991 0L90.4847 7.39537L110.496 39.1519Z"
        fill="#00E573"
      />

      {/* 3 sparkles — animated via ancestor .group/edis-logo:hover */}
      <path
        className="edis-raven__spark"
        data-edis-sparkle="lg"
        d="M21.4193 94.6811L26.0846 107.289L38.6922 111.954L26.0846 116.619L21.4193 129.227L16.7541 116.619L4.14642 111.954L16.7541 107.289L21.4193 94.6811Z"
        fill="#00E573"
      />
      <path
        className="edis-raven__spark"
        data-edis-sparkle="sm"
        d="M6.90917 73.9537L8.77527 78.9967L13.8183 80.8628L8.77527 82.7289L6.90917 87.772L5.04306 82.7289L0 80.8628L5.04306 78.9967L6.90917 73.9537Z"
        fill="#00E573"
      />
      <path
        className="edis-raven__spark"
        data-edis-sparkle="md"
        d="M40.0721 85.0083L41.9382 90.0514L46.9813 91.9175L41.9382 93.7836L40.0721 98.8266L38.206 93.7836L33.1629 91.9175L38.206 90.0514L40.0721 85.0083Z"
        fill="#00E573"
      />
    </svg>
  );
}
