import { motion } from 'framer-motion'

export default function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
    >
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-24 skeleton rounded-lg" />
        <div className="h-4 w-3/4 skeleton rounded-lg" />
        <div className="h-3 w-full skeleton rounded-lg" />
        <div className="h-3 w-2/3 skeleton rounded-lg" />
        <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="h-3 w-20 skeleton rounded-lg" />
          <div className="h-3 w-16 skeleton rounded-lg" />
        </div>
      </div>
    </motion.div>
  )
}
