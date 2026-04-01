import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useListingStore } from '../store/listingStore'
import { FiChevronDown, FiSliders } from 'react-icons/fi'

const CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Vehicles', 'Clothing', 'Sports', 'Others']
const CONDITIONS = ['New', 'Like New', 'Used']

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between mb-3 group">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">{title}</span>
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <FiChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <motion.button type="button" onClick={onChange} whileTap={{ scale: 0.9 }}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
      <motion.div animate={{ x: checked ? 16 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
    </motion.button>
  )
}

export default function FilterSidebar({ onClose }) {
  const { filters, setFilters, fetchListings } = useListingStore()

  const apply = () => { fetchListings(); onClose?.() }
  const reset = () => { setFilters({ category: '', condition: '', minPrice: '', maxPrice: '', sort: 'latest' }); fetchListings(); onClose?.() }

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FiSliders className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Filters</h3>
        </div>
        <button onClick={reset} className="text-xs text-blue-600 hover:underline">Reset all</button>
      </div>

      <Section title="Category">
        <div className="space-y-2">
          {['All', ...CATEGORIES].map(cat => {
            const active = cat === 'All' ? !filters.category : filters.category === cat
            return (
              <motion.button key={cat} whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
                onClick={() => setFilters({ category: cat === 'All' ? '' : cat })}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${active ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <span>{cat}</span>
                {active && <motion.div layoutId="cat-indicator" className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
              </motion.button>
            )
          })}
        </div>
      </Section>

      <Section title="Condition">
        <div className="space-y-2.5">
          {CONDITIONS.map(c => (
            <label key={c} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-600 dark:text-gray-400">{c}</span>
              <Toggle checked={filters.condition === c} onChange={() => setFilters({ condition: filters.condition === c ? '' : c })} />
            </label>
          ))}
        </div>
      </Section>

      <Section title="Price Range (₹)">
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.minPrice}
            onChange={e => setFilters({ minPrice: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
          <input type="number" placeholder="Max" value={filters.maxPrice}
            onChange={e => setFilters({ maxPrice: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
        </div>
      </Section>

      <Section title="Sort By">
        <div className="space-y-2">
          {[['latest', 'Latest First'], ['price_asc', 'Price: Low → High'], ['price_desc', 'Price: High → Low']].map(([val, label]) => (
            <motion.button key={val} whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
              onClick={() => setFilters({ sort: val })}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${filters.sort === val ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <span>{label}</span>
              {filters.sort === val && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
            </motion.button>
          ))}
        </div>
      </Section>

      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={apply}
        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all mt-2">
        Apply Filters
      </motion.button>
    </motion.div>
  )
}
