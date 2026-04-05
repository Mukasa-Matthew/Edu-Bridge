/** Official lockup in `frontend/public/` (JPEG includes its own dark panel + wordmark). */
const LOGO_SRC = encodeURI('/WhatsApp Image 2026-03-11 at 12.21.14 PM.jpeg')

/** Tuned so the file’s dark frame reads closer to site `navy` (#1E3A5F) and stays crisp. */
const IMG_TUNE =
  'rounded-md object-contain object-center brightness-[1.12] contrast-[0.94] saturate-[1.06]'

const SIZE_CLASSES = {
  /** Dashboard sidebar */
  compact:
    'h-12 w-auto min-h-[3rem] max-w-[280px] sm:h-14 sm:min-h-[3.5rem] sm:max-w-[310px]',
  /** Main header, footer, register bar */
  default:
    'h-14 w-auto min-h-[3.5rem] max-w-[320px] sm:h-[4.25rem] sm:min-h-[4.25rem] sm:max-w-[380px] md:h-[4.75rem] md:min-h-[4.75rem] md:max-w-[420px] lg:h-20 lg:min-h-20 lg:max-w-[460px]',
  /** Login / marketing hero column */
  hero:
    'h-20 w-auto min-h-20 max-w-[340px] sm:h-24 sm:min-h-24 sm:max-w-[400px] md:h-28 md:min-h-28 md:max-w-[460px] lg:h-32 lg:min-h-32 lg:max-w-[520px] xl:h-36 xl:min-h-36 xl:max-w-[560px]',
}

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {string} [props.imgClassName]
 * @param {boolean} [props.onLightBackground]
 * @param {'compact'|'default'|'hero'} [props.size]
 * @param {boolean} [props.noInnerPanel] On full `bg-navy` panels (e.g. login column): ring only, no extra navy box.
 */
export default function BrandLogo({
  className = '',
  imgClassName = '',
  onLightBackground = false,
  size = 'default',
  noInnerPanel = false,
}) {
  const sizeCls = SIZE_CLASSES[size] || SIZE_CLASSES.default

  let wrap
  if (onLightBackground) {
    wrap = 'rounded-2xl shadow-lg ring-1 ring-black/[0.08] overflow-hidden'
  } else if (noInnerPanel) {
    wrap = 'rounded-2xl p-1 ring-1 ring-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]'
  } else {
    /* Same hex as `bg-navy` so the asset sits in a seamless chip on the header/footer */
    wrap =
      'rounded-2xl bg-[#1E3A5F] p-2.5 sm:p-3 ring-1 ring-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
  }

  return (
    <span className={`inline-flex shrink-0 items-center ${wrap} ${className}`}>
      <img
        src={LOGO_SRC}
        alt="EduBridge logo — open book over a bridge arc"
        className={`${IMG_TUNE} ${sizeCls} ${imgClassName}`}
        width={560}
        height={140}
        decoding="async"
      />
    </span>
  )
}
