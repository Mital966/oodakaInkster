export const DEFAULT_SETTINGS = {
  business: {
    name: 'ODDAKA INKSTERS',
    tagline: 'Premium Tattoo Studio',
    logo: '',
    aboutText:
      'A premium tattoo studio built on craft, honesty and work that ages well. Custom designs, drawn by hand, made to last.',
  },
  contact: {
    whatsapp: '',
    phone: '',
    email: '',
    address: '',
    mapsUrl: '',
  },
  hours: {
    monday: { open: '10:30', close: '21:00', closed: false },
    tuesday: { open: '10:30', close: '21:00', closed: false },
    wednesday: { open: '10:30', close: '21:00', closed: false },
    thursday: { open: '10:30', close: '21:00', closed: false },
    friday: { open: '10:30', close: '21:00', closed: false },
    saturday: { open: '10:30', close: '21:00', closed: false },
    sunday: { open: '10:30', close: '21:00', closed: false },
  },
  social: {
    instagram: 'oddakainksters',
    instagramUrl: '',
    facebook: '',
    youtube: '',
  },
  homepage: {
    hero: {
      heading: 'YOUR STORY.\nPERMANENTLY INKED.',
      subheading:
        'Custom tattoos · Fine line · Realism · Blackwork · Cover-ups. Designed around you, drawn by hand, made to last.',
      ctaPrimary: 'Book a Consultation',
      ctaSecondary: 'Explore Our Work',
    },
    featured: {
      heading: 'Drawn to live on skin.',
      description:
        'A selection of recent pieces from the studio — every one drawn for a specific person, placement and story.',
    },
    studio: {
      heading: 'Precision, not promises.',
      description:
        'Any studio can claim experience. These are the standards we hold every session to — no exceptions.',
    },
    cta: {
      heading: 'Ready to get inked?',
      description: "Tell us your idea. We'll help turn it into something permanent.",
      buttonLabel: 'Start Your Tattoo',
    },
    occasion: {
      enabled: false,
      title: '',
      subtitle: '',
      image: '',
      accentColor: '#e07a3f',
      ctaLabel: '',
      ctaUrl: '/contact',
      startDate: '',
      endDate: '',
    },
  },
}

export function deepMerge(base, overlay) {
  const out = { ...base }
  for (const key of Object.keys(overlay || {})) {
    const a = base[key]
    const b = overlay[key]
    out[key] =
      a && b && typeof a === 'object' && !Array.isArray(a) && typeof b === 'object' && !Array.isArray(b)
        ? deepMerge(a, b)
        : (b ?? a)
  }
  return out
}

export const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']