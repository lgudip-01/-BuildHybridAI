# #BuildHybridAI 2026: rules and requirements

A summary of the hackathon's [overview](https://firebasehybridaihackathon.devpost.com/), [official rules](https://firebasehybridaihackathon.devpost.com/rules) and [resources](https://firebasehybridaihackathon.devpost.com/resources) pages, as read on November 17, 2026. The official rules on Devpost win wherever this file differs. The last section tracks where Clause Guard stands against each requirement.

## Key dates

All times are Pacific Time (PT).

| What | When |
| --- | --- |
| Submission period | Nov 11, 2026, 1:30 PM to **Nov 30, 2026, 2:00 PM** (5:00 PM ET) |
| Judging | Dec 10, 2026, 9:00 AM to Dec 16, 2026, 2:00 PM |
| Winners announced | On or around Dec 21, 2026, 12:00 PM |
| Last Google Account Quota request (sprint 3) | Wed Nov 25, 10:00 AM; the account arrives Fri Nov 27 and lasts 4 days |

- After the deadline the Devpost submission is locked, though the project page in your portfolio can still change.
- **Commits pushed to the repo after the deadline are not evaluated.**

## Who can enter

- Everyone on the team must be over the age of majority where they live (20 in Taiwan), with internet access as of Nov 11, 2026.
- Not eligible: residents of, or organizations based in, Brazil, Quebec, Crimea, Russia, Italy, Syria, Sudan, Belarus, Cuba, Iran, North Korea or any other country under US OFAC sanctions, and anyone under US export controls or sanctions.
- Also not eligible: employees, interns, contractors and office-holders of Google, Devpost and the other organizations running the contest, and their immediate families and households.
- You can enter as an individual, a team or an organization.
  - **Every team member must be eligible and added as a member of the project on Devpost.**
  - One person, the Representative, submits for the team, and any cash prize is paid to them.
- One team can submit more than one project if each is substantially different.

## What to build

- **A generative AI app on Firebase AI Logic with hybrid inference.** Prompts run on the device when a local model is available and fall back to the cloud when it isn't.
- **At least one platform**, all through Firebase AI Logic:
  - **Web (Chrome):** Gemini Nano 4, as a web app or a Chrome extension.
  - **Android:** Gemini Nano 4.
  - **iOS:** Apple Foundation Models for running on the device.
- **App Check is required by Firebase AI Logic.** Debug tokens are accepted in submissions.
  - Also encouraged: Remote Config, Firestore and Authentication.
- **Apps that run across several platforms get strong consideration for the Grand Prize.** An outstanding single-platform app can still win.
- **Tools:** any IDE or AI coding tool is allowed, such as Antigravity, Android Studio, Claude Code, Codex or Cursor, as long as the app's AI runs on Firebase AI Logic. Google's tools and the Firebase Agent Skills are recommended.
- **The project must be new, or an existing app significantly updated during the submission period.**
  - Disclose any pre-existing code or work in the project. Standard frameworks, libraries, starter templates and AI coding assistants are fine.
  - For an existing app, summarize what was built during the submission period.
- **It must install and run consistently on its platform,** and work as shown in the video and the text description.
- **It must be free of charge,** and all submission materials must be in English.
- **Third-party SDKs, APIs and data** are allowed only if you're authorized to use them.
- **Ownership:** the submission must be the team's original work, owned only by the team, and must not infringe anyone else's rights.

## What to submit on Devpost

A working demo app, a public repo, a demo video and a text description are all required.

1. **Text description:** how the project uses Firebase AI Logic, its features and functionality, and its value proposition.
2. **Code repository** on GitHub or GitLab:
   - It must be public, with all the source code, assets and instructions needed to run the project, and the value proposition.
   - Firebase AI Logic must be **imported and actually called at runtime** in the code, not just named in the README.
3. **Open source license:** a license file that GitHub detects and shows in the repo's About section. Apache is preferred, but any open source license is accepted.
4. **Demo video:**
   - 3 minutes or less; only the first 3 minutes are judged.
   - Public on YouTube, with the link on the submission form.
   - In English, or with English subtitles.
   - Shows the project running on the platforms it was built for.
