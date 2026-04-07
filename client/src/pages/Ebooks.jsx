import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBook, FiPlus, FiClock, FiCheckCircle, FiDownload, FiEye, FiX, FiAlertCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'
import AnimatedPage from '../components/AnimatedPage'

const FREE_LIMIT = 3

// ── Request Form Modal ──────────────────────────────────────────────────────
function RequestModal({ onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ bookName: '', subject: '', author: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.bookName.trim() || !form.subject.trim()) return toast.error('Book name and subject are required')
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FiBook className="text-blue-400" /> Request an Ebook
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Book Name *</label>
            <input
              value={form.bookName}
              onChange={e => set('bookName', e.target.value)}
              placeholder="e.g. Anatomy of Gray"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Subject *</label>
            <input
              value={form.subject}
              onChange={e => set('subject', e.target.value)}
              placeholder="e.g. Anatomy, Pharmacology"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Author <span className="text-white/30">(optional)</span></label>
            <input
              value={form.author}
              onChange={e => set('author', e.target.value)}
              placeholder="e.g. Henry Gray"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

// ── Payment Confirmation Modal ──────────────────────────────────────────────
function PaymentModal({ form, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl text-center"
      >
        <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
          <FiBook className="text-blue-400" size={24} />
        </div>
        <h2 className="text-lg font-semibold text-white mb-1">Confirm Request</h2>
        <p className="text-white/50 text-sm mb-4">You're about to request:</p>
        <div className="bg-white/5 rounded-xl p-3 mb-5 text-left">
          <p className="text-white font-medium">{form.bookName}</p>
          <p className="text-white/50 text-sm">{form.subject}{form.author ? ` · ${form.author}` : ''}</p>
        </div>
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-white/50 text-sm">Payment:</span>
          <span className="text-2xl font-bold text-green-400">₹2</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm & Pay'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Request Card ────────────────────────────────────────────────────────────
function RequestCard({ req, isOwn }) {
  const isFulfilled = req.status === 'fulfilled'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{req.bookName}</p>
          <p className="text-sm text-white/50 mt-0.5">{req.subject}{req.author ? ` · ${req.author}` : ''}</p>
          {req.requestedBy?.name && (
            <p className="text-xs text-white/30 mt-1">by {req.requestedBy.name}</p>
          )}
          <p className="text-xs text-white/30 mt-1 flex items-center gap-1">
            <FiClock size={11} />
            {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
          </p>
        </div>
        <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
          isFulfilled
            ? 'bg-green-500/20 text-green-400 border border-green-500/20'
            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
        }`}>
          {isFulfilled ? <FiCheckCircle size={11} /> : <FiClock size={11} />}
          {isFulfilled ? 'Fulfilled' : 'Pending'}
        </span>
      </div>
      {isFulfilled && isOwn && req.ebookUrl && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
          <a
            href={req.ebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm transition-all"
          >
            <FiEye size={14} /> View PDF
          </a>
          <a
            href={req.ebookUrl}
            download
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-all"
          >
            <FiDownload size={14} /> Download
          </a>
        </div>
      )}
    </motion.div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function Ebooks() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState([])
  const [userRequests, setUserRequests] = useState([])
  const [freeLeft, setFreeLeft] = useState(FREE_LIMIT)
  const [tab, setTab] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [pendingForm, setPendingForm] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const load = useCallback(async () => {
    setFetching(true)
    try {
      const [allRes, userRes] = await Promise.all([
        api.get('/ebooks'),
        api.get('/ebooks/user'),
      ])
      setRequests(allRes.data.requests)
      setUserRequests(userRes.data.requests)
      setFreeLeft(userRes.data.freeLeft)
    } catch {}
    setFetching(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleFormSubmit = async (form) => {
    if (freeLeft > 0) {
      // Free request
      setLoading(true)
      try {
        await api.post('/ebooks/request', form)
        toast.success('Request submitted 🎉')
        setShowForm(false)
        load()
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to submit')
      }
      setLoading(false)
    } else {
      // Paid — show payment modal
      setShowForm(false)
      setPendingForm(form)
    }
  }

  const handlePayment = async () => {
    setLoading(true)
    try {
      const orderRes = await api.post('/ebooks/create-order')
      const { orderId, amount, currency, keyId } = orderRes.data

      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: 'MediCaps Marketplace',
        description: `Ebook Request: ${pendingForm.bookName}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            await api.post('/ebooks/verify-payment', {
              ...response,
              ...pendingForm,
            })
            toast.success('Request submitted 🎉')
            setPendingForm(null)
            load()
          } catch {
            toast.error('Payment verification failed ❌')
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#3b82f6' },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled')
            setLoading(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => {
        toast.error('Payment failed ❌ Try again')
        setLoading(false)
      })
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment')
      setLoading(false)
    }
    setLoading(false)
  }

  const displayList = tab === 'mine' ? userRequests : requests

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gray-950 pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm mb-4"
            >
              <FiBook size={14} /> Ebook Library
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-3xl font-bold text-white mb-2"
            >
              📚 Find Any Ebook in MediCaps
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-white/50 mb-6"
            >
              Request any book and get it quickly
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all hover:scale-105 active:scale-95"
              >
                <FiPlus size={18} /> Request Ebook
              </button>
              <div className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl border ${
                freeLeft > 0
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
              }`}>
                {freeLeft > 0
                  ? <><FiCheckCircle size={14} /> {freeLeft} free request{freeLeft !== 1 ? 's' : ''} left</>
                  : <><FiAlertCircle size={14} /> Next request costs ₹2</>
                }
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {['all', 'mine'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tab === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {t === 'all' ? 'All Requests' : 'My Requests'}
              </button>
            ))}
          </div>

          {/* List */}
          {fetching ? (
            <div className="flex justify-center py-16">
              <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayList.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <FiBook size={40} className="mx-auto mb-3 opacity-30" />
              <p>{tab === 'mine' ? 'No requests yet. Request your first ebook!' : 'No requests yet. Be the first!'}</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {displayList.map(req => (
                <RequestCard key={req._id} req={req} isOwn={tab === 'mine' || req.requestedBy?._id === user?._id} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <RequestModal
            onClose={() => setShowForm(false)}
            onSubmit={handleFormSubmit}
            loading={loading}
          />
        )}
        {pendingForm && (
          <PaymentModal
            form={pendingForm}
            onConfirm={handlePayment}
            onCancel={() => setPendingForm(null)}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </AnimatedPage>
  )
}
