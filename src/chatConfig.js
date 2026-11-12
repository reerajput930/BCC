import { dishes, menuSections } from './menu.js'
import { hoursLines, siteInfo } from './siteInfo.js'

// What the website chat bot knows and says. The answers are picked in the visitor's browser
// (src/chatbot/replies.js); questions about single dishes are answered from src/menu.js
// (src/chatbot/menuAnswers.js).
//
// Each answer has:
// - id: stable name, used by the topic buttons, suggestions and logs.
// - label: { en, de } button and suggestion text.
// - examples: ways people ask for it, English and German. A message that shares words with an
//   example (typos allowed) leans towards that answer, so varied, natural questions help most.
// - keywords: count most. A word in the message that starts with one matches ('deliver' also
//   finds 'delivery'); one with a space ('pick up') matches those words in a row.
// - exact: short words that only count on their own ('wo', not 'woche').
// - reply: { en, de }. A list picks one text at random; a function gets the language.
// - link: { label: { en, de }, href } to another site, or { label, page, hash? } for a page of
//   this site in the visitor's language (page: a key of `pages` in src/i18n.js).
// - handoff: shows the "Open WhatsApp" button to reach our team.
// - related: ids of answers offered as follow-up suggestions.
// German answers use "Sie". TO CONFIRM marks answers waiting for details from the client.

const { street, postcode } = siteInfo.address
const fullAddress = `${street}, ${postcode} Stuttgart-Vaihingen`
const phone = siteInfo.phone.display

const euro = (price, lang) =>
  lang === 'de' ? `${price.toFixed(2).replace('.', ',')} €` : `€${price.toFixed(2)}`

const dishNames = (diet) =>
  dishes
    .filter((dish) => dish.diet === diet)
    .map((dish) => dish.name)
    .join(', ')

// "Starters €5.00–6.50" for each menu section, from src/menu.js
function priceRanges(lang) {
  return menuSections.map((section) => {
    const prices = dishes.filter((dish) => dish.section === section.id).map((dish) => dish.price)
    const low = euro(Math.min(...prices), lang)
    const high = euro(Math.max(...prices), lang)
    return `• ${section.name}: ${low === high ? low : `${low}–${high}`}`
  })
}

