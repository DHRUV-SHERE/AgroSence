/**
 * Home: hero, what the platform does, about, closing call to action.
 * Layout: PublicLayout (applied by the route table).
 */
import { Link } from 'react-router-dom'
import { LuArrowRight } from 'react-icons/lu'
import { Button } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { CONTENT_UPDATED } from '../seo/site'
import { DEFINITION, FACTS, FAQ, STEPS } from '../seo/content'
import hero720 from '../assets/home/hero-720.webp'
import hero480 from '../assets/home/hero-480.webp'
import marketImg from '../assets/home/market access.webp'
import cropImg from '../assets/home/crop detection.webp'
import chatImg from '../assets/home/AI chat bot.webp'
import resourceImg from '../assets/home/resources.webp'
import schemeImg from '../assets/home/gov schemes.webp'
import expertImg from '../assets/home/Expert Advice.webp'
import indianAgri from '../assets/home/indian agriculture.webp'
import ourProject from '../assets/home/about our project.webp'

const FEATURES = [
  { to: '/features/MarketAccess', title: 'Market access', img: marketImg, text: 'List your crops with photos, quantity and your own price. Buyers across the country can see them and order directly from you.' },
  { to: '/features/crop-detection', title: 'Crop detection', img: cropImg, text: 'Take or upload a photo of a leaf or plant. AgroSense identifies it and gives its scientific and common names with a short description.' },
  { to: '/Feature', title: 'AI chatbot', img: chatImg, text: 'Ask about pest control, crop care or weather any time of day. Answers come back in seconds, in plain language.' },
  { to: '/features/resources', title: 'Farming resources', img: resourceImg, text: 'Step-by-step guides, tutorials and expert tips on irrigation, soil health, sustainable farming and pest management.' },
  { to: '/features/government-schemes', title: 'Government schemes', img: schemeImg, text: 'Browse subsidies, financial support and schemes by state so you do not miss support you are entitled to.' },
  { to: '/features/expert', title: 'Expert advice', img: expertImg, text: 'Get help choosing crops, handling pests, improving soil, planning irrigation and storing produce after harvest.' },
]

export default function Home() {
  const { isAuthenticated } = useAuth()
  return (
    <>
      <section className="ag-hero">
        <div className="ag-container ag-hero__grid">
          <div>
            <h1 className="ag-h-display">
              <span className="ag-hero__line"><span>Sell your harvest.</span></span>
              <span className="ag-hero__line"><span className="ag-em">Keep the price.</span></span>
            </h1>
            <p className="ag-lede">{DEFINITION}</p>
            <div className="ag-hero__cta">
              {isAuthenticated ? (
                <Button as={Link} to="/dashboard" variant="primary" size="lg" icon={<LuArrowRight aria-hidden="true" />}>Open your dashboard</Button>
              ) : (
                <>
                  <Button as={Link} to="/signup" variant="primary" size="lg">Start selling</Button>
                  <Button as={Link} to="/Feature" size="lg">See how it works</Button>
                </>
              )}
            </div>
            <div className="ag-hero__langs" aria-label="Available languages">
              <span>English</span><span lang="hi">हिन्दी</span><span lang="gu">ગુજરાતી</span>
            </div>
          </div>
          <div className="ag-hero__media">
            <span className="ag-hero__sun" aria-hidden="true" />
            <img className="ag-hero__photo" src={hero720} srcSet={`${hero480} 480w, ${hero720} 720w`} sizes="(max-width: 52rem) 78vw, 32rem" alt="A farmer walking through terraced rice fields in the morning light" width="720" height="900" fetchPriority="high" decoding="async" />
            <p className="ag-hero__stamp">Direct from the farmer to the buyer</p>
          </div>
        </div>
      </section>

      <section className="ag-section" style={{ paddingTop: 0 }} aria-labelledby="facts-h">
        <div className="ag-container">
          <div className="ag-sechead">
            <h2 id="facts-h">AgroSense at a glance</h2>
          </div>
          <dl className="ag-facts">
            {FACTS.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
      </section>

      <section className="ag-section" style={{ paddingTop: 0 }} aria-labelledby="what-h">
        <div className="ag-container">
          <div className="ag-sechead">
            <h2 id="what-h">Everything a farm needs, in one place</h2>
            <p>Six tools that work together, from the first sowing question to the final sale.</p>
          </div>
          <div className="ag-featlist">
            {FEATURES.map((f) => (
              <Link key={f.title} to={f.to} className="ag-featrow">
                <img src={f.img} alt="" width="320" height="213" loading="lazy" decoding="async" />
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
                <LuArrowRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="ag-section" aria-labelledby="how-h">
        <div className="ag-container">
          <div className="ag-sechead">
            <h2 id="how-h">How does AgroSense work for farmers?</h2>
            <p>Four steps from sign-up to a sale.</p>
          </div>
          <ol className="ag-howsteps">
            {STEPS.map((st) => <li key={st.name}><div><h3>{st.name}</h3><p>{st.text}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section className="ag-section" style={{ background: 'var(--surface-2)' }} aria-labelledby="about-h">
        <div className="ag-container">
          <div className="ag-story ag-story--blob">
            <img src={indianAgri} alt="Ripe mandarins hanging among dark green leaves" width="471" height="371" loading="lazy" decoding="async" />
            <div>
              <h2 id="about-h">Indian agriculture, made simpler</h2>
              <p className="ag-lede">
                Farming in India is varied, from paddy terraces to cotton belts and orchards. We built AgroSense around that
                variety, so a grower in Gujarat and a grower in Kerala each get tools that fit how they actually work.
              </p>
            </div>
          </div>
          <div className="ag-story ag-story--blob ag-story--flip">
            <div>
              <h2>About our project</h2>
              <p className="ag-lede">
                AgroSense is a platform designed to change the way farmers sell their crops. By connecting farmers directly
                to buyers, we remove the middleman so farmers can set their own prices and keep more of their profit. Our
                goal is a fair, efficient and farmer-friendly marketplace.
              </p>
              <Button as={Link} to="/About" icon={<LuArrowRight aria-hidden="true" />}>Meet the team</Button>
            </div>
            <img src={ourProject} alt="" width="471" height="371" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>

      <section className="ag-section" aria-labelledby="faq-h">
        <div className="ag-container">
          <div className="ag-sechead">
            <h2 id="faq-h">Frequently asked questions about AgroSense</h2>
          </div>
          <div className="ag-qa">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p className="ag-updated">Last updated <time dateTime={CONTENT_UPDATED}>{CONTENT_UPDATED}</time>. AgroSense is a student project from Ganpat University, Gujarat. <Link to="/About">About the team</Link> · <Link to="/ContactUs">Contact us</Link></p>
        </div>
      </section>

      <section className="ag-section">
        <div className="ag-container">
          <div className="ag-band">
            <h2>Ready to sell your next harvest?</h2>
            <Button as={Link} to={isAuthenticated ? '/CropSell' : '/signup'} variant="primary" size="lg">
              {isAuthenticated ? 'List a crop' : 'Create a free account'}
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
