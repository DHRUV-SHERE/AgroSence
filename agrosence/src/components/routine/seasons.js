/** Static season data for India's three cropping seasons. Months are 0-based (0 = January). */
export const SEASONS = [
  {
    id: 'kharif',
    name: 'Kharif',
    months: [5, 6, 7, 8, 9], // June to October
    span: 'June to October',
    note: 'Sown with the monsoon, harvested in autumn.',
    crops: ['Rice', 'Cotton', 'Maize', 'Bajra', 'Groundnut', 'Soybean', 'Tur'],
    tasks: [
      { title: 'Prepare fields and check bunds before the first rain', when: 'June' },
      { title: 'Treat seed and sow after the monsoon sets in', when: 'June to July' },
      { title: 'First weeding and top-dress nitrogen', when: 'July to August' },
      { title: 'Scout for pests after humid spells', when: 'August to September' },
      { title: 'Plan harvest labour and drying space', when: 'October' },
    ],
  },
  {
    id: 'rabi',
    name: 'Rabi',
    months: [10, 11, 0, 1, 2], // November to March
    span: 'November to March',
    note: 'Sown in the cool season, harvested in spring.',
    crops: ['Wheat', 'Mustard', 'Gram', 'Barley', 'Peas', 'Cumin', 'Potato'],
    tasks: [
      { title: 'Test soil and apply basal fertiliser', when: 'Late October to November' },
      { title: 'Sow wheat and gram while the soil is still warm', when: 'November' },
      { title: 'First irrigation about 3 weeks after sowing', when: 'December' },
      { title: 'Protect from frost and watch for rust', when: 'January' },
      { title: 'Book harvesting machinery and storage', when: 'March' },
    ],
  },
  {
    id: 'zaid',
    name: 'Zaid',
    months: [2, 3, 4, 5], // March to June
    span: 'March to June',
    note: 'A short summer crop between Rabi and Kharif. Needs steady irrigation.',
    crops: ['Watermelon', 'Muskmelon', 'Cucumber', 'Moong', 'Fodder maize', 'Vegetables'],
    tasks: [
      { title: 'Sow short-duration crops right after Rabi harvest', when: 'March' },
      { title: 'Irrigate early morning or evening, mulch to hold moisture', when: 'April to May' },
      { title: 'Shade or cover young vegetables in heatwaves', when: 'May' },
      { title: 'Harvest early and sell fresh produce quickly', when: 'May to June' },
    ],
  },
]

export const currentSeasons = (date = new Date()) => SEASONS.filter((s) => s.months.includes(date.getMonth())).map((s) => s.id)

export const SUGGESTED_DAILY = [
  { title: 'Check soil moisture', when: 'morning' },
  { title: 'Irrigate fields', when: 'morning' },
  { title: 'Walk the field for pests and disease', when: 'afternoon' },
  { title: 'Feed and water livestock', when: 'evening' },
  { title: 'Check mandi prices', when: 'evening' },
]

export const TIMES = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
]
