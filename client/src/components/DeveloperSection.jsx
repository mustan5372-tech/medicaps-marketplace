import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiGithub, FiMail, FiCode, FiZap } from 'react-icons/fi'

export default function DeveloperSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-2xl mx-auto"
      >
        {/* Label */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold border border-blue-100 dark:border-blue-800">
            <FiCode className="w-3.5 h-3.5" />
            Meet the Developer
          </div>
        </div>

        {/* Card */}
        <motion.div
          whileHover={{ y: -6, boxShadow: '0 32px 64px rgba(0,0,0,0.12)' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-lg overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-purple-50/60 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10 pointer-events-none" />

          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.4, type: 'spring', stiffness: 200 }}
            className="relative inline-block mb-5"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/30 mx-auto">
              <span className="text-white text-3xl font-extrabold">M</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
              <FiZap className="w-3 h-3 text-white" />
            </div>
          </motion.div>

          {/* Name */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-xl font-bold text-gray-900 dark:text-white mb-1"
          >
            Mustansir Sanawadwala
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1"
          >
            Automobile Engineering (EV) Student
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-xs text-gray-500 dark:text-gray-400 mb-5"
          >
            MediCaps University, Indore
          </motion.p>

          {/* Divider */}
          <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-5" />

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto mb-7"
          >
            Passionate about building real-world digital products. MediCaps Marketplace was created to simplify buying and selling within campus and solve everyday student needs through technology.
          </motion.p>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            <motion.a
              href="https://github.com/mustan5372-tech"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <FiGithub className="w-4 h-4" />
              GitHub
            </motion.a>

            <motion.a
              href="mailto:mustansirsanawad@gmail.com"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30"
            >
              <FiMail className="w-4 h-4" />
              Get in Touch
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-center text-xs text-gray-400 dark:text-gray-600 mt-5"
        >
          Built with ❤️ for MediCaps University students
        </motion.p>

        {/* Co-founder card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 px-6 py-5 flex items-center gap-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
            <span className="text-white text-xl font-extrabold">P</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Purandar Yadav</p>
              <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full font-medium">Co-Founder</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Automobile Engineering (EV) · MediCaps University</p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
