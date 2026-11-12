// Guest reviews for the home page. Only publish real reviews: invented or
// edited ones are illegal in Germany (UWG), and the page should say how
// reviews are collected (e.g. "from Google and Uber Eats").

export const reviewSummary = {
  rating: '4.9',
  count: '320+',
  area: 'Stuttgart',
}

// Fills the card grid in this order; the sixth gets the large card.
// Reviews with a `source` also show an initial and a source badge.
export const featuredReviews = [
  {
    quote: 'Tastes like home-cooked food. The biryani and the thali are must-tries.',
    name: 'Karthik S.',
    detail: 'Vaihingen · Oct 2026',
    source: 'Google',
  },
  {
    quote: "Fresh, generous and properly spiced. The best Indian food we've found in Stuttgart.",
    name: 'Daniela P.',
    detail: 'Mitte · Sep 2026',
    source: 'Uber Eats',
  },
  {
    quote: 'Our whole office orders here now.',
    name: 'Jonas',
    detail: 'Office lunch',
  },
  {
    quote: "Best paneer I've had in Germany.",
    name: 'Priya',
    detail: 'Stuttgart-West',
  },
  {
    quote: 'I came for the curry and stayed for the Goan dishes.',
    name: 'Maxi W.',
    detail: 'Möhringen · Oct 2026',
    source: 'Too Good To Go',
  },
  {
    quote:
      'Cooked fresh every single day. You can taste the care in every dish, and it always arrives warm.',
    name: 'Mara',
    detail: 'Degerloch · Oct 2026',
    source: 'Google',
  },
]

// Short quotes for the scrolling strip under the cards.
export const reviewSnippets = [
  { quote: 'Thali portions are huge and so fresh', name: 'Sofia' },
  { quote: 'Tastes exactly like Goa', name: 'Lena' },
  { quote: 'Our whole office orders here now', name: 'Jonas' },
  { quote: 'Best paneer I have had in Germany', name: 'Priya' },
  { quote: 'Cooked fresh every single day', name: 'Mara' },
]
