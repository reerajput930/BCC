// Checks the chat bot against sample questions: `npm run check` in server/.
// Each conversation is a list of [message, expected], where expected is the start of the reply's
// rule (see replyRules.js), or a list of acceptable ones. Messages in one conversation follow each
// other, so follow-ups ("how much is it?") get the context of the reply before.
// Add questions here when you change answers or the thresholds in replyRules.js.
import { prepareReplies, replyFor } from './replyRules.js'

const conversations = [
  // Hours
  [['What are your opening hours?', 'hours']],
  [['when can I come eat', 'hours']],
  [['are u open mondays', 'hours']],
  [['till when r u open tonight', 'hours']],
  [['wann macht ihr zu', 'hours']],
  [['Habt ihr am Sonntag offen?', 'hours']],
  [['r u guys open tmrw', 'hours']],
  [['could you tell me the timming plz', 'hours']],
  [['what are your timings', 'hours']],
  // Location
  [['where can i find you', 'location']],
  [['wie komme ich zu euch', 'location']],
  [['whats ur adress', 'location']],
  // Ordering, pickup, delivery
  [['can i get it home delivered', 'wolt']],
  [['bringt ihr essen nach hause', 'wolt']],
  [['uber eats?', 'wolt']],
  [['how do i order', 'wolt']],
  [['do you deliver to Möhringen?', 'wolt']],
  [['can I pick it up myself', 'pickup']],
  [['gibt es rabatt wenn ich abhole', 'pickup']],
  // Catering, booking, payment
  [['we have 40 guests for a birthday, can you provide food', 'catering']],
  [['firmenfeier essen', 'catering']],
  [['food for my company event next month', 'catering']],
  [['reserve for 4 at 7pm', 'booking']],
  [['need a table for two tonight', 'booking']],
  [['do you take credit cards', 'payment']],
  [['kartenzahlung möglich?', 'payment']],
  // Food in general
  [['what kind of food do you have', 'food']],
  [['do you have vegan options', 'vegetarian']],
  [['Gibt es was ohne Fleisch?', 'vegetarian']],
  [['I am allergic to nuts', 'allergies']],
  [['is your food very spicy', 'spice']],
  [['how expensive is it', 'prices']],
  [['what is the special this week', 'weekly']],
  [['is the meat halal', 'halal']],
  [['my order was missing a lassi', ['complaint', 'complaint + dish']]],
  [['are you a bot', 'assistant']],
  [['can i talk to a real person', 'human']],
  [['what is your phone number', 'human']],
  // Dishes
  [['what is vada pav', 'dish: Vada Pav']],
  [['how much is the chicken biryani', 'dish: Chicken Biryani (price)']],
  [['is the chilli paneer vegetarian?', 'dish: Chilli Paneer (diet)']],
  [['does mango lassi have nuts', 'dish: Mango Lassi (allergens)']],
  [['do you have biriyani', 'dish: Paneer Vegetable Biryani, Chicken Biryani']],
  [['lassi?', 'dish: Mango Lassi, Jeera Lassi, Masala Lassi']],
  [['Was kostet das Goan Fish Thali?', 'dish: Goan Fish Thali (price)']],
  [['ist das nawabi panner vegan', 'dish: Nawabi Paneer (diet)']],
  [['can I order biryani on wolt', 'wolt + dish']],
  [['is the goan veg thali vegan', 'dish: Goan Veg Thali (diet)']],
  [['does the goan fish thali contain gluten', 'dish: Goan Fish Thali (allergens)']],
  [['Enthält das Chicken Biryani Nüsse?', 'dish: Chicken Biryani (allergens)']],
  [['do you have paneer dishes', 'dish: Nawabi Paneer, Goan Paneer Cafreal']],
  // Follow-ups
  [
    ['is the vada pav vegan?', 'dish: Vada Pav (diet)'],
    ['and the keema pav?', 'dish: Keema Pav (diet)'],
    ['how much is it', 'dish: Keema Pav (price)'],
  ],
  [
    ['tell me about the goan veg thali', 'dish: Goan Veg Thali'],
    ['allergens?', 'dish: Goan Veg Thali (allergens)'],
  ],
  // Several questions at once
  [['are you open on sunday and do you deliver?', 'hours (']],
  [['Wo seid ihr und kann man mit PayPal zahlen?', 'location (']],
  // Small talk and greetings
  [['hi', 'small talk: greeting']],
  [['thank you so much!', 'small talk: thanks']],
  [['ok bye', 'small talk: bye']],
  [['hello, do you have vegetarian food?', 'vegetarian']],
  // Off topic: the bot must not pretend to know
  [['what is the weather today', ['fallback', 'unsure']]],
  [['who won the football game', ['fallback', 'unsure']]],
  [['tell me a joke', ['fallback', 'unsure']]],
  [['do you sell shoes', ['fallback', 'unsure']]],
  [['what is the capital of france', ['fallback', 'unsure']]],
  [['can you help with my homework', ['fallback', 'unsure']]],
]

await prepareReplies()

let failed = 0
for (const conversation of conversations) {
  let context
  for (const [message, expected] of conversation) {
    const reply = await replyFor(message, { context })
    context = reply.context
    const ok = [expected].flat().some((start) => reply.rule.startsWith(start))
    if (!ok) failed++
    console.log(`${ok ? '  ok ' : 'FAIL '} ${message.padEnd(58)} → ${reply.rule}${ok ? '' : `   (expected ${[expected].flat().join(' or ')})`}`)
  }
}
const total = conversations.flat().length
console.log(`\n${total - failed}/${total} as expected`)
process.exitCode = failed ? 1 : 0
