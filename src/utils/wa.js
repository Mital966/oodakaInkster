import { SITE } from '../config/site'

// Builds a wa.me link with an optional pre-filled message.
// The number lives in src/config/site.js so it can be changed in one place.
export function buildWhatsAppLink(prefill = '') {
  const base = `https://wa.me/${SITE.whatsappNumber}`
  return prefill ? `${base}?text=${encodeURIComponent(prefill)}` : base
}

// Ready-to-send enquiry message for the contact page.
export function whatsAppEnquiry(data = {}) {
  const lines = [
    fmt('Name', data.name),
    fmt('Tattoo Idea', data.idea),
    fmt('Style', data.style),
    fmt('Placement', data.placement),
    fmt('Approx. Size', data.size),
    fmt('Preferred Date', data.preferredDate),
    fmt('Budget', data.budget),
  ].filter(Boolean)
  return `Hi Oddaka Inksters,\n\nI'd like to book a consultation.\n\n${lines.join('\n')}`
  function fmt(label, value) {
    return value ? `${label}: ${value}` : ''
  }
}