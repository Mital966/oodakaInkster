import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

const SIZES = {
  sm: 'text-[11px] px-5 py-2.5',
  md: 'text-xs px-7 py-3.5',
  lg: 'text-[13px] px-9 py-4',
}

const VARIANTS = {
  primary: 'bg-bone text-ink-950 hover:bg-ink-100',
  outline: 'border border-bone/25 text-bone hover:border-bone/60 hover:bg-bone/[0.03]',
  ghost: 'text-bone hover:text-ink-200',
  dark: 'bg-ink-950 text-bone hover:bg-ink-800',
  accent: 'border border-bone text-bone hover:bg-bone hover:text-ink-950',
}

const stagger = {
  whileTap: { scale: 0.97 },
  transition: { duration: 0.15 },
}

// Polymorphic button: renders a <Link> when `to` is set, an <a> when `href`
// is set, and a plain <button> (or motion.button) otherwise.
const Button = forwardRef(function Button(
  { to, href, onClick, type = 'button', size = 'md', variant = 'primary', className, children, ...rest },
  ref,
) {
  const classes = cn(
    'group inline-flex items-center justify-center gap-2.5 font-display font-semibold uppercase tracking-wide2 whitespace-nowrap transition-colors duration-300 focus-visible:outline-offset-4 disabled:opacity-40',
    SIZES[size],
    VARIANTS[variant],
    className,
  )

  if (to) {
    return (
      <Link to={to} ref={ref} className={classes} {...rest}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} ref={ref} className={classes} onClick={onClick} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      whileHover={{ y: -1 }}
      {...stagger}
      {...rest}
      className={classes}
    >
      {children}
    </motion.button>
  )
})

export default Button