import { motion } from 'framer-motion'
import { useListingStore } from '../store/listingStore'

const CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Vehicles', 'Clothing', 'Sports', 'Others']
const CONDITIONS = ['New', 'Like New', 'Used']

export default function FilterSidebar({ onClose }) {
  const { filters, setFilters, fetchListings } = useListingStore()

  const apply = () => { fetchListings(); onClose?.() }
  const reset = () => { setFilters({ category: '', condition: '', minPrice: '', maxPrice: '' }); fetchListings(); onClose?.() }

  return (
    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-6">
      <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>

      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</p>
        <div className="space-y-1">
          {CATEGORIES.map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="category" value={cat} checked={filters.category === cat}
                onChange={e => setFilters({ category: e.target.value })}
                className="accent-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{cat}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="category" value="" checked={filters.category === ''}
              onChange={() => setFilters({ category: '' })} className="accent-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">All</span>
          </label>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Condition</p>
        <div className="space-y-1">
          {CONDITIONS.map(c => (
            <label key={c} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="condition" value={c} checked={filters.condition === c}
                onChange={e => setFilters({ condition: e.target.value })} className="accent-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{c}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="condition" value="" checked={filters.condition === ''}
              onChange={() => setFilters({ condition: '' })} className="accent-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">All</span>
          </label>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range (₹)</p>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.minPrice}
            onChange={e => setFilters({ minPrice: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
          <input type="number" placeholder="Max" value={filters.maxPrice}
            onChange={e => setFilters({ maxPrice: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</p>
        <select value={filters.sort} onChange={e => setFilters({ sort: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
          <option value="latest">Latest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button onClick={apply} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition">Apply</button>
        <button onClick={reset} className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition">Reset</button>
      </div>
    </motion.div>
  )
}
