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
      'Makeup artist and mehendi',
      'DJ, band and sound',
      'Pandit or officiant',
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
}

export function buildPlan(form) {
  const type = EVENT_TYPES[form.type]
  const budget = Number(form.budget)
  const guests = Number(form.guests)

  if (!type) return { error: 'Please select an event type.' }
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
    ['Shared playlist', 'Combine classic film music with the couple\'s own picks for the sangeet.'],
  ],
  birthday: [
    ['Single theme', 'Choose one theme and build the cake, decor and dress code around it.'],
    ['Game stations', 'Three small games with modest prizes keep guests engaged without a large entertainer fee.'],
    ['Photo corner', 'Fairy lights and a simple backdrop cost little and get shared widely.'],
    ['Memory jar', 'Guests write a wish or memory, which becomes a keepsake.'],
  ],
  community: [
    ['Volunteer role cards', 'Give each volunteer one clearly written responsibility.'],
    ['Reusable materials', 'Steel plates, cloth banners and flower decor cost less and reduce waste.'],
    ['Local performance slot', 'A short stage slot for neighbourhood residents draws whole families.'],
    ['Single broadcast group', 'One messaging group with the schedule and a map pin avoids repeated calls.'],
  ],
}

export function fallbackSuggestions(form) {
  const type = EVENT_TYPES[form.type]
  const vibe = (form.vibe || '').trim()
  const place = form.city ? ' in ' + form.city : ''
  const theme = vibe ? ', with a "' + vibe + '" theme' : ''
  return {
    summary: `A ${type.noun} for ${form.guests} guests${place}${theme}.`,
    ideas: SUGGESTIONS[form.type].map(([title, detail]) => ({ title, detail })),
    tips: [
      'Keep a contingency of 5 to 10 percent of the budget.',
      'Collect at least three quotes for your largest expense.',
      'Confirm every vendor in writing.',
    ],
  }
}