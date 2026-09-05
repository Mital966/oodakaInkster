import { motion } from 'framer-motion'
import Seo from '../common/Seo'

// Wraps every public page: sets the document title/meta and provides a subtle
// page entrance/exit transition.
function Page({ title, description, children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <Seo title={title} description={description} />
      {children}
    </motion.div>
  )
}

export default Page