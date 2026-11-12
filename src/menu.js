// The menu, copied from the menu images on bccstuttgart.de/our-menu (March 2026), for the chat bot.
// Prices in euros. allergens: the letters printed next to a dish (see allergenNames),
// additives: its numbers (see additiveNames). diet: the menu's mark – 'vegan', 'vegetarian',
// or none. Dishes without a mark aren't necessarily meat dishes; the bot says so.
// Descriptions are the menu's German text, translated for `en`.

export const allergenNames = {
  A: { en: 'gluten', de: 'Gluten' },
  B: { en: 'crustaceans', de: 'Krebstiere' },
  C: { en: 'eggs', de: 'Eier' },
  D: { en: 'fish', de: 'Fisch' },
  E: { en: 'peanuts', de: 'Erdnüsse' },
  F: { en: 'soy', de: 'Soja' },
  G: { en: 'milk', de: 'Milch' },
  H: { en: 'nuts', de: 'Schalenfrüchte' },
  J: { en: 'mustard', de: 'Senf' },
  K: { en: 'sesame', de: 'Sesam' },
}

export const additiveNames = {
  4: { en: 'colourings', de: 'Farbstoffe' },
}

// weekly: the dishes change every week. friday: only served on Fridays.
// pickupDiscount: the menu page shows "15% Discount | Selbstabholung".
// servedWith: allergens of what comes with every dish of the section.
export const menuSections = [
  {
    id: 'gourmet-teller',
    name: 'Gourmet Teller',
    pickupDiscount: true,
    about: {
      en: 'A fine Indian plate – specialities of the day, served with rice, salad, poppadum and an Ayurvedic mouth freshener.',
      de: 'Feiner indischer Teller – Spezialitäten des Tages, serviert mit Reis, Salat, Poppadum und ayurvedischer Munderfrischung.',
    },
  },
  {
    id: 'premium-slides',
    name: 'Premium Slides',
    weekly: true,
    about: {
      en: 'A curated side of the day, served with 2 baked chapatis, a fine sweet and salad.',
      de: 'Kuratierte Beilage des Tages, serviert mit 2 gebackenen Chapatis, einer feinen Süßigkeit und Salat.',
    },
    servedWith: {
      en: 'the chapatis contain gluten (A), the sweet gluten, milk, nuts and colourings (A, G, H, 4)',
      de: 'die Chapatis enthalten Gluten (A), die Süßigkeit Gluten, Milch, Schalenfrüchte und Farbstoffe (A, G, H, 4)',
    },
  },
  {
    id: 'grand-thali',
    name: 'Grand Thali',
    weekly: true,
    pickupDiscount: true,
    about: {
      en: 'Two changing specialities of the week with basmati rice, fresh salad, crispy papadam, two fresh chapatis, a fine Indian sweet, mango pickle and an Ayurvedic mouth freshener.',
      de: 'Zwei wechselnde Spezialitäten der Woche mit Basmatireis, frischem Salat, knusprigem Papadam, zwei frischen Chapatis, einer feinen indischen Süßigkeit, Mango-Pickle und ayurvedischer Munderfrischung.',
    },
  },
  {
    id: 'biryani',
    name: 'Fridays for Biryani',
    friday: true,
    pickupDiscount: true,
    about: { en: 'Our Friday biryani.', de: 'Unser Biryani am Freitag.' },
  },
  {
    id: 'starters',
    name: 'Vorspeise',
    pickupDiscount: true,
    about: {
      en: 'Classic Indian street food with vibrant spices and authentic flavours.',
      de: 'Klassische indische Straßenküche mit lebendigen Gewürzen und authentischen Aromen.',
    },
  },
  {
    id: 'drinks',
    name: 'Getränke',
    pickupDiscount: true,
    about: { en: 'Drinks.', de: 'Getränke.' },
  },
]

