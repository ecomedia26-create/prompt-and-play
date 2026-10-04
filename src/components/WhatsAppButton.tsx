import { BRAND, waLink } from '../lib/brand'
import { useSound } from '../lib/sound'
import { MagneticButton } from './MagneticButton'
import { WhatsAppIcon } from './WhatsAppIcon'

interface Props {
  label?: string
  message?: string
  size?: 'sm' | 'lg'
  className?: string
}

// כפתור ההמרה הראשי: ירוק וואטסאפ זוהר עם פולס
export function WhatsAppButton({ label = 'דברו עם אקו מדיה בוואטסאפ', message, size = 'lg', className = '' }: Props) {
  const { play } = useSound()
  const sz = size === 'lg' ? 'px-7 py-4 text-lg' : 'px-4 py-2 text-sm'
  return (
    <MagneticButton
      href={waLink(message)}
      target="_blank"
      onClick={() => play('click')}
      className={`inline-flex items-center gap-2 rounded-full bg-wa font-bold text-void shadow-glow-wa animate-wa-pulse transition-colors hover:bg-[#2fe676] ${sz} ${className}`}
    >
      <WhatsAppIcon className={size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} />
      <span>{label}</span>
      {size === 'lg' && (
        <span dir="ltr" className="hidden rounded-full bg-void/15 px-2 py-0.5 text-sm font-semibold sm:inline">
          {BRAND.phoneDisplay}
        </span>
      )}
    </MagneticButton>
  )
}
