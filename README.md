# BCC website

React + Vite + React Router.

```sh
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
npm run lint
```

## Where things live

- `src/siteInfo.js` – name, address, phone, email, opening hours (and holiday closures), Instagram, delivery links, and the WhatsApp number + pre-filled message (used by the chat bot, the chat widget and the footer).
- `src/chatConfig.js` – everything the chat bot says, in English and German: welcome message, topics (Hours, Location, Services, Our food, Wolt, Catering, Talk to human), FAQs, small talk and fallback replies. Each answer has example questions and keywords for matching. `TO CONFIRM` marks answers waiting for details from the client.
- `src/menu.js` – the menu (dishes, prices, vegetarian/vegan marks, allergens), copied from the menu images on bccstuttgart.de; the bot answers dish questions from it. Two `CHECK` comments mark allergen labels on the printed menu that look wrong.
- `src/chatReplies.js` – `getReply()`: the website chat asks the server (`POST /api/chat`) for each answer.
- `src/pages/` – one file per page: Home, About, Menu, Weekly Specials, Blog, Contact (orders + catering), Allergens, Impressum, Datenschutz.
- `src/components/` – `Layout` (header + page + footer + chat widget), `Header`, `Footer`, `ChatWidget`, `ChatIcons`, `LogoMark`, `Placeholder`, and the Home sections `NamasteGreeting` (greetings that arrive one by one as if from far away), `AboutSection`, `FactSection` (the "Did you know?" bands) and `ReviewsSection`.
- `src/pages/About.jsx` – the About Us page, laid out after its design: hero over giant letters, the story on three photos along a circle (the one in the middle of the screen lights up), the banana tree, the founders. Its texts are a DRAFT at the top of the file; the founders' names, photo and story are placeholders until the client sends them. It has a light header bar (`Header.jsx`). Artwork in `src/assets/about/`.
- `src/pages/WeeklySpecials.jsx` + `src/weeklySpecial.js` – the weekly special page ("Our Specials" in the menu), laid out after its design: the region's thali, a "Did you know?", and the thali's dishes along a road the auto-rickshaw drives down as you scroll. To change the special, edit `src/weeklySpecial.js` (texts, dishes, images in `src/assets/weekly/`); the road has places for eight dishes. The thali picture is put together from the dish images until there's a photo.
- `src/assets/home/` – Home page artwork: hero photo (`hero-dosa-*.jpg`, 1728px and 960px for phones), the Namaste greetings (`namaste/`, one image per word, cut from the design; their positions are in `src/namasteWords.js`), landmark skyline, peacock, tiger and star anise.
- `src/App.jsx` – the routes.

## Chat flow

