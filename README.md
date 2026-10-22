# Sixth Sense — MemoryLoop AI

**A cognitive-support prototype exploring structured memory rehearsal for people living with dementia or memory difficulties.**

[Live Demo](https://nikhilasds25-bit.github.io/sixth-sense/) | [GitHub Repository](https://github.com/nikhilasds25-bit/sixth-sense)

> **Project Disclaimer:** MemoryLoop AI is an educational and experimental prototype. It is not a medical device, diagnostic system, treatment, or clinically validated product. The public demonstration uses synthetic data and simulated interactions. No clinical benefit is claimed.

## 1. Problem Statement

Remembering everyday plans often requires retaining several connected details, including appointments, times, destinations, and items to bring. For some people living with dementia or memory difficulties, recalling these details at the appropriate moment can be challenging.

Conventional reminder systems primarily communicate information at a scheduled time. They may not provide a structured opportunity to revisit and practise recalling a plan beforehand.

MemoryLoop AI explores an alternative interaction concept: **a structured, repeatable memory-rehearsal workflow that allows users to revisit everyday plans through short questions, supportive feedback, and caregiver-assisted task preparation.**

The project investigates how a simple digital interface could organise this process while prioritising clarity, accessibility, explainable logic, and caregiver involvement.

The prototype does not claim to prevent memory loss, treat dementia, or replace professional healthcare and personal care.

## 2. Project Overview

MemoryLoop AI is designed around a guided interaction cycle:

**Prepare a plan → Practise recall → Review feedback → Revisit important details**

The prototype brings together three user perspectives.

### Patient Interface

The patient-facing interface demonstrates how a person might interact with a prepared memory-rehearsal task.

Features include:
- Viewing fictional appointments and everyday plans.
- Answering short questions about selected task details.
- Receiving feedback based on configured sample answers.
- Hearing questions through browser-based text-to-speech when supported.
- Exploring simulated reminder stages and task acknowledgements.

### Caregiver Interface

The caregiver-facing interface demonstrates how a supporter could prepare and review practice activities.

Features include:
- Creating fictional appointments using predefined options.
- Selecting sample events, times, items, and questions.
- Reviewing synthetic interaction summaries.
- Exploring how task preparation and practice history could be organised.

### Clinician Showcase

The clinician-facing showcase illustrates how practice information and decision logic might be presented for review.

Features include:
- Displaying synthetic interaction summaries.
- Presenting illustrative response categories and concept coverage.
- Explaining the rule used to select a follow-up question.
- Providing visibility into the prototype's decision-making logic.

This page is a demonstration interface, not a secure clinical dashboard, patient registry, or diagnostic assessment tool.

## 3. How the Prototype Works

The public demonstration follows a sequence of interactions:

1. **Task preparation:** A caregiver selects a fictional appointment and its associated details.
2. **Memory rehearsal:** The patient interface presents a question about one aspect of the selected plan.
3. **Response evaluation:** JavaScript rules compare the entered response against configured sample concepts.
4. **Follow-up selection:** An explainable rule prioritises a question category with lower recent coverage in the synthetic demo history.
5. **Interaction review:** The resulting summary is displayed in the caregiver and clinician showcase pages.
6. **Reminder simulation:** Users manually advance through demonstration reminder stages.

The answer evaluation and follow-up selection in the public demo are deterministic and rule-based. They do not use a trained clinical model. The reminder controls demonstrate a possible workflow but do not schedule or deliver real notifications.

## 4. Implementation and Features

The project currently has two distinct implementations.

### Public Recruiter Demonstration

The hosted version is a static web application built with HTML, CSS, and vanilla JavaScript.

Implemented features include:
- A project overview and guided walkthrough.
- Separate patient, caregiver, and clinician showcase pages.
- Predefined synthetic tasks and scenarios.
- Browser-side answer evaluation.
- Explainable follow-up question selection.
- Simulated reminder and acknowledgement interactions.
- Shared demonstration state across pages within the same browser profile.
- A reset function for restoring the sample state.
- Responsive layouts and keyboard-accessibility features, including visible focus indicators, form labels, and skip navigation.

The public demonstration has undergone basic checks for page navigation, JavaScript syntax, local interactions, responsive layouts, and network/API request behaviour. These checks do not constitute formal accessibility certification or clinical validation.

### Full Local Application

A separate development version uses a Python-based backend architecture.

The local application includes or explores:
- FastAPI for backend endpoints.
- SQLite for local application data persistence.
- Application-level session and role handling.
- Deterministic response evaluation.
- Rule-based follow-up question selection.
- An optional faster-whisper speech-transcription path in the local development environment.

The precise functionality available depends on the local application's current implementation and configuration.

**The full local backend is not included in this public repository and is not connected to the hosted website.** The public demonstration is a separate, browser-only implementation intended to provide a safe and accessible project showcase.

## 5. System Architecture

The project separates the hosted demonstration from the local application.

| Component | Public demonstration | Local application |
|---|---|---|
| Frontend | HTML, CSS, JavaScript | Local application interface |
| Backend | None | Python and FastAPI |
| Data storage | Browser local storage | SQLite |
| Response evaluation | JavaScript rules | Deterministic application logic |
| Follow-up selection | Explainable JavaScript rule | Rule-based application logic |
| Speech functionality | Optional browser text-to-speech | Optional local faster-whisper path |
| Reminder delivery | Simulated manually | Depends on the implemented local configuration |

### Why Is the Backend Not Published?

The public website is hosted on GitHub Pages, which serves static files. It does not run the Python backend or connect to the local SQLite database.

Keeping the backend separate avoids exposing an unreviewed database, potentially sensitive information, credentials, or development configuration. Publishing a backend would require a separate review, reproducible setup instructions, synthetic test data, appropriate security controls, and a suitable hosting environment.

The public site does not provide accounts, server-side persistence, remote AI services, or real notification delivery.

## 6. User Interface and Design Rationale

The interface uses a teal-green, white, and light-neutral colour palette to create a consistent, uncluttered visual experience.

The palette is a design decision rather than a clinically validated intervention. Its purpose is to support a clear visual hierarchy and a calm presentation.

### Colour Palette

| Colour | Hex value | Design purpose |
|---|---|---|
| Primary teal-green | `#145C53` | Primary actions and visual identity |
| Deep teal | `#0C443D` | Stronger emphasis and dark surfaces |
| White | `#FFFFFF` | Card backgrounds and content separation |
| Pale neutral green | `#F3F7F6` | Main page background |
| Soft mint | `#E5F2EE` | Subtle highlights and selected states |
| Amber | `#FFF4DE` | Cautionary and explanatory notices |

### Design Principles

The interface emphasises:
- **Clarity:** Short instructions and one main question at a time.
- **Consistency:** Repeated navigation, layouts, and interaction patterns.
- **Readability:** Dark text on light backgrounds and clearly separated content.
- **Reduced visual complexity:** Restrained decoration and generous spacing.
- **Accessibility:** Visible keyboard focus, labelled controls, responsive layouts, and semantic page structure.
- **Predictability:** Clear feedback and explicit controls for advancing or resetting the demonstration.

These principles are intended to make the interface easier to navigate. Their effectiveness for people with dementia or other cognitive difficulties would need to be evaluated through accessibility testing and feedback from people with relevant lived experience.

## 7. Technology Stack

### Public Demonstration

- HTML5
- CSS3
- Vanilla JavaScript
- Browser local storage
- Browser text-to-speech, when supported

### Local Development Application

- Python
- FastAPI
- SQLite
- Deterministic response evaluation
- Rule-based follow-up question selection
- Optional faster-whisper speech transcription

The hosted demonstration does not use a large language model, retrieval-augmented generation service, or trained clinical prediction model. Its interactive behaviour is implemented through client-side JavaScript and transparent rules.

## 8. Privacy and Safety

The public demonstration is designed to operate with synthetic sample data.

- Do not enter real patient details or personal health information.
- The public website does not create accounts or provide secure clinical access.
- Typed answers are evaluated in the browser and discarded.
- Only limited synthetic result information is retained in browser-local storage.
- Demonstration state is not synchronised between devices or browsers.
- Reminder stages are simulated and do not trigger real notifications.
- The clinician showcase displays illustrative demo summaries, not validated clinical scores.

MemoryLoop AI must not be used to diagnose dementia, monitor a real patient's condition, make treatment decisions, or replace professional healthcare.

## 9. Testing and Validation Status

The public demonstration has undergone basic functional and interface checks, including navigation, interaction flows, JavaScript syntax, responsive behaviour, and verification that the static demo does not make API requests.

These checks establish basic software behaviour only. They do not demonstrate clinical effectiveness, improved memory performance, diagnostic accuracy, or suitability for real-world healthcare use.

Clinical evaluation and usability testing with appropriate participants would be necessary before making claims about real-world benefits.

## 10. Future Development

Potential future work includes:

- Reviewing and publishing the local backend with setup documentation.
- Adding reproducible synthetic fixtures and automated tests.
- Deploying a backend with appropriate authentication and security controls.
- Connecting the frontend to a securely configured API.
- Improving accessibility through structured usability testing.
- Exploring additional personalisation and speech-interaction capabilities.
- Evaluating the interaction design with caregivers and people with relevant lived experience.

Any deployment for actual healthcare use would require appropriate clinical, privacy, security, accessibility, and regulatory review.

## Project Status

**Current status:** Interactive portfolio prototype with a publicly hosted static demonstration. The full backend remains local and separate from the hosted website.

MemoryLoop AI demonstrates a structured memory-rehearsal concept, multiple user perspectives, browser-side interaction logic, and explainable rule-based behaviour. It provides a foundation for further software engineering, accessibility evaluation, and responsible exploration of cognitive-support technologies.

---

**Developed as an educational technology prototype exploring structured and accessible memory-rehearsal interactions.**