export const dishes = [
  // Gourmet Teller
  { name: 'Goan Daal Toi', section: 'gourmet-teller', price: 11.8, diet: 'vegan', allergens: ['J'] },
  { name: 'Goan Chicken Xacuti', section: 'gourmet-teller', price: 13.5, allergens: ['H'] },
  { name: 'Goan Prawns Hooman', section: 'gourmet-teller', price: 13.5, allergens: ['B'] },
  { name: 'Dakshin Vegetable Kurma', section: 'gourmet-teller', price: 12.8, diet: 'vegetarian', allergens: ['H', 'G'] },
  { name: 'Dakshin Chicken Kurma', section: 'gourmet-teller', price: 13.5, allergens: ['H'] },
  { name: 'Nawabi Paneer', section: 'gourmet-teller', price: 12.8, diet: 'vegetarian', allergens: ['H', 'G'] },
  { name: 'Nawabi Chicken', section: 'gourmet-teller', price: 13.5, allergens: ['H', 'G'] },

  // Premium Slides
  { name: 'Goan Paneer Cafreal', section: 'premium-slides', price: 11, diet: 'vegetarian', allergens: ['G'] },
  { name: 'Goan Chicken Cafreal', section: 'premium-slides', price: 12, allergens: [] },
  { name: 'Goan Fish Fry', section: 'premium-slides', price: 11, allergens: ['A', 'D'] },
  { name: 'Dakshin Paneer Roast', section: 'premium-slides', price: 11, diet: 'vegetarian', allergens: ['G'] },
  { name: 'Dakshin Chicken Roast', section: 'premium-slides', price: 12, allergens: [] },
  { name: 'Nawabi Veg Kofta', section: 'premium-slides', price: 11, diet: 'vegetarian', allergens: ['H', 'G'] },
  { name: 'Nawabi Chicken Kofta', section: 'premium-slides', price: 12, allergens: ['H', 'G'] },

  // Grand Thali
  { name: 'Goan Veg Thali', section: 'grand-thali', price: 16.5, diet: 'vegetarian', allergens: ['A', 'J', 'G', 'H'], additives: [4] },
  { name: 'Goan Chicken Thali', section: 'grand-thali', price: 18.5, allergens: ['A', 'J', 'G', 'H'], additives: [4] },
  { name: 'Goan Fish Thali', section: 'grand-thali', price: 18.5, allergens: ['A', 'B', 'D', 'G', 'H'], additives: [4] },
  { name: 'Dakshin Veg Thali', section: 'grand-thali', price: 16.5, diet: 'vegetarian', allergens: ['A', 'G', 'H'], additives: [4] },
  { name: 'Dakshin Chicken Thali', section: 'grand-thali', price: 18.5, allergens: ['A', 'G', 'H'], additives: [4] },
  { name: 'Nawabi Veg Thali', section: 'grand-thali', price: 16.5, diet: 'vegetarian', allergens: ['A', 'G', 'H'], additives: [4] },
  { name: 'Nawabi Chicken Thali', section: 'grand-thali', price: 18.5, allergens: ['A', 'G', 'H'], additives: [4] },

  // Fridays for Biryani
  {
    name: 'Paneer Vegetable Biryani',
    section: 'biryani',
    price: 12.5,
    diet: 'vegetarian',
    allergens: ['G', 'H'],
    additives: [4],
    about: {
      en: 'Aromatic basmati rice with spices, vegetables and paneer, served with a yoghurt side.',
      de: 'Aromatischer Basmatireis mit Gewürzen, Gemüse und Paneer, serviert mit Joghurtbeilage.',
    },
  },
  {
    name: 'Chicken Biryani',
    section: 'biryani',
    price: 13.5,
    allergens: ['G'],
    additives: [4],
    about: {
      en: 'Aromatic basmati rice with spices and tender chicken, served with a yoghurt side.',
      de: 'Aromatischer Basmatireis mit Gewürzen und zartem Hähnchenfleisch, serviert mit Joghurtbeilage.',
    },
  },

  // Vorspeise
  {
    name: 'Vada Pav',
    section: 'starters',
    price: 5,
    allergens: ['A', 'G'],
    about: {
      en: 'A potato ball dipped in chickpea-flour batter and fried until crisp, served in a soft, homemade Indian bun.',
      de: 'Kartoffel-Kugel in Kichererbsenmehl-Teig getaucht und knusprig frittiert, serviert mit hausgemachtem, weichem indischem Brötchen.',
    },
  },
  {
    name: 'Keema Pav',
    section: 'starters',
    price: 6,
    allergens: ['A', 'G'],
    about: {
      en: 'Spicy minced chicken with traditional spices, served with a soft, homemade Indian bun.',
      de: 'Würziges Hähnchenhackfleisch mit landestypischen Gewürzen, serviert mit hausgemachtem, weichem indischem Brötchen.',
    },
  },
  {
    name: 'Batata Vada',
    section: 'starters',
    price: 5,
    allergens: ['K'],
    about: {
      en: 'Golden potato fritters in a crispy chickpea batter.',
      de: 'Goldbraune Kartoffelkroketten, umhüllt von einem knusprigen Kichererbsenteig.',
    },
  },
  {
    name: 'Chilli Chicken',
    section: 'starters',
    price: 6.5,
    allergens: ['A', 'C', 'F'],
    about: {
      en: 'Juicy fried chicken in a spicy chilli sauce with aromatic spices.',
      de: 'Saftig gebratenes Hähnchen in würziger Chili-Sauce mit aromatischen Gewürzen.',
    },
  },
  {
    name: 'Chilli Paneer',
    section: 'starters',
    price: 6,
    // CHECK with the client: paneer is cheese, but the menu doesn't list G (milk)
    allergens: ['A', 'C', 'F'],
    about: {
      en: 'Juicy fried Indian cheese in a spicy chilli sauce with aromatic spices.',
      de: 'Saftig gebratener indischer Käse in würziger Chili-Sauce mit aromatischen Gewürzen.',
    },
  },
  { name: 'Cafreal Pav', section: 'starters', price: 6, allergens: ['A', 'G'] },
  { name: 'Roast Pav', section: 'starters', price: 6, allergens: ['A', 'G'] },

  // Getränke
  {
    name: 'Mango Lassi',
    section: 'drinks',
    price: 3,
    allergens: ['G', 'H'],
    about: { en: 'The exotic classic.', de: 'Der exotische Klassiker.' },
  },
  {
    name: 'Jeera Lassi',
    section: 'drinks',
    price: 3,
    allergens: ['G', 'H'],
    about: {
      en: 'A refreshing lassi with a pinch of cumin – cool and savoury.',
      de: 'Erfrischender Lassi mit einer Prise Kreuzkümmel – kühl und würzig.',
    },
  },
  {
    name: 'Masala Lassi',
    section: 'drinks',
    price: 3,
    // CHECK with the client: lassi is made with yoghurt, but the menu lists only K (sesame)
    allergens: ['K'],
    about: {
      en: 'A spiced lassi, somewhere between sweet and savoury.',
      de: 'Aromatisch gewürzter Lassi zwischen Süße und würziger Tiefe.',
    },
  },
  {
    name: 'Kokum Sharbat',
    section: 'drinks',
    price: 3,
    allergens: [],
    about: {
      en: 'A refreshing drink made from kokum fruit, lightly sweet and sour, with spices.',
      de: 'Erfrischendes Getränk aus Kokum-Frucht, leicht säuerlich-süß, mit Gewürzen verfeinert.',
    },
  },
  {
    name: 'Aam Panna',
    section: 'drinks',
    price: 3,
    allergens: [],
    about: {
      en: 'A green-mango drink, sweet and sour with spices – cooling and refreshing.',
      de: 'Erfrischungsgetränk aus grüner Mango, süß-säuerlich mit Gewürzen, kühlend und belebend.',
    },
  },
]
