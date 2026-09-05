import { motion } from 'framer-motion'
import { Maximize, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from '../../utils/cn'

// Polished self-contained video player with custom controls.
// `poster` is shown before playback starts (posters keep the page light).
function VideoCard({ src, poster, title }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(true)

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play()
    else v.pause()
  }

  const scrub = (e) => {
    const v = videoRef.current
    if (!v || !v.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    v.currentTime = ratio * v.duration
    setProgress(ratio)
  }

  const fmt = (t) => {
    if (!Number.isFinite(t)) return '0:00'
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <div
      className="group relative aspect-video w-full overflow-hidden rounded-sm bg-ink-900"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop
        playsInline
        preload="metadata"
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() => {
          const v = videoRef.current
          if (v?.duration) setProgress(v.currentTime / v.duration)
        }}
        className="h-full w-full object-cover"
        aria-label={title || 'Tattoo process video'}
      />

      {/* poster overlay label */}
      {!playing && (
        <div className="pointer-events-none absolute left-5 top-5">
          <span className="font-mono text-[10px] uppercase tracking-wide3 text-ink-200">Watch the process</span>
        </div>
      )}

      {/* center play */}
      {!playing && (
        <button
          onClick={toggle}
          aria-label="Play video"
          className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-bone/40 bg-ink-950/50 text-bone backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-bone"
        >
          <Play size={20} fill="currentColor" className="ml-0.5" />
        </button>
      )}

      {/* controls */}
      <motion.div
        className={cn(
          'absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-ink-950/90 to-transparent px-4 pb-3 pt-8',
          playing && 'opacity-0 transition-opacity duration-300 group-hover:opacity-100',
        )}
        animate={{ y: showControls ? 0 : 8 }}
      >
        <button onClick={toggle} aria-label={playing ? 'Pause video' : 'Play video'} className="text-bone hover:text-ink-200">
          {playing ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
        </button>
        <button onClick={() => { const v = videoRef.current; if (v) { v.muted = !v.muted; setMuted(v.muted) } }} aria-label={muted ? 'Unmute' : 'Mute'} className="text-bone hover:text-ink-200">
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <button
          onClick={() => {
            const v = videoRef.current
            if (v) v.requestFullscreen?.()
          }}
          aria-label="Fullscreen"
          className="text-bone hover:text-ink-200"
        >
          <Maximize size={15} />
        </button>
        <div className="relative h-4 flex-1 cursor-pointer" onClick={scrub} role="slider" aria-label="Seek" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} tabIndex={0} onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { const v = videoRef.current; if (v) v.currentTime = Math.min(v.duration, v.currentTime + 5) }
          if (e.key === 'ArrowLeft') { const v = videoRef.current; if (v) v.currentTime = Math.max(0, v.currentTime - 5) }
        }}>
          <div className="absolute inset-y-1/2 h-0.5 w-full -translate-y-1/2 bg-ink-600/70" />
          <div className="absolute inset-y-1/2 h-0.5 -translate-y-1/2 bg-bone" style={{ width: `${progress * 100}%` }} />
          <div className="absolute inset-y-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-bone" style={{ left: `calc(${progress * 100}% - 6px)` }} />
        </div>
        <span className="shrink-0 font-mono text-[10px] tabular-nums text-ink-200">
          {fmt(videoRef.current?.currentTime || 0)} / {fmt(videoRef.current?.duration || 0)}
        </span>
      </motion.div>
    </div>
  )
}

export default VideoCard