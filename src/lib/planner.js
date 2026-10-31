export const EVENT_TYPES = {
  wedding: {
    label: 'Wedding',
    noun: 'wedding',
    split: [
      ['Venue', 25],
      ['Catering', 30],
      ['Decor and flowers', 12],
      ['Photography and video', 10],
      ['Attire and beauty', 10],
      ['Music and entertainment', 5],
      ['Invitations and gifts', 3],
      ['Contingency', 5],
    ],
    vendors: [
      'Venue or banquet hall',
      'Caterer',
      'Decorator and florist',
      'Photographer and videographer',
      'Makeup artist and mehendi artist (if needed)',
      'DJ, band and sound',
      'Ceremony officiant (as per your tradition)',
      'Invitation printer',
      'Guest accommodation and transport',
      'Return gifts',
    ],
    timeline: [
      [24, 'Fix budget, guest list and date'],
      [20, 'Book venue and caterer'],
      [16, 'Book photographer and decorator'],
      [12, 'Shop for outfits and jewellery'],
      [8, 'Send invitations'],
      [4, 'Finalise menu, music and seating'],
      [1, 'Confirm all vendors and run a rehearsal'],
      [0, 'Event day'],
    ],
  },
  engagement: {
    label: 'Engagement',
    noun: 'engagement ceremony',
    split: [
      ['Venue', 20],
      ['Catering', 28],
      ['Decor and flowers', 12],
      ['Photography and video', 10],
      ['Attire and jewellery', 15],
      ['Music and entertainment', 5],
      ['Invitations and gifts', 5],
      ['Contingency', 5],
    ],
    vendors: [
      'Venue or banquet hall',
      'Caterer',
      'Decorator and florist',
      'Photographer and videographer',
      'Ring and jewellery',
      'Makeup artist',
      'Emcee, DJ or live music',
      'Invitation printer',
      'Return gifts',
    ],
    timeline: [
      [12, 'Fix budget, guest list and date'],
      [10, 'Book venue and caterer'],
      [8, 'Book photographer and decorator'],
      [6, 'Shop for rings and outfits'],
      [4, 'Send invitations'],
      [1, 'Finalise the programme and confirm vendors'],
      [0, 'Event day'],
    ],
  },
  anniversary: {
    label: 'Anniversary',
    noun: 'anniversary celebration',
    split: [
      ['Venue', 20],
      ['Food and cake', 30],
      ['Decor and flowers', 12],
      ['Photography and video', 10],
      ['Attire and gifts', 13],
      ['Music and entertainment', 10],
      ['Contingency', 5],
    ],
    vendors: [
      'Venue or restaurant booking',
      'Caterer or set menu',
      'Cake baker',
      'Decorator and florist',
      'Photographer',
      'Music or live performer',
      'Gifts and keepsakes',
    ],
    timeline: [
      [8, 'Fix budget, guest list and date'],
      [6, 'Book venue and caterer'],
      [4, 'Book photographer and decorator'],
      [3, 'Send invitations'],
      [1, 'Confirm vendors and finalise the programme'],
      [0, 'Event day'],
    ],
  },
  birthday: {
    label: 'Birthday',
    noun: 'birthday party',
    split: [
      ['Venue', 20],
      ['Food and cake', 35],
      ['Decor and balloons', 15],
      ['Entertainment and games', 12],
      ['Photography', 5],
      ['Invitations and return gifts', 8],
      ['Contingency', 5],
    ],
    vendors: [
      'Venue or home setup',
      'Caterer or home menu',
      'Cake baker',
      'Decorator',
      'Host, DJ or entertainer',
      'Photographer',
      'Return gifts',
    ],
    timeline: [
      [4, 'Set budget, date and guest list'],
      [3, 'Book venue, cake and decor'],
      [2, 'Send invitations and plan games'],
      [1, 'Confirm food and collect supplies'],
      [0, 'Event day'],
    ],
  },
  babyshower: {
    label: 'Baby shower',
    noun: 'baby shower',
    split: [
      ['Venue', 18],
      ['Food and desserts', 32],
      ['Decor and theme', 17],
      ['Games and entertainment', 10],
      ['Photography', 6],
      ['Invitations and return gifts', 10],
      ['Contingency', 7],
    ],
    vendors: [
      'Venue or home setup',
      'Caterer or home menu',
      'Dessert or cake baker',
      'Decorator',
      'Games and host',
      'Photographer',
      'Return gifts',
    ],
    timeline: [
      [6, 'Fix budget, date and guest list'],
      [5, 'Choose theme and book venue'],
      [4, 'Book caterer and decorator'],
      [3, 'Send invitations'],
      [1, 'Confirm food, games and supplies'],
      [0, 'Event day'],
    ],
  },
  community: {
    label: 'Community event',
    noun: 'community event',
    split: [
      ['Venue and permissions', 20],
      ['Food and refreshments', 30],
      ['Stage, sound and lights', 15],
      ['Decor and banners', 10],
      ['Publicity', 8],
      ['Volunteers and safety', 7],
      ['Contingency', 10],
    ],
    vendors: [
      'Venue or ground booking',
      'Permissions (society, police, municipal)',
      'Caterer',
      'Stage, sound and lights',
      'Banners and printing',
      'Volunteer team',
      'First aid and safety',
    ],
    timeline: [
      [8, 'Form a committee and fix the budget'],
      [6, 'Obtain permissions and book the venue'],
      [4, 'Book caterer, sound and stage'],
      [3, 'Publicise through posters and messaging groups'],
      [1, 'Brief volunteers and confirm vendors'],
      [0, 'Event day'],
    ],
  },
  college: {
    label: 'College event',
    noun: 'college event',
    split: [
      ['Venue and permissions', 15],
      ['Food and refreshments', 22],
      ['Stage, sound and lights', 20],
      ['Decor and printing', 10],
      ['Prizes and certificates', 10],
      ['Publicity and registration', 10],
      ['Guests and logistics', 5],
      ['Contingency', 8],
    ],
    vendors: [
      'Auditorium or ground booking',
      'Permissions from the institution',
      'Caterer',
      'Stage, sound and lights',
      'Banners, standees and printing',
      'Prizes and certificates',
      'Registration desk and volunteers',
      'Guest and judge coordination',
    ],
    timeline: [
      [8, 'Form a core team and fix the budget'],
      [6, 'Get approvals and book the venue'],
      [5, 'Open registrations and begin publicity'],
      [4, 'Confirm guests, sponsors and vendors'],
      [2, 'Print materials and brief volunteers'],
      [1, 'Run a full rehearsal and confirm logistics'],
      [0, 'Event day'],
    ],
  },
  corporate: {
    label: 'Corporate event',
    noun: 'corporate event',
    split: [
      ['Venue', 20],
      ['Catering', 22],
      ['AV and technology', 15],
      ['Branding and printing', 8],
      ['Speakers and hospitality', 12],
      ['Travel and accommodation', 8],
      ['Marketing and registration', 7],
      ['Contingency', 8],
    ],
    vendors: [
      'Venue or conference hall',
      'Caterer',
      'AV, projector and sound',
      'Branding, banners and printing',
      'Speakers and guest hospitality',
      'Travel and accommodation',
      'Registration and badge desk',
      'Event photographer',
    ],
    timeline: [
      [10, 'Define objectives, budget and guest list'],
      [8, 'Book venue and confirm speakers'],
      [6, 'Book caterer and AV vendor'],
      [4, 'Send invitations and open registration'],
      [2, 'Finalise agenda, branding and materials'],
      [1, 'Run a technical rehearsal and confirm logistics'],
      [0, 'Event day'],
    ],
  },
  other: {
    label: 'Other (type your own)',
    noun: 'event',
    split: [
      ['Venue', 25],
      ['Food and refreshments', 30],
      ['Decor and setup', 15],
      ['Entertainment and activities', 10],
      ['Photography', 5],
      ['Invitations and miscellaneous', 5],
      ['Contingency', 10],
    ],
    vendors: [
      'Venue or space booking',
      'Caterer or food arrangements',
      'Decorator or setup crew',
      'Entertainment or activities',
      'Photographer',
      'Invitations or announcements',
    ],
    timeline: [
      [6, 'Fix budget, date and guest list'],
      [5, 'Book venue and key vendors'],
      [3, 'Send invitations'],
      [1, 'Confirm all arrangements'],
      [0, 'Event day'],
    ],
  },
}