export const chatConfig = {
  welcome: {
    en: 'Hi! 👋 Ask me about our food, hours or catering – in English or German.',
    de: 'Hallo! 👋 Fragen Sie mich nach Essen, Öffnungszeiten oder Catering – auf Deutsch oder Englisch.',
  },

  // Shown as buttons in the website chat and as a numbered menu on WhatsApp
  quickReplies: [
    {
      id: 'hours',
      label: { en: 'Hours', de: 'Öffnungszeiten' },
      examples: [
        'What are your opening hours?',
        'When are you open?',
        'Are you open now?',
        'Are you open on Sunday?',
        'What time do you close tonight?',
        'What are your timings?',
        'When can I come by?',
        'Are you open on holidays?',
        'Wann haben Sie geöffnet?',
        'Öffnungszeiten',
        'Habt ihr heute offen?',
        'Wann macht ihr zu?',
        'Bis wann kann man kommen?',
      ],
      keywords: [
        'hour', 'open', 'clos', 'timing', 'timming', 'time', 'today', 'tonight', 'weekend',
        'monday', 'tuesday', 'wednesday', 'thursday', 'saturday', 'sunday',
        'öffnungszeit', 'geöffnet', 'offen', 'heute', 'feiertag', 'uhrzeit', 'wochenende',
        'montag', 'dienstag', 'mittwoch', 'donnerstag', 'samstag', 'sonntag', 'macht ihr zu', 'habt ihr auf',
      ],
      // The server adds whether we're open right now and any closures in the coming days
      reply: (lang) =>
        `${lang === 'de' ? 'Unsere Öffnungszeiten:' : 'Our opening hours:'}\n${hoursLines(lang).join('\n')}`,
      related: ['location', 'services'],
    },
    {
      id: 'location',
      label: { en: 'Location', de: 'Adresse' },
      examples: [
        'Where are you?',
        'What is your address?',
        'How do I get to the restaurant?',
        'Where can I find you?',
        'Which part of Stuttgart are you in?',
        'Wo sind Sie?',
        'Wo seid ihr?',
        'Wie ist Ihre Adresse?',
        'Wie komme ich zu euch?',
      ],
      keywords: ['where', 'location', 'address', 'find', 'direction', 'map', 'vaihingen', 'adresse', 'anfahrt', 'standort', 'komme ich', 'finde ich'],
      exact: ['wo'],
      reply: {
        en: `You’ll find us at ${fullAddress} 📍`,
        de: `Sie finden uns in der ${fullAddress} 📍`,
      },
      link: {
        label: { en: 'Open in Google Maps', de: 'In Google Maps öffnen' },
        href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${siteInfo.name}, ${street}, ${postcode} Stuttgart`)}`,
      },
      related: ['hours', 'pickup'],
    },
    {
      // TO CONFIRM: dine-in and seating
      id: 'services',
      label: { en: 'Services', de: 'Angebot' },
      examples: [
        'What services do you offer?',
        'Can I eat at the restaurant?',
        'Do you do takeaway?',
        'What can I order from you?',
        'Welche Services bieten Sie an?',
        'Kann man bei euch essen?',
      ],
      keywords: ['service', 'offer', 'angebot'],
      reply: {
        en: 'Here’s what we offer:\n🥡 Pickup – 15% off when you collect your order yourself\n🛵 Delivery through Wolt and Uber Eats\n🎉 Catering for your events\n🍛 Thalis and specials that change every week',
        de: 'Das bieten wir an:\n🥡 Selbstabholung – 15 % Rabatt, wenn Sie selbst abholen\n🛵 Lieferung über Wolt und Uber Eats\n🎉 Catering für Ihre Feiern\n🍛 Thalis und Specials, die jede Woche wechseln',
      },
      related: ['pickup', 'wolt', 'catering'],
    },
    {
      // CHECK wording of the three kitchens with the client
      id: 'food',
      label: { en: 'Our food', de: 'Unser Essen' },
      examples: [
        'What food do you serve?',
        'What is on the menu?',
        'What kind of Indian food do you make?',
        'What is Goan, Dakshin or Nawabi food?',
        'Do you have thali?',
        'What do you recommend?',
        'Was gibt es zu essen?',
        'Was steht auf der Speisekarte?',
        'Was empfehlen Sie?',
      ],
      keywords: ['food', 'menu', 'dish', 'recommend', 'cuisine', 'regional', 'speisekarte', 'gericht', 'küche', 'empfehl'],
      reply: {
        en: 'Regional Indian cooking from three kitchens: Goan (from Goa), Dakshin (South India) and Nawabi (rich, royal-style dishes) 🍛\n• Gourmet Teller – a plate with rice\n• Grand Thali – a full platter that changes every week\n• Street-food starters like Vada Pav\n• Biryani on Fridays\n• Lassis and Indian drinks\nAsk me about any dish – its price, allergens or what’s in it.',
        de: 'Regionale indische Küche aus drei Regionen: Goan (aus Goa), Dakshin (Südindien) und Nawabi (reichhaltige, königliche Gerichte) 🍛\n• Gourmet Teller – ein Teller mit Reis\n• Grand Thali – eine große Platte, jede Woche neu\n• Streetfood-Vorspeisen wie Vada Pav\n• Biryani am Freitag\n• Lassis und indische Getränke\nFragen Sie mich nach jedem Gericht – Preis, Allergene oder Zutaten.',
      },
      link: { label: { en: 'See the full menu', de: 'Zur Speisekarte' }, page: 'menu' },
      related: ['prices', 'vegetarian', 'weekly'],
    },
    {
      id: 'wolt',
      label: { en: 'Order', de: 'Bestellen' },
      examples: [
        'Can I order online?',
        'Do you deliver?',
        'Can I get food delivered to my home?',
        'Are you on Wolt or Uber Eats?',
        'How do I order?',
        'Do you deliver to my area?',
        'How much is delivery?',
        'Liefern Sie?',
        'Kann ich online bestellen?',
        'Bringt ihr das Essen nach Hause?',
      ],
      keywords: ['wolt', 'uber', 'order', 'deliver', 'online', 'webshop', 'shop', 'nach hause', 'bestell', 'liefer', 'bring'],
      reply: {
        en: 'Hungry? 🛵 Order in our web shop and pick it up yourself (15% off), or get it delivered with Wolt or Uber Eats – the app shows whether we deliver to your address, the fee and the minimum order.',
        de: 'Hunger? 🛵 Bestellen Sie in unserem Webshop und holen Sie selbst ab (15 % Rabatt), oder lassen Sie liefern – über Wolt oder Uber Eats. Die App zeigt Ihnen, ob wir an Ihre Adresse liefern, die Liefergebühr und den Mindestbestellwert.',
      },
      link: { label: { en: 'All ways to order', de: 'Alle Bestellwege' }, page: 'contact', hash: '#order' },
      related: ['pickup', 'prices'],
    },
    {
      // TO CONFIRM: guest numbers, notice, deposit and packages, then answer them here
      id: 'catering',
      label: { en: 'Catering', de: 'Catering' },
      examples: [
        'Do you do catering?',
        'Can you cater my party?',
        'Food for a wedding or an office event',
        'We need food for 40 guests',
        'How far in advance do I need to book catering?',
        'Macht ihr Catering?',
        'Essen für eine Feier',
        'Catering für unsere Firmenfeier',
      ],
      keywords: ['cater', 'event', 'party', 'parties', 'wedding', 'birthday', 'guests', 'office', 'feier', 'hochzeit', 'geburtstag', 'veranstaltung', 'firmen', 'gäste'],
      reply: {
        en: 'We’d love to cater your event! 🎉 Tell our team the date, the number of guests and where it takes place, and we’ll send you an offer.',
        de: 'Wir kochen gern für Ihre Feier! 🎉 Schreiben Sie unserem Team das Datum, die Anzahl der Gäste und den Ort – wir schicken Ihnen ein Angebot.',
      },
      link: { label: { en: 'Send a catering enquiry', de: 'Catering anfragen' }, page: 'catering', hash: '#enquiry' },
      handoff: true,
      related: ['food', 'prices'],
    },
    {
      // Hands the customer over to our team: the chat shows an "Open WhatsApp" button
      // (siteInfo.whatsapp number + pre-filled message) and the email address as a fallback.
      id: 'human',
      label: { en: 'Talk to our team', de: 'Mit dem Team sprechen' },
      handoff: true,
      examples: [
        'Can I talk to a real person?',
        'I want to speak to someone',
        'How can I contact you?',
        'What is your phone number?',
        'Can I call you?',
        'Kann ich mit jemandem sprechen?',
        'Wie kann ich Sie erreichen?',
        'Telefonnummer',
      ],
      keywords: ['talk', 'speak', 'human', 'person', 'someone', 'staff', 'call', 'phone', 'number', 'email', 'contact', 'whatsapp', 'sprechen', 'mensch', 'anruf', 'telefon', 'kontakt', 'erreich'],
      reply: {
        en: `Tap below to chat with our team on WhatsApp. You can also call us on ${phone}.`,
        de: `Tippen Sie unten, um unserem Team per WhatsApp zu schreiben. Sie erreichen uns auch telefonisch unter ${phone}.`,
      },
      // For the WhatsApp bot (not in use): there the customer is already talking to us
      whatsappReply: `Of course! Write your question here and our team will get back to you. You can also call ${phone} or email ${siteInfo.email}.`,
    },
  ],

  // Frequent questions: answered when a message matches them, but not shown as buttons
  faqs: [
    {
      id: 'vegetarian',
      label: { en: 'Vegetarian & vegan', de: 'Vegetarisch & vegan' },
      examples: [
        'Do you have vegetarian food?',
        'Is there anything vegan?',
        'What can I eat if I don’t eat meat?',
        'Which dishes are plant-based?',
        'Habt ihr vegetarische Gerichte?',
        'Gibt es etwas Veganes?',
        'Was gibt es ohne Fleisch?',
      ],
      keywords: ['veg', 'vegan', 'vegetar', 'plant', 'meat', 'fleisch'],
      reply: (lang) =>
        lang === 'de'
          ? `Ja! 🌱 Vegan: ${dishNames('vegan')}.\nVegetarisch: ${dishNames('vegetarian')}.\nWeitere Gerichte sind auf der Karte nicht gekennzeichnet – fragen Sie gern unser Team.`
          : `Yes! 🌱 Vegan: ${dishNames('vegan')}.\nVegetarian: ${dishNames('vegetarian')}.\nOther dishes aren’t marked on our menu – just ask our team.`,
      related: ['allergies', 'food'],
    },
    {
      id: 'allergies',
      label: { en: 'Allergies', de: 'Allergien' },
      examples: [
        'I have a nut allergy',
        'Which dishes are gluten-free?',
        'Do you have allergen information?',
        'Is there lactose in your food?',
        'Ich habe eine Allergie',
        'Welche Gerichte sind glutenfrei?',
        'Gibt es Allergene-Informationen?',
      ],
      keywords: ['allerg', 'gluten', 'nut', 'lactose', 'dairy', 'intoleran', 'coeliac', 'celiac', 'unverträglich', 'laktose', 'nüsse'],
      reply: {
        en: 'Every dish on our menu lists its allergens (A = gluten, G = milk, H = nuts, and so on). Ask me about a dish – for example “allergens in Vada Pav”.\nIf you have a severe allergy, please check with our team before you order.',
        de: 'Auf unserer Speisekarte stehen bei jedem Gericht die Allergene (A = Gluten, G = Milch, H = Schalenfrüchte usw.). Fragen Sie mich nach einem Gericht – zum Beispiel „Allergene im Vada Pav“.\nBei einer schweren Allergie sprechen Sie bitte vor der Bestellung mit unserem Team.',
      },
      link: { label: { en: 'Allergen information', de: 'Allergen-Informationen' }, page: 'allergens' },
      handoff: true,
    },
    {
      // TO CONFIRM: spice levels per dish
      id: 'spice',
      label: { en: 'Spice level', de: 'Schärfe' },
      examples: [
        'How spicy is the food?',
        'Can you make it mild?',
        'Is it too hot for kids?',
        'Ist das Essen scharf?',
        'Geht es auch weniger scharf?',
      ],
      keywords: ['spic', 'hot', 'mild', 'scharf', 'würzig'],
      reply: {
        en: 'Our team can tell you how hot each dish is 🌶️ Just ask before you order.',
        de: 'Unser Team sagt Ihnen gern, wie scharf ein Gericht ist 🌶️ Fragen Sie einfach vor der Bestellung.',
      },
      handoff: true,
    },
    {
      id: 'pickup',
      label: { en: 'Pickup', de: 'Abholung' },
      examples: [
        'Can I pick up my order?',
        'Do you do takeaway?',
        'Is there a discount for pickup?',
        'Can I collect the food myself?',
        'Kann ich selbst abholen?',
        'Gibt es Rabatt bei Selbstabholung?',
        'Essen zum Mitnehmen',
      ],
      keywords: ['pickup', 'pick up', 'collect', 'takeaway', 'take away', 'discount', 'abhol', 'mitnehmen', 'rabatt'],
      // TO CONFIRM: the web shop (from the old website) and the phone are the ways to order for pickup
      reply: {
        en: `Yes! Order in our web shop or call us on ${phone}, then pick it up at ${street} – you get 15% off when you collect it yourself 🥡`,
        de: `Ja! Bestellen Sie in unserem Webshop oder telefonisch unter ${phone} und holen Sie in der ${street} ab – bei Selbstabholung bekommen Sie 15 % Rabatt 🥡`,
      },
      link: { label: { en: 'Open the web shop', de: 'Zum Webshop' }, href: siteInfo.orderLinks.webshop },
      related: ['hours', 'location'],
    },
    {
      id: 'prices',
      label: { en: 'Prices', de: 'Preise' },
      examples: [
        'How much does the food cost?',
        'What are your prices?',
        'How expensive is it?',
        'How much is a thali?',
        'Was kostet das Essen?',
        'Wie teuer ist es bei euch?',
      ],
      keywords: ['price', 'cost', 'expensive', 'cheap', 'euro', 'preis', 'kost', 'teuer', 'günstig'],
      reply: (lang) =>
        lang === 'de'
          ? `Unsere Preise:\n${priceRanges(lang).join('\n')}\nBei Selbstabholung sparen Sie 15 %.`
          : `Our prices:\n${priceRanges(lang).join('\n')}\nPick up yourself and save 15%.`,
      link: { label: { en: 'See the full menu', de: 'Zur Speisekarte' }, page: 'menu' },
      related: ['pickup', 'food'],
    },
    {
      // TO CONFIRM: what's on this week (the three rotating specials)
      id: 'weekly',
      label: { en: 'Weekly specials', de: 'Thali der Woche' },
      examples: [
        'What are this week’s specials?',
        'What is the special today?',
        'When do you have biryani?',
        'Was gibt es diese Woche?',
        'Was ist das Tagesgericht?',
      ],
      keywords: ['special', 'week', 'friday', 'biryani', 'tagesgericht', 'woche', 'freitag'],
      reply: {
        en: 'Our Grand Thali and Premium Slides change every week, and on Fridays we serve biryani 🍛 Ask our team what’s on this week!',
        de: 'Unser Grand Thali und die Premium Slides wechseln jede Woche, und freitags gibt es Biryani 🍛 Fragen Sie unser Team, was diese Woche auf der Karte steht!',
      },
      link: { label: { en: 'This week’s specials', de: 'Zum Thali der Woche' }, page: 'weekly' },
      handoff: true,
    },
    {
      // TO CONFIRM: payment methods besides PayPal
      id: 'payment',
      label: { en: 'Payment', de: 'Bezahlung' },
      examples: [
        'Can I pay by card?',
        'Do you accept PayPal?',
        'Is it cash only?',
        'How can I pay?',
        'Kann ich mit Karte zahlen?',
        'Welche Zahlungsmittel akzeptieren Sie?',
      ],
      keywords: ['pay', 'card', 'cash', 'paypal', 'zahl', 'karte', 'bar'],
      reply: {
        en: 'You can pay with PayPal – the QR code is on our menu. For other ways to pay, just ask our team.',
        de: 'Sie können mit PayPal bezahlen – den QR-Code finden Sie auf unserer Speisekarte. Zu anderen Zahlungsarten fragen Sie gern unser Team.',
      },
    },
    {
      // The content plan: BCC is a cloud kitchen (pickup, delivery, catering), not a sit-down
      // restaurant. TO CONFIRM with the client.
      id: 'booking',
      label: { en: 'Table booking', de: 'Tisch reservieren' },
      examples: [
        'Can I book a table?',
        'Do I need a reservation?',
        'Table for 6 people tonight',
        'Kann ich einen Tisch reservieren?',
        'Tisch für heute Abend',
      ],
      keywords: ['reserv', 'book', 'table', 'seat', 'tisch'],
      reply: {
        en: 'We’re a cloud kitchen: we cook for pickup and delivery, so there are no tables to book. Order in our web shop and pick it up, or have it delivered with Wolt or Uber Eats. Planning something for a group? Ask us about catering 🎉',
        de: 'Wir sind eine Cloud-Küche: Wir kochen zum Abholen und Liefern, deshalb gibt es keine Tische zu reservieren. Bestellen Sie im Webshop und holen Sie ab, oder lassen Sie über Wolt oder Uber Eats liefern. Etwas für eine Gruppe geplant? Fragen Sie uns nach Catering 🎉',
      },
      related: ['wolt', 'catering'],
    },
    {
      // TO CONFIRM: halal
      id: 'halal',
      label: { en: 'Halal', de: 'Halal' },
      examples: ['Is your meat halal?', 'Do you serve halal food?', 'Is the chicken halal?', 'Ist das Fleisch halal?'],
      keywords: ['halal'],
      reply: {
        en: 'Good question – please ask our team, they’ll tell you all about our meat.',
        de: 'Gute Frage – bitte fragen Sie unser Team, es gibt Ihnen gern Auskunft zu unserem Fleisch.',
      },
      handoff: true,
    },
    {
      // TO CONFIRM: how refunds and complaints are handled
      id: 'complaint',
      label: { en: 'Problem with an order', de: 'Problem mit einer Bestellung' },
      examples: [
        'My order was wrong',
        'I want a refund',
        'The food was cold',
        'I have a complaint',
        'Meine Bestellung war falsch',
        'Ich möchte mich beschweren',
      ],
      keywords: ['refund', 'complain', 'wrong', 'missing', 'beschwer', 'erstatt', 'falsch', 'fehlt'],
      reply: {
        en: 'Sorry to hear that! 😔 Please tell our team directly and they’ll sort it out. If you ordered on Wolt or Uber Eats, you can also report it in the app.',
        de: 'Das tut uns leid! 😔 Bitte melden Sie sich direkt bei unserem Team, wir kümmern uns darum. Wenn Sie über Wolt oder Uber Eats bestellt haben, können Sie es auch in der App melden.',
      },
      handoff: true,
    },
    {
      id: 'about',
      label: { en: 'About us', de: 'Über uns' },
      examples: [
        'Who are you?',
        'Tell me about the restaurant',
        'What is Beyond Chai & Curry?',
        'Wer seid ihr?',
        'Erzählen Sie mir etwas über das Restaurant',
      ],
      keywords: ['about', 'story', 'über', 'geschichte'],
      reply: {
        en: 'We do not just serve food – we serve culture! ✨ Beyond Chai & Curry brings regional Indian cooking to Stuttgart-Vaihingen, and we’ve served more than 10,000 thalis so far.',
        de: 'Wir servieren nicht nur Essen – wir servieren Kultur! ✨ Beyond Chai & Curry bringt regionale indische Küche nach Stuttgart-Vaihingen – mehr als 10.000 Thalis haben wir schon serviert.',
      },
      link: { label: { en: 'Our story', de: 'Unsere Geschichte' }, page: 'about' },
      related: ['food'],
    },
    {
      id: 'instagram',
      label: { en: 'Instagram', de: 'Instagram' },
      examples: ['Are you on Instagram?', 'Do you have social media?', 'Seid ihr auf Instagram?'],
      keywords: ['instagram', 'insta', 'social', 'facebook'],
      reply: {
        en: 'Follow us on Instagram for news and specials 📸',
        de: 'Folgen Sie uns auf Instagram für Neuigkeiten und Specials 📸',
      },
      link: { label: { en: 'Open Instagram', de: 'Instagram öffnen' }, href: siteInfo.instagram },
    },
    {
      id: 'assistant',
      label: { en: 'About this chat', de: 'Über diesen Chat' },
      examples: ['Are you a bot?', 'Am I talking to a real person?', 'Are you human?', 'Bist du ein Bot?'],
      keywords: ['bot', 'robot', 'chatbot'],
      reply: {
        en: 'I’m the Beyond Chai & Curry assistant 🤖 I can answer questions about our food, hours and services. For a real person, just ask to talk to our team.',
        de: 'Ich bin der Assistent von Beyond Chai & Curry 🤖 Ich beantworte Fragen zu Essen, Öffnungszeiten und Services. Für eine echte Person fragen Sie einfach nach unserem Team.',
      },
    },
  ],

  // Short messages that are only chit-chat: every word is one of these `words` or smallTalkFiller.
  // The first kind with a word in the message wins.
  smallTalk: [
    {
      id: 'bye',
      words: ['bye', 'goodbye', 'cya', 'ciao', 'tschüss', 'tschüs', 'tschau', 'wiedersehen', 'auf'],
      reply: { en: 'Bye! Hope to see you soon 👋', de: 'Auf Wiedersehen! Bis bald 👋' },
    },
    {
      id: 'thanks',
      words: ['thanks', 'thank', 'thx', 'ty', 'cheers', 'danke', 'dankeschön', 'dank', 'merci'],
      reply: {
        en: ['You’re welcome! 😊', 'Happy to help! 😊 Anything else?'],
        de: ['Gern geschehen! 😊', 'Sehr gerne! 😊 Kann ich sonst noch helfen?'],
      },
    },
    {
      id: 'greeting',
      words: ['hi', 'hii', 'hy', 'hey', 'hello', 'helo', 'hallo', 'namaste', 'servus', 'moin', 'hola', 'morning', 'evening', 'guten', 'morgen', 'tag', 'abend'],
      reply: {
        en: ['Hi! 👋 How can I help? Ask me about our food, hours or catering.', 'Hello! 👋 What would you like to know?'],
        de: ['Hallo! 👋 Wie kann ich helfen? Fragen Sie mich nach Essen, Öffnungszeiten oder Catering.', 'Guten Tag! 👋 Was möchten Sie wissen?'],
      },
    },
    {
      id: 'ok',
      words: ['ok', 'okay', 'k', 'cool', 'great', 'nice', 'perfect', 'super', 'alright', 'good', 'gut', 'prima', 'toll', 'klasse', 'passt', 'alles', 'klar'],
      reply: { en: '👍 Anything else I can help with?', de: '👍 Kann ich sonst noch helfen?' },
    },
  ],
  smallTalkFiller: ['you', 'u', 'so', 'much', 'very', 'a', 'lot', 'there', 'and', 'have', 'nice', 'day', 'all', 'good', 'sehr', 'vielen', 'dir', 'ihnen', 'schön', 'noch', 'einen', 'schönen'],

  // Answer to anything the bot can't place
  // (the website chat shows the "Open WhatsApp" button with it, and the topic buttons below)
  fallbackReply: {
    en: 'Sorry, I don’t know that one yet 🙈 Try asking in a different way, pick a topic below, or ask our team directly:',
    de: 'Das weiß ich leider noch nicht 🙈 Versuchen Sie es mit anderen Worten, wählen Sie unten ein Thema, oder fragen Sie direkt unser Team:',
  },
  // When a message could mean more than one thing: the likely answers follow as suggestions
  unsureReply: {
    en: 'I’m not quite sure what you mean – is it one of these?',
    de: 'Ich bin nicht ganz sicher, was Sie meinen – ist es eins davon?',
  },
  // Put in front of the first answer when a message starts with a greeting
  greetingPrefix: { en: 'Hi! 👋 ', de: 'Hallo! 👋 ' },

  // Shown if working out a reply fails, together with the WhatsApp button.
  errorReply: {
    en: 'Sorry, something went wrong on our side. Please try again, or chat with our team on WhatsApp.',
    de: 'Entschuldigung, da ist etwas schiefgelaufen. Bitte versuchen Sie es noch einmal, oder schreiben Sie unserem Team per WhatsApp.',
  },

  // WhatsApp bot only: there are no topic buttons, so it sends the topics as a numbered menu.
  whatsapp: {
    menuHint: 'Reply with a number, or just type your question.',
    // For anything that matches no topic; the menu follows
    fallbackReply: 'Thanks for your message! Our team will get back to you here. In the meantime, I can help with:',
  },
}