1. The bot button (bottom right) opens the chat, styled like WhatsApp. The bot greets and answers from `src/chatConfig.js` and `src/menu.js`, via the server (see "How the bot picks an answer" below). It never makes up text: every answer is written in those files.
2. "Talk to human" (green, WhatsApp logo; it appears once the visitor has sent two messages, `HUMAN_AFTER_MESSAGES` in `ChatWidget.jsx`) – or typing e.g. "can I talk to someone" – shows an **Open WhatsApp** button: WhatsApp opens a chat with our team (`siteInfo.whatsapp.number`, Ruchika's phone) with `siteInfo.whatsapp.message` pre-filled, plus "No WhatsApp? Email us at …". This works even if the server is down.
3. Auto greeting / away messages on WhatsApp are set in the WhatsApp Business app on that phone (Business tools), not here.

### How the bot picks an answer

`server/replyRules.js` handles each message:

- **Small talk** ("hi", "thanks!", "bye") gets a short reply. A greeting in front of a question is answered together with the question.
- **Dishes** (`server/menuAnswers.js`): a message that names a dish – with typos, e.g. "biriyani" – gets its price, allergens, whether it's vegetarian/vegan, or a full card. "lassi" or "chicken" lists the matching dishes. Allergen answers only repeat the menu's labels and always point to our team; the bot never says a dish is safe.
- **Everything else** is compared by meaning with each answer's `examples` (`server/semantic.js`, a small multilingual language model that runs on the server – no outside service sees the messages), with a head start for `keywords`. If the bot is sure it answers; if two answers are close it asks "is it one of these?" with suggestion buttons; if nothing fits it says so and offers "Talk to human".
- **Several questions** in one message ("open on Sunday and do you deliver?") get an answer each, as separate messages.
- **Follow-ups**: the chat sends the previous reply's `context` back, so "how much is it?" or "and the keema pav?" refer to the dish before.
- **Language**: replies are German when the message is, English otherwise.
- **Hours** say whether we're open right now (Stuttgart time) and mention closures in the next two weeks.

The model (about 130 MB) downloads into `server/.models/` on the server's first start; until it's ready the bot matches keywords only. Questions the bot couldn't answer are written to `server/logs/unanswered.jsonl` (emails and phone numbers masked) – read them now and then and add examples or answers to `src/chatConfig.js`.

After changing answers, examples or the thresholds in `replyRules.js`, run `npm run check` in `server/`: it asks the bot ~65 sample questions (`server/check-replies.js`) and shows any that now get the wrong answer.

## Server

`server/` is a small Node + Express app. It answers the website chat; it can also talk to the WhatsApp Cloud API (Meta), which is off and not part of the current flow (`WHATSAPP_ENABLED=false`). Its settings live in `server/.env`, which is not committed (see `server/.env.example`).

```sh
cd server
npm install
npm run dev      # http://localhost:3001, restarts on file changes
```

The website chat needs this server: run `npm run dev` in `server/` next to `npm run dev` for the site (Vite forwards `/api` to port 3001). When deploying, the host must send `/api` requests to the server.

- `GET /api/health` – checks the server is up.
- `POST /api/chat` – the website chat's answers: `{ "text": "…" }` (typed) or `{ "topic": "hours" }` (a button, by answer id), plus the `context` from the previous reply → `{ replies: [{ text, link?, handoff?, suggestions? }], context }`. `handoff: true` shows the WhatsApp button; `suggestions` are follow-up buttons.

### WhatsApp Cloud API (optional, off)

Only with `WHATSAPP_ENABLED=true` in `server/.env`:

- `POST /api/whatsapp/test` – sends the `hello_world` template to `WHATSAPP_TEST_RECIPIENT`.
- `POST /api/whatsapp/test-text` – sends plain text (optional JSON body `{"text": "..."}`) to the same number. Only arrives if that number messaged the business in the last 24 hours.

Both test routes are off when `NODE_ENV=production`.

- `GET/POST /api/whatsapp/webhook` – Meta calls this with incoming messages and delivery updates (sent, delivered, read, failed + error code), which are printed in the server log. Checked against `WHATSAPP_APP_SECRET`, which is required in production.

**WhatsApp bot.** Each incoming message gets an automatic reply, picked in `server/replyRules.js` like the website chat's, plus a menu number ("2") for a topic; a greeting and the fallback come with the numbered menu. Edit the texts and keywords in `src/chatConfig.js`. With `WHATSAPP_DRY_RUN=true` (the default) replies are only printed in the server terminal; set it to `false` to send them.

### Webhook on your own computer (ngrok)

Meta needs a public https address, so locally the webhook runs through an ngrok tunnel. One-time setup: create a free account at ngrok.com, then `ngrok config add-authtoken <your ngrok authtoken>`.

1. `npm run dev` in `server/` (terminal 1), then `npm run tunnel` (terminal 2) and copy the `https://….ngrok-free.app` forwarding address.
2. Meta App Dashboard → WhatsApp → Configuration → Webhook → Edit: Callback URL `https://<that address>/api/whatsapp/webhook`, Verify token = `WHATSAPP_WEBHOOK_VERIFY_TOKEN` from `server/.env` → Verify and save.
3. Under Webhook fields, subscribe to `messages`.

ngrok shows every request it forwards at http://localhost:4040.

The temporary access token from Meta's API Setup page expires after about 24 hours. Generate a new one there, paste it into `server/.env` and restart.

## Deploying

The site uses client-side routing, so the host must serve `index.html` for every path (e.g. `/menu`), otherwise refreshing a subpage gives a 404.
