# Bonafide — How It Flows

The person's journey through the system, in plain words.

## Flow 1: Papers go in, a letter comes out

1. The person opens Bonafide (anonymous login, no sign-up) and uploads their bank message, statement and proof straight to Firebase Storage.
2. The app tells the server "my papers are here". The server saves that as an event and starts the agents in the background.
3. **Reader** (AI) reads the papers → **Sorter** (AI) checks the case is genuine and catches "I let someone use my account" (those go to free legal aid with no letters) → **plain code** does the money maths (frozen / disputed / release) → the **Rule finder** (AI + embeddings) searches the rule library by meaning → the **Writer ⇄ Checker** loop (AI) writes the letter and fact-checks every quote word-for-word, scoring it with Google's grounding check.
4. Every step shows live on the phone. The case lands on LETTER_READY with the evidence pack, the plan and the draft letter.

## Flow 2: Approve, send, and the clocks start

1. The person fills in their name, approves the letter, and records sending it to the right
   recipient with the date: bank (branch, email, WhatsApp or post), police (post or email),
   District Grievance Officer (email or post), or a lawyer (in person or email).
2. The server starts the official deadlines in plain code: bank files the grievance within
   7 days, police/district decide within 15, backstop at 75/90 days, plus the person's own
   15-day deadlines. All appear on the timeline.

## Flow 3: A deadline passes, the agents wake up

1. Every hour, Cloud Scheduler calls the server: "any deadline passed?"
2. For each missed deadline, the **Case boss** (AI) reads the case and prepares the next step — a reminder to the branch, an escalation to the district officer, or notes for a lawyer. When the district officer also misses their 15 days, the self-help path ends and the case moves to the court step.

## Flow 4: A reply arrives

1. The person uploads the bank's or police's reply (photo, PDF or typed text).
2. The **Reader** extracts the milestone (grievance filed, hold limited, fully released, refused…), and the **Case boss** moves the case on: starts or meets the right clocks, drafts the next letter, or marks the case partly/fully released.

## Flow 6: When the police fail — the court step

1. If the police do not release the surplus within their 15-day clock (or reply without
   releasing it), the next escalation is the District Grievance Officer; if that also
   fails, the self-help path ends.
2. Bonafide prepares **L5 notes for a lawyer** — never a petition — cancels the remaining
   self-help clocks and moves the case to `NEEDS_LAWYER`.
3. The app shows free legal aid (DLSA/NALSA, 15100) and the notes under "Your letters".
   The person takes them to a lawyer; Bonafide files nothing.

## Flow 5: Demo mode for judges

1. One tap creates a fake case (Ravi the phone-shop owner, Meera the freelancer, Arjun the crypto seller, Sunil — the "lent my account" trap).
2. A "skip ahead" button moves the pretend date forward so the deadline flow can be shown live, without waiting real days. All data is fake.

## Flow 0: Getting started (for developers)

- `backend/` — Spring Boot on Java 25. `./mvnw test` (94 tests), `-Plive` (live smoke), `-Peval` (12-case evaluation).
- `firebase/` + `firebase.json` — database rules, storage rules, indexes.
- `scripts/` — `deploy.sh` (Cloud Run), `e2e.sh` (21 end-to-end checks), `smoke.sh`.
- `data/rules/` — the rule library source texts (MHA SOP, BNSS s.106); loaded into Firestore with the `load-rules` profile.
- `eval/` — the 12 fake evaluation cases.