export function buildPlan(form) {
  const type = EVENT_TYPES[form.type]
  const budget = Number(form.budget)
  const guests = Number(form.guests)

  if (!type) return { error: 'Please select an event type.' }
  if (form.type === 'other' && !(form.customType || '').trim()) {
    return { error: 'Describe your event type, for example housewarming or reunion.' }
  }
  if (!(budget > 0)) return { error: 'Enter a budget greater than zero.' }
  if (!(guests > 0)) return { error: 'Enter the number of guests.' }
  if (!form.date) return { error: 'Select the event date.' }

  const eventDate = new Date(form.date + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysLeft = Math.round((eventDate - today) / 86400000)
  if (daysLeft < 0) return { error: 'The event date is in the past.' }

  // If the event is closer than the ideal lead time, compress the schedule.
  const idealWeeks = type.timeline[0][0]
  const scale = Math.min(1, daysLeft / (idealWeeks * 7))

  const timeline = type.timeline.map(([weeks, title]) => {
    const due = new Date(eventDate)
    due.setDate(due.getDate() - Math.round(weeks * 7 * scale))
    return { title, due: due.toISOString() }
  })

  const budgetItems = type.split.map(([name, pct]) => ({
    name,
    pct,
    amount: Math.round((budget * pct) / 100),
  }))

  return {
    total: budget,
    guests,
    daysLeft,
    compressed: scale < 1,
    perGuest: Math.round(budget / guests),
    budget: budgetItems,
    timeline,
    vendors: type.vendors,
  }
}

const SUGGESTIONS = {
  wedding: [
    ['Colour palette per function', 'Assign each function its own colour so the decor and photographs stay consistent.'],
    ['Live food counters', 'Chaat, dosa and dessert stations reduce queues and suit mixed age groups.'],
    ['Welcome hampers', 'A small box with sweets and a note for outstation guests.'],
    ['Shared playlist', "Combine classic film music with the couple's own picks for the sangeet."],
  ],
  engagement: [
    ['Ring ceremony spotlight', 'Plan a short, well-lit moment for the ring exchange so photographers can capture it.'],
    ['Family introductions', 'A simple programme card helps both families know the order of the evening.'],
    ['Intimate seating', 'Lounge-style seating encourages the two families to mingle.'],
    ['Photo backdrop', 'One floral backdrop with good lighting is enough for most of the photographs.'],
  ],
  anniversary: [
    ['Memory wall', 'Display photographs from each year together, which doubles as decor.'],
    ['Set menu', 'A fixed menu with one or two live counters controls cost and waiting time.'],
    ['Short toasts', 'Invite three or four close people to speak for two minutes each.'],
    ['Slideshow', 'A looping photo and video slideshow gives guests something to enjoy during the meal.'],
  ],
  birthday: [
    ['Single theme', 'Choose one theme and build the cake, decor and dress code around it.'],
    ['Game stations', 'Three small games with modest prizes keep guests engaged without a large entertainer fee.'],
    ['Photo corner', 'Fairy lights and a simple backdrop cost little and get shared widely.'],
    ['Memory jar', 'Guests write a wish or memory, which becomes a keepsake.'],
  ],
  babyshower: [
    ['Single colour theme', 'One or two colours across balloons, table cloths and desserts keeps decor affordable.'],
    ['Low-effort games', 'Guess the date, word scramble and memory games need almost no equipment.'],
    ['Advice cards', 'Guests write a short note for the parents, which becomes a keepsake.'],
    ['Dessert table', 'A small themed dessert table doubles as the main photo backdrop.'],
  ],
  community: [
    ['Volunteer role cards', 'Give each volunteer one clearly written responsibility.'],
    ['Reusable materials', 'Steel plates, cloth banners and flower decor cost less and reduce waste.'],
    ['Local performance slot', 'A short stage slot for neighbourhood residents draws whole families.'],
    ['Single broadcast group', 'One messaging group with the schedule and a map pin avoids repeated calls.'],
  ],
  college: [
    ['Sponsor tiers', 'Offer clear sponsor packages with defined visibility to offset costs.'],
    ['Online registration', 'A simple form with a QR code reduces desk queues and gives you an accurate headcount.'],
    ['Detailed run sheet', 'A minute-by-minute schedule shared with all volunteers prevents delays.'],
    ['Feedback form', 'A short post-event form helps with the next edition and sponsor reports.'],
  ],
  corporate: [
    ['Clear agenda', 'Share a timed agenda with speakers in advance so sessions run on schedule.'],
    ['Branded materials', 'Standees, lanyards and notepads in one colour scheme look professional at low cost.'],
    ['Networking slot', 'A dedicated tea break for networking adds value without a large budget.'],
    ['Feedback survey', 'A short digital survey gives measurable results for management.'],
  ],
  other: [
    ['Define one goal', 'Decide what a successful event looks like and plan the budget around that.'],
    ['Prioritise spending', 'Put most of the budget into the two things guests will notice most.'],
    ['Shared checklist', 'Keep one checklist that everyone helping can see and update.'],
    ['Backup plan', 'Prepare an alternative for weather, late vendors or lower attendance.'],
  ],
}

export function fallbackSuggestions(form) {
  const type = EVENT_TYPES[form.type]
  const custom = (form.customType || '').trim()
  const noun = form.type === 'other' && custom ? custom : type.noun
  const vibe = (form.vibe || '').trim()
  const place = form.city ? ' in ' + form.city : ''
  const theme = vibe ? ', with a "' + vibe + '" theme' : ''
  return {
    summary: `A ${noun} for ${form.guests} guests${place}${theme}.`,
    ideas: SUGGESTIONS[form.type].map(([title, detail]) => ({ title, detail })),
    tips: [
      'Keep a contingency of 5 to 10 percent of the budget.',
      'Collect at least three quotes for your largest expense.',
      'Confirm every vendor in writing.',
    ],
  }
}