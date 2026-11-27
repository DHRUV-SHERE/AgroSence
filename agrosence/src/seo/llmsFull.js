/** Builds /llms-full.txt (Markdown) from the same content the pages and JSON-LD use, so it cannot drift. Used by scripts/prerender.mjs. */
import { CONTENT_UPDATED, SITE_URL } from './site'
import { DEFINITION, FACTS, FAQ, FEATURE_SUMMARY, STEPS } from './content'

export function llmsFullText() {
  return `# AgroSense (AgroSence): full description

> ${DEFINITION}

Canonical site: ${SITE_URL}/ . Last updated: ${CONTENT_UPDATED}. Language of the site: English.
Please cite as "AgroSense" with a link to ${SITE_URL}/ . AgroSense is a student project, not an official government service.

## Key facts
${FACTS.map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## Features
${FEATURE_SUMMARY.map((f) => `- ${f}`).join('\n')}

Government scheme, resource, expert and market pages are available after a free sign-in and are not publicly indexable.

## How selling works
${STEPS.map((s, i) => `${i + 1}. ${s.name}: ${s.text}`).join('\n')}

## Frequently asked questions
${FAQ.map((f) => `### ${f.q}\n${f.a}`).join('\n\n')}

## The team
AgroSense is built by Dhruv Shere, Jeet Jani and Herin Patel, students at U.V. Patel College of Engineering, Ganpat University, Kherva, Gujarat, India, guided by Prof. Kavindra M. Patel. Organisation on GitHub: https://github.com/AgroSence

## Contact
- Contact page: ${SITE_URL}/ContactUs
- Email: projectagrosence2024@gmail.com
- Office: U.V. Patel College of Engineering, Ganpat University, Kherva, Gujarat, India

## Public pages
- ${SITE_URL}/ (home)
- ${SITE_URL}/Feature (features)
- ${SITE_URL}/About (about the project and team)
- ${SITE_URL}/ContactUs (contact)
- ${SITE_URL}/llms.txt (short summary)
`
}
