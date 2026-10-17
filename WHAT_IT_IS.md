# What Bonafide Is

**Bonafide is a long-running AI case agent that helps innocent people in India get a wrongly frozen bank account released — fast, fairly, and step by step.**

## The problem

In India, when someone reports online fraud, the police freeze every bank account the money passed through. A shopkeeper who was simply paid ₹2,000 by UPI can find their **whole account** — ₹1.8 lakh of rent and stock money — frozen for months, often by a police station in another state, with no notice.

- 65.89 lakh financial-fraud complaints (2021–25); ₹8,189 crore placed on hold.
- A wine shop: a ₹1,000 UPI payment froze its ₹8.26 lakh account for ~10 months.
- A shoe shop: a ₹1,700 payment blocked over ₹20,000 for almost 6 years.
- The rules finally exist (MHA SOP, 2 Jan 2026, plus High Court rulings) — but almost nobody knows how to use them.

## What it does

1. **Reads the papers** — bank message, statement, bills, chats — and shows only quotes it found word-for-word.
2. **Checks the case is genuine** — with up to 3 quick questions — and catches "I let someone use my account" (those go to free legal aid, no letters).
3. **Does the money maths in plain code**: frozen ₹1,80,000 · disputed ₹2,000 · release ₹1,78,000.
4. **Builds the evidence pack** around the five things officers check.
5. **Writes and checks the letters** — one AI writes, another checks every quote word-for-word, and Google's grounding check scores each letter. The person approves and sends everything themselves.
6. **Keeps the case moving for weeks** — tracks every official deadline (7 / 15 / 15 / 90 days plus the person's own), wakes up hourly when one passes, reads replies, and prepares the next step — until the money is released.

## The agent team (Google ADK)

| Agent | Model | Job |
|---|---|---|
| Reader | Gemini 3.8 Flash | Reads the papers, extracts the facts |
| Sorter | Gemini 3.5 Flash-Lite | Genuine? Victim? Lent account? |
| Rule finder | Gemini + embeddings | Finds the exact rules and rulings |
| Writer ⇄ Checker | Flash + Flash-Lite loop | Writes the letter, checks every quote |
| Case boss | Gemini 3.8 Flash | Long-running coordinator, woken by the hourly tick |

Money and dates never touch an AI — they are plain, fully-tested code.

## Trust and safety

- **Self-help only.** The person approves and sends every letter. Bonafide never contacts anyone, never asks for money, never gives legal advice.
- **Rules come only from the rule library**; code checks every quote word-for-word; Check Grounding scores every letter.
- **Papers are data, never instructions** — screened by Model Armor against prompt injection.
- **Privacy**: last 4 digits of account numbers only, private files, one-tap delete, auto-delete after 90 days. All demo data is fake.
- **Links go only to *.gov.in, nalsa.gov.in, cybercrime.gov.in** and the person's own bank.

## Built on Google Cloud

Cloud Run (always-on Spring Boot service) · Firebase (Hosting, anonymous Auth, Firestore, Storage) · Vertex AI Gemini · Firestore vector search over the rule library · Check Grounding · Model Armor · Cloud Scheduler.

## Results

94 automated tests green · live smoke 4/4 · end-to-end 21/21 · evaluation: 12/12 case statuses, money 100% correct, traps 3/3 caught, hidden instructions ignored.
