// Google Analytics 4 utility
const GA_ID = import.meta.env.VITE_GA_ID || 'G-XXXXXXXXXX'

// Track page view
export function trackPageView(path) {
  if (typeof window.gtag !== 'function') return
  window.gtag('config', GA_ID, { page_path: path })
}

// Track custom event
export function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params)
}

// Predefined events
export const analytics = {
  viewListing: (listingId, title, price) =>
    trackEvent('view_listing', { listing_id: listingId, listing_title: title, price }),

  startChat: (listingId, sellerId) =>
    trackEvent('start_chat', { listing_id: listingId, seller_id: sellerId }),

  postListing: (category, price) =>
    trackEvent('post_listing', { category, price }),

  register: () => trackEvent('sign_up', { method: 'email' }),

  login: () => trackEvent('login', { method: 'email' }),

  saveListing: (listingId) =>
    trackEvent('save_listing', { listing_id: listingId }),

  search: (query) =>
    trackEvent('search', { search_term: query }),
}
