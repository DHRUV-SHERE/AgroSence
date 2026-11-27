/** About: vision, team, guide. Layout: PublicLayout. */
import { Link } from 'react-router-dom'
import { LuGithub, LuLinkedin } from 'react-icons/lu'
import { IconButton } from '../components/ui'
import { CONTENT_UPDATED } from '../seo/site'

const TEAM = [
  { name: 'Dhruv Shere', bio: 'Sets the vision for AgroSense and shapes the product end to end, from the farmer’s first question to the final sale.', github: 'https://github.com/DHRUV-SHERE', linkedin: 'https://www.linkedin.com/in/dhruv-shere/' },
  { name: 'Jeet Jani', bio: 'Turns farmers’ real needs into simple, trustworthy experiences that work for first-time users on any device.', github: 'https://github.com/janijeet17', linkedin: 'https://www.linkedin.com/in/jeet-jani-7a5267248/' },
  { name: 'Herin Patel', bio: 'Owns the platform’s architecture, cloud infrastructure and security so the marketplace stays fast, reliable and safe.', github: 'https://github.com/Herin27', linkedin: 'https://www.linkedin.com/in/herin-patel-5a6b3b30a/' },
]

function Social({ name, github, linkedin }) {
  const items = [[github, LuGithub, 'GitHub'], [linkedin, LuLinkedin, 'LinkedIn']]
  return (
    <div className="ag-person__links">
      {items.filter(([href]) => href).map(([href, Icon, label]) => (
        <IconButton key={label} size="sm" label={`${name} on ${label}`} as="a" href={href} target="_blank" rel="noopener noreferrer"><Icon /></IconButton>
      ))}
    </div>
  )
}

export default function About() {
  return (
    <>
      <section className="ag-pagehero">
        <div className="ag-container">
          <h1>A fairer way to sell what you grow</h1>
          <p>AgroSense (also written AgroSence) is a free web platform built as a college project at U.V. Patel College of Engineering, Ganpat University, Gujarat. Its aim is simple: put farmers in direct contact with buyers and give them the knowledge to farm better.</p>
        </div>
      </section>

      <section className="ag-section" aria-labelledby="vision-h">
        <div className="ag-container ag-narrow" style={{ marginInline: 'auto' }}>
          <h2 id="vision-h">Our vision</h2>
          <div className="ag-prose ag-stack">
            <p className="ag-lede">Empowering farmers, transforming agriculture. AgroSense is designed to change how farmers sell their crops. By connecting them directly to buyers, we remove the middleman so farmers can set their own prices and maximise their profit.</p>
            <p>Our mission is to equip the agricultural community with knowledge, tools and market access. Bridging the gap between farmers and buyers brings transparency, efficiency and economic growth to rural areas.</p>
            <p>The platform also tackles market connectivity and education gaps, and encourages sustainable practice by promoting eco-friendly farming methods.</p>
            <p>Whether you are a farmer, a buyer or simply curious about agriculture, you are invited to be part of this journey: a sustainable, profitable future for farming.</p>
          </div>
        </div>
      </section>

      <section className="ag-section" style={{ background: 'var(--surface-2)' }} aria-labelledby="team-h">
        <div className="ag-container">
          <h2 id="team-h" style={{ marginBottom: 'var(--s-6)' }}>The team</h2>
          <div className="ag-team">
            {TEAM.map((m) => (
              <article key={m.name} className="ag-person">
                <div>
                  <h3>{m.name}</h3>
                  <p>{m.bio}</p>
                </div>
                <Social {...m} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ag-section" aria-labelledby="langs-h">
        <div className="ag-container ag-narrow" style={{ marginInline: 'auto' }}>
          <h2 id="langs-h">AgroSense in Hindi and Gujarati</h2>
          <div className="ag-prose ag-stack">
            <p lang="hi">AgroSense किसानों को सीधे खरीदारों से जोड़ने वाला एक मुफ़्त वेब प्लेटफ़ॉर्म है। किसान अपनी फसल की तस्वीर, मात्रा और अपनी कीमत के साथ सूची बनाते हैं, और खरीदार सीधे उनसे ऑर्डर करते हैं।</p>
            <p lang="gu">AgroSense ખેડૂતોને સીધા ખરીદદારો સાથે જોડતું મફત વેબ પ્લેટફોર્મ છે. ખેડૂતો પોતાના પાકના ફોટા, જથ્થો અને પોતાની કિંમત સાથે યાદી બનાવે છે, અને ખરીદદારો સીધા તેમની પાસેથી ઓર્ડર કરે છે.</p>
          </div>
        </div>
      </section>

      <section className="ag-section" aria-labelledby="guide-h">
        <div className="ag-container">
          <h2 id="guide-h" style={{ marginBottom: 'var(--s-6)' }}>Our guide</h2>
          <div className="ag-guide">
            <div className="ag-prose ag-stack">
              <h3 style={{ marginBottom: 0 }}>Prof. Kavindra M. Patel</h3>
              <p>Kavindra Patel received his B.E. degree in Computer Engineering from North Gujarat University (NGU), Patan in 2011 and his M.E. degree in Computer Science and Engineering from Gujarat Technological University (GTU), Ahmedabad in 2014.</p>
              <p>We are deeply grateful to our guide for his constant support and invaluable direction throughout this project. His humble and respectful nature made it easy for us to approach him with any challenge. His insightful suggestions and problem-solving approach helped us overcome obstacles and grow, both technically and personally. His dedication to sharing new knowledge and encouraging creativity has been a source of motivation for the whole team. We truly appreciate his mentorship and are honoured to have him as our guide.</p>
            </div>
          </div>
          <p className="ag-updated">Last updated <time dateTime={CONTENT_UPDATED}>{CONTENT_UPDATED}</time>. See what the platform offers on the <Link to="/Feature">features page</Link>, or <Link to="/ContactUs">contact the team</Link>.</p>
        </div>
      </section>
    </>
  )
}