5. **Platform:** select at least one on the form. The submission competes in the platforms selected, and the organizers may move it to another category.

Strongly encouraged: a link where judges can try the project, such as a hosted web app, the Chrome extension or the mobile app.

## Judging

- **Stage one is pass or fail.** The submission must include every required item, reasonably address the challenge and apply the requirements.
- **Stage two scores four equally weighted criteria from 1 to 5,** and the scores are averaged:

| Criterion | What judges ask |
| --- | --- |
| Technological implementation | How well is it built, and how effectively does it use Firebase AI Logic hybrid inference? |
| Design | Is it a complete, coherent product experience, not just a technical proof of concept? |
| Potential impact | Does it make a credible, specific case for solving a real problem for a real audience, backed by what's demonstrated? |
| Quality of the idea | Is it a creative, non-obvious use of Firebase AI Logic, and does the team understand the problem space? |

- **Winners:** the highest score in each category wins that category, and the highest score overall wins the Grand Prize.
- **Ties** are broken by comparing scores criterion by criterion in the order above; if still tied, the judges vote.
- **How judging is done:** it may use expert panels, peer review, AI-driven analysis, or a mix.

## Prizes

$30,000 in total.

| Prize | Cash | Extras |
| --- | --- | --- |
| Grand Prize | $10,000 | Interview, featured blog post, social media mention |
| 1st Runner Up | $7,000 | Featured blog post, social media mention (the overview page also lists an interview) |
| 2nd Runner Up | $4,000 | Social media mention |
| Best Web/Chrome App | $3,000 | Social media mention |
| Best Android App | $3,000 | Social media mention |
| Best iOS App | $3,000 | Social media mention |

- A submission can win one of the top three prizes and at most one "Best of" prize.
- Potential winners must reply within 3 business days of being contacted, and they must complete verification and affidavits.

## Resources

- **Build session:** a recorded live build of a hybrid app with Cynthia Jiang from the Firebase team (Nov 12). The link is on the Resources page.
- **Docs:** Firebase AI Logic overview, hybrid inference concepts and setup, hybrid prompting, the production checklist (App Check, Remote Config, Firestore, Authentication), and the guides for web, Android and iOS. All are linked from the Resources page.
- **Firebase Agent Skills,** for coding agents such as Antigravity, Claude Code, Codex and Cursor.
- **Help:** the #BuildHybridAI channel on the Devpost Discord, including #hackathon-help.
- **Free tier:** text inference with Firebase AI Logic is free within usage limits. Image generation and other billed models need a Google Account Quota request.

## Where Clause Guard stands

As of November 17, 2026. Stage one is pass or fail, so every unchecked **required** item below can disqualify the submission.

| Requirement | Status | Owner |
| --- | --- | --- |
| Firebase AI Logic imported and called at runtime (required) | Done: `apps/web/src/webBridge.ts` runs Gemini Nano through `getGenerativeModel` and `generateContent` | Likhil Gudipati |
| Hybrid inference: on-device with cloud fallback (core of the challenge) | On-device masking works; the cloud call `analyze()` is still a stub | Dhruv Vyas |
| App Check (required by Firebase AI Logic) | Not in the code yet | Dhruv Vyas |
| Web (Chrome) app runs | Done: on the six sample contracts, Gemini Nano masks 70/70 values and keeps 34/34 terms | Likhil Gudipati, Sai Nagadheeraj Kamsani |
| Android and iOS apps (Grand Prize consideration) | Scaffold and iOS project merged; native AI calls not done | Aarush Goel |
| Public repo with an open source license shown in About (required) | Done: public, MIT | Team |
| Instructions to run the project in the repo (required) | Done: "Run it locally" in the README | Likhil Gudipati |
| Hosted web app to test (encouraged) | Not started (Firebase Hosting) | Dhruv Vyas |
| Demo video, 3 minutes or less, public on YouTube, English (required) | Not started | Varun Akella |
| Devpost text description and platform selection (required) | Not started | Varun Akella |
| All five members added to the Devpost project (required) | Not confirmed | Varun Akella |
| Every member confirms eligibility | Not confirmed | Team |
| Last commit before Nov 30, 2:00 PM PT | Plan to freeze the repo the morning of Nov 30 | Team |
