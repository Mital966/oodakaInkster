import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import Reveal from './Reveal'

function SectionHeading({ eyebrow, title, description, align = 'left', action, className }) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-6',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow && (
        <p className="font-mono text-[11px] uppercase tracking-wide3 text-ink-300">
          {eyebrow}
        </p>
      )}
      <div className={cn('flex flex-col gap-6', align === 'between' && 'lg:flex-row lg:items-end lg:justify-between')}>
        <h2 className="max-w-3xl font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-bone sm:text-4xl lg:text-[3.4rem]">
          {title}
        </h2>
        {action}
      </div>
      {description && (
        <p className={cn('max-w-xl text-[15px] leading-relaxed text-ink-300', align === 'center' && 'mx-auto')}>
          {description}
        </p>
      )}
    </Reveal>
  )
}

export default SectionHeading