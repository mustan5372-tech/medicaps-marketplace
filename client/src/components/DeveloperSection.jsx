import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiGithub, FiMail, FiCode, FiUsers } from 'react-icons/fi'
import { useParallax } from '../hooks/useParallax'

const team = [
  {
    initial: 'M',
    gradient: 'from-blue-500 via-indigo-500 to-purple-600',
    shadow: 'shadow-blue-500/30',
    badge: 'Founder & Developer',
    badgeColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    name: 'Mustansir Sanawadwala',
    dept: 'Automobile Engineering (EV)',
    uni: 'MediCaps University, Indore',
    desc: 'Founder & Developer of MediCaps Marketplace, focused on building a seamless and secure platform for students to buy and sell within campus.',
    links: [
      {
        label: 'GitHub',
        icon: 'github',
        href: 'https://github.com/mustan5372-tech',
        style: 'bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white shadow-md',
      },
      {
        label: 'Get in Touch',
        icon: 'mail',
        href: 'mailto:mustansirsanawad@gmail.com',
        style: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/25 hover:shadow-blue-500/40',
      },
    ],
  },
  {
    initial: 'P',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    shadow: 'shadow-emerald-500/30',
    badge: 'Co-Founder',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    name: 'Purandar Yadav',
    dept: 'Automobile Engineering (EV)',
    uni: 'MediCaps University, Indore',
    desc: 'Co-Founder of MediCaps Marketplace, contributing to product development and growth strategy to make campus commerce effortless for every student.',
    links: [
      {
        label: 'Get in Touch',
        icon: 'mail',
        href: 'mailto:purandarydv23@gmail.com',
        style: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40',
      },
    ],
  },
]

function TeamCard({ member, delay, inView }) {
  const { ref: parallaxRef, y } = useParallax(0.12, [-20, 20])
  return (
    <motion.div
      ref={parallaxRef}
      style={{ y }}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, boxShadow: '0 32px 64px rgba(0,0,0,0.13)' }}
      className="relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-7 flex flex-col items-center text-center shadow-lg overflow-hidden transition-shadow duration-300"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 via-transparent to-gray-50/40 dark:from-gray-800/30 dark:via-transparent dark:to-gray-800/10 pointer-events-none" />

      {/* Avatar */}
      <motion.div
        initial={{ scale: 0.75, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ delay: delay + 0.1, duration: 0.4, type: 'spring', stiffness: 220 }}
        className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center shadow-xl ${member.shadow} mb-4`}
      >
        <span className="text-white text-3xl font-extrabold">{member.initial}</span>
      </motion.div>

      {/* Badge */}
      <span className={`text-xs font-semibold px-3 py-1 rounded-full border mb-3 ${member.badgeColor}`}>
        {member.badge}
      </span>

      {/* Name */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">{member.name}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{member.dept}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{member.uni}</p>

      {/* Divider */}
      <div className={`w-10 h-0.5 bg-gradient-to-r ${member.gradient} rounded-full mb-4`} />

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 flex-1">
        {member.desc}
      </p>

      {/* Links */}
      <div className="flex items-center justify-center gap-2.5 flex-wrap w-full">
        {member.links.map(link => (
          <motion.a
            key={link.label}
            href={link.href}
            target={link.icon === 'github' ? '_blank' : undefined}
            rel={link.icon === 'github' ? 'noopener noreferrer' : undefined}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${link.style}`}
          >
            {link.icon === 'github' ? <FiGithub className="w-4 h-4" /> : <FiMail className="w-4 h-4" />}
            {link.label}
          </motion.a>
        ))}
      </div>
    </motion.div>
  )
}

function FounderCard({ member, delay, inView }) {
  const { ref: parallaxRef, y } = useParallax(0.12, [-20, 20])
  return (
    <motion.div
      ref={parallaxRef}
      style={{ y }}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, boxShadow: '0 0 40px rgba(99,102,241,0.22), 0 32px 64px rgba(0,0,0,0.15)' }}
      className="relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col shadow-xl overflow-hidden transition-all duration-300"
    >
      {/* Subtle top glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-indigo-50/40 dark:from-blue-900/10 dark:via-transparent dark:to-indigo-900/10 pointer-events-none z-0" />

      {/* Photo */}
      <div className="relative overflow-hidden rounded-t-3xl h-56 shrink-0">
        <img
          src="/founder.jpg"
          alt="Mustansir Sanawadwala"
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 hover:scale-105"
        />
        {/* Gradient overlay at bottom of photo */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-7 pb-7 pt-3 flex-1">
        {/* Badge */}
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border mb-3 ${member.badgeColor}`}>
          {member.badge}
        </span>

        {/* Name */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-0.5">{member.name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{member.dept}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{member.uni}</p>
        <p className="text-xs text-blue-500 dark:text-blue-400 font-medium mb-4 italic">Built for students, by a student.</p>

        {/* Divider */}
        <div className={`w-10 h-0.5 bg-gradient-to-r ${member.gradient} rounded-full mb-4`} />

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 flex-1">
          {member.desc}
        </p>

        {/* Links */}
        <div className="flex items-center justify-center gap-2.5 flex-wrap w-full">
          {member.links.map(link => (
            <motion.a
              key={link.label}
              href={link.href}
              target={link.icon === 'github' ? '_blank' : undefined}
              rel={link.icon === 'github' ? 'noopener noreferrer' : undefined}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${link.style}`}
            >
              {link.icon === 'github' ? <FiGithub className="w-4 h-4" /> : <FiMail className="w-4 h-4" />}
              {link.label}
            </motion.a>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function DeveloperSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center mb-3"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold border border-blue-100 dark:border-blue-800">
            <FiUsers className="w-3.5 h-3.5" />
            Meet the Team
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2"
        >
          The people behind MediCaps Market
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-sm text-center text-gray-500 dark:text-gray-400 mb-10"
        >
          Built by students, for students.
        </motion.p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
          {team.map((member, i) => i === 0
            ? <FounderCard key={member.name} member={member} delay={0.2} inView={inView} />
            : <TeamCard key={member.name} member={member} delay={0.32} inView={inView} />
          )}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8"
        >
          Built with ❤️ for MediCaps University students
        </motion.p>
      </div>
    </section>
  )
}
