# Sixth Sense — MemoryLoop AI

**A cognitive-support prototype exploring guided memory rehearsal for people living with dementia or memory difficulties.**

[**Open the live demo**](https://nikhilasds25-bit.github.io/sixth-sense/) · [View this repository](https://github.com/nikhilasds25-bit/sixth-sense)

> **Important:** MemoryLoop AI is an educational prototype. It is not a medical device, clinical assessment, diagnostic system, treatment, or clinically validated product. Its demo data and results are synthetic and do not establish medical benefit.

## 1. What problem is this project exploring?

Everyday plans often involve remembering several connected details: **where to go, when to go, what the plan is, and what to bring**. For some people living with dementia or memory difficulties, keeping these details in mind and recalling them at the right moment can be challenging. A conventional reminder may display information, but it may not give someone a simple, supportive opportunity to rehearse the plan beforehand.

MemoryLoop AI explores a design question:

**Could a short, repeatable, personalized practice loop make an everyday plan easier to revisit and understand?**

The project is intended to explore supportive interaction—not to claim that a software prototype can prevent memory loss, treat dementia, or replace family members, caregivers, or healthcare professionals.

## 2. What does the app do?

The concept connects three perspectives around a fictional everyday task:

- **Patient view:** reviews a sample appointment, practices recalling a detail, receives simple rule-based feedback, and can optionally hear the question using the browser's built-in speech synthesis when available.
- **Caregiver view:** builds a fictional practice task using predefined sample events, times, items, and questions, then reviews the demo's interaction summaries.
- **Clinician showcase:** displays illustrative, synthetic practice summaries and explains the simple rule used to choose a follow-up question. It is a demonstration screen, not a secure clinical dashboard.

The intended loop is:

1. **Prepare a plan** using a fictional event and a few details.
2. **Rehearse recall** with one short question at a time.
3. **Review feedback** based on configured sample answers.
4. **Choose a detail to revisit** using an explainable rule.
5. **Simulate reminder stages** to demonstrate how a future reminder workflow might look.

The public demo does not send actual reminders or run a real-time scheduler. Its reminder stages advance when a user clicks a control.

## 3. What has been built?

### Public recruiter demo

The live website is a static showcase built with HTML, CSS, and vanilla JavaScript. It contains:

- A project overview and guided walkthrough.
- Separate patient, caregiver, and clinician showcase pages.
- Predefined synthetic scenarios and tasks.
- Browser-side, rule-based answer matching.
- An explainable rule for selecting a practice question based on recent demo coverage.
- Simulated reminder stages and acknowledgement interactions.
- Shared synthetic demo state across pages in the same browser profile.
- A reset control to restore the demo state.
- Responsive layouts, visible keyboard focus, form labels, skip navigation, and status announcements for assistive technology.

The demo has been checked for basic page navigation, JavaScript syntax, local interactions, responsive behavior, and absence of network/API requests. These checks are not a clinical or formal accessibility certification.

### Full local application

A separate local version has been developed around a **Python/FastAPI backend and SQLite**. Its intended application architecture includes:

- API endpoints and role/session handling.
- Persistent local storage for application data such as tasks, profiles, and interaction summaries.
- Deterministic answer evaluation.
- Rule-based selection of a follow-up practice question.
- An optional local speech-transcription path using faster-whisper in the development setup.

The local application's complete backend is **not currently included in this public GitHub repository and is not running behind the hosted demo**. The exact set of backend features available depends on the local version and its configuration; the GitHub Pages site must not be presented as if it were connected to that backend.

## 4. Where is the backend?

There are two separate editions:

| Edition | Where it runs | What it uses |
|---|---|---|
| Public website | GitHub Pages | Static HTML, CSS, JavaScript, and browser-local synthetic state |
| Full development application | Local development environment | Python/FastAPI, SQLite, and optional local speech tooling |

**The live site does not have a server-side backend.** It does not connect to FastAPI, SQLite, an AI API, a patient database, or a real notification service. The local backend remains separate from this public repository, so visitors cannot run or inspect its source from this repo yet.

This separation is deliberate for the portfolio demo: it avoids publishing a database, personal records, credentials, or a backend service that has not been prepared for public deployment. Before publishing the backend, it should be reviewed for secrets and sensitive data, supplied with synthetic test fixtures, documented, tested, and deployed with appropriate authentication and security controls.

## 5. Why green and white?

The interface uses a **teal-green and white visual system** as a considered design choice for a calm, uncluttered experience. It is a design rationale, not a claim that these colors are clinically proven to help every person with dementia.

- **Teal/green accents** are intended to feel calm and supportive and to create a consistent visual identity.
- **White cards and a very light green-tinted background** separate information into clear sections without adding heavy visual decoration.
- **Dark teal text on light backgrounds** provides strong visual contrast for reading.
- **Muted supporting text and borders** help organize content while keeping the main question or action prominent.
- **Amber** is used for cautionary or explanatory notices; **red** is reserved for error or danger states; a distinct **blue focus outline** helps show keyboard focus.

The current main palette includes dark teal-green (#145C53), deeper teal (#0C443D), white (#FFFFFF), a pale green-tinted page background (#F3F7F6), and a soft mint surface (#E5F2EE).

The broader accessibility choices are just as important as color: plain language, one main question at a time, consistent navigation, visible labels, generous spacing, responsive sizing, and keyboard focus indicators. Color preferences, contrast needs, vision, and cognitive needs vary from person to person; this design should be evaluated with people with lived experience and accessibility specialists before making a real-care claim.

## 6. How to try the live demo

1. Open the [MemoryLoop AI demo](https://nikhilasds25-bit.github.io/sixth-sense/).
2. Choose **Patient demo** and select a fictional appointment.
3. Answer a sample question and inspect the rule-based feedback.
4. Open **Caregiver demo** to create a sample task from the predefined options.
5. Open **Clinician showcase** to see how synthetic interaction summaries and the question-selection rule are displayed.
6. Use **Reset demo** to restore the sample state.

The demo's shared state is stored locally in the current browser profile. It is not synced between different devices or browsers.

## 7. Technology overview

**Public demo:** HTML5, CSS, vanilla JavaScript, browser local storage, and optional browser text-to-speech.

**Local application:** Python, FastAPI, SQLite, deterministic evaluation and selection rules, with optional faster-whisper speech transcription in the local development setup.

The hosted site does not use a large language model, retrieval-augmented generation service, or trained clinical prediction model. Its answer matching and follow-up selection are simple, inspectable rules.

## 8. Privacy, safety, and limitations

- Use only the fictional sample data in the public demo.
- Do not enter real patient details, personal health information, passwords, or confidential information.
- The public demo does not create accounts, contact caregivers, send notifications, or provide protected clinical records.
- Demo answer text is evaluated in the browser and discarded; the demo stores only limited synthetic result information locally.
- The clinician page presents illustrative demo summaries, not validated clinical scores.
- This project has not been clinically validated and must not be used to diagnose, monitor, or make treatment decisions about a real person.

## 9. Future work

Potential next steps include publishing a reviewed version of the backend, adding documented setup instructions and synthetic test data, deploying a protected API, connecting the interface through secure configuration, improving accessibility with user testing, and evaluating the interaction design with caregivers and people with relevant lived experience. Any real-world healthcare use would require appropriate clinical, privacy, security, and regulatory review.

---

**Project status:** Interactive portfolio prototype with a public static demo; the full backend remains local and separate.

