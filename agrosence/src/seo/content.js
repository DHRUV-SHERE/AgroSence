/**
 * Public copy that must stay identical between the visible page and the structured data (FAQ, steps, facts).
 * Everything here describes what the app actually does today.
 */
export const DEFINITION =
  'AgroSense is a free web platform for Indian farmers and buyers. Farmers list their crops with photos, quantity and their own price, and buyers order directly from them, with no middleman. The platform also offers plant identification from a photo, government scheme listings by state, farming guides, expert advice and an AI chatbot.'

export const FAQ = [
  {
    q: 'What is AgroSense?',
    a: 'AgroSense (also written AgroSence) is a free web platform that connects Indian farmers directly with buyers. Farmers list crops at their own price, and the platform adds plant identification from a photo, state-wise government schemes, farming resources, expert advice and an AI chatbot. It is a college project by students of Ganpat University, Gujarat.',
  },
  {
    q: 'How do farmers sell crops directly to buyers on AgroSense?',
    a: 'Create a free account, open Sell crops and add your crop with photos, quantity and your own price. Buyers browse the market and place an order request. You accept or reject it, and AgroSense notifies the buyer. Then you agree delivery and payment directly with the buyer.',
  },
  {
    q: 'Is AgroSense free to use?',
    a: 'Yes. Creating an account is free, and AgroSense does not take any payment for orders. Buyers and sellers settle delivery and payment between themselves.',
  },
  {
    q: 'Which languages does AgroSense support?',
    a: 'The website is written in English today. When you sign up you choose a preferred language, English, Hindi or Gujarati, and you can ask the AI chatbot your questions in the language you are comfortable with.',
  },
  {
    q: 'How does AI crop detection work?',
    a: 'Open Crop detection, then take or upload a clear photo of a leaf or plant. The photo is sent to a plant identification service, which returns the plant’s scientific name, common names and a short description. AgroSense does not keep the photo. It is a guide, not a lab test, so ask an expert about disease or pest problems.',
  },
  {
    q: 'Which government schemes can I find on AgroSense?',
    a: 'After you sign in, the Government schemes page lists subsidies, financial support and agricultural programmes, which you can filter by state. Each scheme shows its description, who is eligible, the benefits and a link to apply. Always confirm the details on the official scheme website before applying.',
  },
  {
    q: 'How are orders and payments handled?',
    a: 'A buyer places an order for a quantity of a listed crop, and the seller is notified. When the seller accepts, the stock is reduced and the buyer is told. AgroSense does not take payment: both sides see each other’s phone number and agree delivery and payment directly.',
  },
  {
    q: 'Who built AgroSense?',
    a: 'AgroSense was built by a student team at U.V. Patel College of Engineering, Ganpat University, Gujarat, as a college project, under the guidance of Prof. Kavindra M. Patel. You can reach the team through the contact page.',
  },
]

export const STEPS = [
  { name: 'Create a free account', text: 'Sign up with your mobile number or email and choose your state and preferred language.' },
  { name: 'List your crop', text: 'Add photos, quantity and your own price. Your listing appears in the market for buyers.' },
  { name: 'Receive and answer orders', text: 'Buyers place order requests. You accept or reject each one and the buyer is notified.' },
  { name: 'Agree delivery and payment', text: 'Contact the buyer directly to settle delivery and payment. AgroSense does not take payment.' },
]

export const FACTS = [
  ['What it is', 'A free web platform and marketplace for farmers'],
  ['Who it is for', 'Farmers and buyers across India'],
  ['Cost', 'Free account, no payment taken on orders'],
  ['Tools', 'Crop market, plant identification, schemes, resources, expert advice, AI chatbot'],
  ['Languages', 'English site; preferred language English, Hindi or Gujarati'],
  ['Built by', 'Students of Ganpat University, Gujarat (college project)'],
]

export const FEATURE_SUMMARY = [
  'Market access: list crops with photos, quantity and your own price; buyers order directly',
  'Crop detection: identify a plant from a photo',
  'AI chatbot: farming questions answered in seconds',
  'Farming resources: guides and tips on irrigation, soil health and pest management',
  'Government schemes: subsidies and support filtered by state',
  'Expert advice: help with crop choice, pests, soil, irrigation and storage',
]
