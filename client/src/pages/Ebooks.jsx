import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../utils/api"

export default function Ebooks() {
  const [ebooks, setEbooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/ebooks").then(r => setEbooks(r.data.ebooks || [])).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center pt-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📚 MST Ebook Library</h1>
      {ebooks.length === 0 ? <p className="text-gray-500">No ebooks yet.</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ebooks.map(e => (
            <div key={e._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col gap-3">
              {e.isImportant && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full w-fit">🔥 Important</span>}
              <p className="font-semibold text-gray-900 dark:text-white">{e.title}</p>
              <p className="text-xs text-gray-500">{e.subject} · {e.branch} · Sem {e.semester}</p>
              <Link to={"/reader/" + e._id} className="mt-auto text-center py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium">
                Read Now
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}