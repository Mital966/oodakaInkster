import { Quote } from 'lucide-react'

function TestimonialCard({ review }) {
  return (
    <figure className="flex h-full flex-col justify-between border border-ink-700/50 bg-ink-800/30 p-7 transition-colors duration-300 hover:border-ink-600">
      <div>
        <Quote size={20} className="text-ink-500" aria-hidden="true" />
        <blockquote className="mt-5 text-[15px] leading-relaxed text-ink-100">
          “{review.review}”
        </blockquote>
      </div>
      <figcaption className="mt-7 flex items-center justify-between border-t border-ink-700/40 pt-5">
        <div>
          <p className="font-display text-sm font-bold text-bone">{review.client}</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide2 text-ink-400">
            {review.style}
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wide3 text-[#b3541e]" aria-label="5 star review">
          ★★★★★
        </span>
      </figcaption>
    </figure>
  )
}

export default TestimonialCard