/** Features overview: one story row per capability. Layout: PublicLayout. */
import { Link } from 'react-router-dom'
import { LuArrowRight } from 'react-icons/lu'
import { Button } from '../components/ui'
import { CONTENT_UPDATED } from '../seo/site'
import market from '../assets/Feature/Market Access.webp'
import crop from '../assets/Feature/Crop Detection.webp'
import resources from '../assets/Feature/Resource.webp'
import scheme from '../assets/Feature/Gov Scheme.webp'
import expert from '../assets/Feature/Expert Advice.webp'
import chatbot from '../assets/Feature/Ai ChatBot.webp'

const FEATURES = [
  { title: 'Market access', to: '/features/MarketAccess', cta: 'Browse the market', img: market, text: 'Showcase your crops to a wider audience by listing them with detailed descriptions, images and pricing. It simplifies connecting with potential buyers, helping you reach local and national markets and increase your sales.' },
  { title: 'Crop detection', to: '/features/crop-detection', cta: 'Check a crop', img: crop, text: 'Take or upload a clear photo of a leaf or plant and AgroSense identifies it, returning its scientific and common names with a short description. It is a guide, not a lab test: for disease or pest problems, ask an expert.' },
  { title: 'AI chatbot', img: chatbot, text: 'Round-the-clock help with questions about farming practices, pest control, crop management and weather. Tap the chat button at the bottom corner of any page to ask.' },
  { title: 'Resources', to: '/features/resources', cta: 'Explore resources', img: resources, text: 'A library of step-by-step guides, video tutorials and expert tips on sustainable farming, irrigation techniques, soil health and pest management, to improve your yield and farm productivity.' },
  { title: 'Government schemes', to: '/features/government-schemes', cta: 'Find schemes', img: scheme, text: 'Stay up to date with the latest schemes and benefits made for farmers. See subsidies, financial support and agricultural programmes in detail so you do not miss opportunities that could help your farm.' },
  { title: 'Expert advice', to: '/features/expert', cta: 'Ask an expert', img: expert, text: 'Seek help on crop selection, pest management, soil health, irrigation and post-harvest handling. Informed decisions mean better yields and fewer losses.' },
]

export default function Feature() {
  return (
    <>
      <section className="ag-pagehero">
        <div className="ag-container">
          <h1>Tools that follow the crop, from seed to sale</h1>
          <p>AgroSense gives farmers six tools in one free account: a direct crop market, plant identification from a photo, an AI chatbot, farming resources, government scheme listings and expert advice. Each is built to work on a phone, in plain language.</p>
        </div>
      </section>
      <section className="ag-section">
        <div className="ag-container">
          {FEATURES.map((f, i) => (
            <article key={f.title} className={`ag-story${i % 2 ? ' ag-story--flip' : ''}`}>
              <div>
                <h2>{f.title}</h2>
                <p className="ag-lede">{f.text}</p>
                {f.to && <Button as={Link} to={f.to} icon={<LuArrowRight aria-hidden="true" />}>{f.cta}</Button>}
              </div>
              <img src={f.img} alt="" width="588" height="366" loading="lazy" decoding="async" />
            </article>
          ))}
          <p className="ag-updated">Last updated <time dateTime={CONTENT_UPDATED}>{CONTENT_UPDATED}</time>. Questions? <Link to="/ContactUs">Contact the team</Link> or read <Link to="/About">about the project</Link>. Back to <Link to="/">AgroSense home</Link>.</p>
        </div>
      </section>
    </>
  )
}
