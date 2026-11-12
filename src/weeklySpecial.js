// This week's special, shown on the Weekly Specials page and in "This Week's Thali" on Home: the
// region, its texts and the dishes of its thali in the order the road passes them. To change the
// special, edit this file (and the images in src/assets/weekly/). DRAFT marks texts written for
// the design, which had placeholder text there: swap in the client's own.
import kolhapuriChicken from './assets/weekly/kolhapuri-chicken.png'
import eggCurry from './assets/weekly/egg-curry.png'
import tambdaRassa from './assets/weekly/tambda-rassa.png'
import pandhraRassa from './assets/weekly/pandhra-rassa.png'
import jeeraRice from './assets/weekly/jeera-rice.png'
import bhakri from './assets/weekly/bhakri.png'
import gulabJamun from './assets/weekly/gulab-jamun.png'
import kandaLimbu from './assets/weekly/kanda-limbu.png'

export const weeklySpecial = {
  region: 'Kolhapuri',
  state: 'Maharashtra',

  // TO CONFIRM with the client every week. null shows a placeholder.
  days: null, // e.g. { de: 'Mi–Fr', en: 'Wed–Fri' }
  price: null, // e.g. '14,90 €'

  // DRAFT
  intro: {
    lead: {
      en: 'Every week our thali travels to a different corner of India.',
      de: 'Jede Woche reist unser Thali in eine andere Ecke Indiens.',
    },
    rest: {
      en: 'This week we stop in Kolhapur, in the south of Maharashtra – home of the fiery red tambda rassa, the creamy white pandhra rassa and spice blends that don’t hold back.',
      de: 'Diese Woche halten wir in Kolhapur im Süden von Maharashtra – Heimat des feurig roten Tambda Rassa, des cremig weißen Pandhra Rassa und von Gewürzmischungen, die sich nicht zurückhalten.',
    },
  },

  fact: {
    place: 'Kolhapur',
    rest: { en: 'is known for its special chappals.', de: 'ist bekannt für seine besonderen Chappals.' },
  },

  thali: {
    name: 'Kolhapuri Thali',
    localName: 'कोल्हापुरी थाळी',
    // DRAFT
    lead: { en: 'A whole Kolhapuri meal on one plate.', de: 'Ein ganzes Kolhapuri-Essen auf einem Teller.' },
    rest: {
      en: 'Two rassas, Kolhapuri chicken and egg curry with jeera rice and bhakri, kanda-limbu on the side and gulab jamun to finish. Follow the road to meet every dish.',
      de: 'Zwei Rassas, Kolhapuri-Chicken und Eiercurry mit Jeera-Reis und Bhakri, dazu Kanda-Limbu und Gulab Jamun zum Abschluss. Folge der Straße und lerne jedes Gericht kennen.',
    },
  },

  // Names and texts as in the design (DRAFT German). The page's road has places for eight dishes.
  // plateCentre: the dish in the middle of the thali picture; the others go around it.
  dishes: [
    {
      name: 'Kolhapuri Chicken',
      localName: 'कोल्हापुरी चिकन',
      text: {
        en: 'Tender chicken cooked in a bold Kolhapuri masala, packed with warmth and spice.',
        de: 'Zartes Hähnchen in einer kräftigen Kolhapuri-Masala, voller Wärme und Würze.',
      },
      image: kolhapuriChicken,
    },
    {
      name: 'Egg Curry',
      localName: 'अंडा करी',
      text: {
        en: 'Boiled egg simmered in a vibrant, spice-rich gravy for a comforting, hearty bite.',
        de: 'Gekochte Eier, geschmort in einer lebhaften, gewürzreichen Soße – herzhaft und wohltuend.',
      },
      image: eggCurry,
    },
    {
      name: 'Tambda Rassa',
      localName: 'तांबडा रस्सा',
      text: {
        en: 'A fiery red Kolhapuri curry, rich with spices and deep, smoky flavour.',
        de: 'Ein feurig rotes Curry aus Kolhapur, reich an Gewürzen und mit tiefem, rauchigem Aroma.',
      },
      image: tambdaRassa,
    },
    {
      name: 'Pandhra Rassa',
      localName: 'पांढरा रस्सा',
      text: {
        en: 'A creamy, mildly spiced white curry, traditionally served alongside the fiery tambda rassa.',
        de: 'Ein cremiges, mild gewürztes weißes Curry, traditionell zum feurigen Tambda Rassa serviert.',
      },
      image: pandhraRassa,
    },
    {
      name: 'Jeera Rice',
      localName: 'जिरा राइस',
      text: {
        en: 'Fragrant rice gently seasoned with spices, making the perfect companion to the curries.',
        de: 'Duftender Reis, sanft mit Kreuzkümmel gewürzt – der perfekte Begleiter zu den Currys.',
      },
      image: jeeraRice,
      plateCentre: true,
    },
    {
      name: 'Bhakri',
      localName: 'भाकरी',
      text: {
        en: 'A rustic Maharashtrian flatbread, traditionally made to soak up rich curries and rassa.',
        de: 'Ein rustikales Fladenbrot aus Maharashtra, traditionell gemacht, um kräftige Currys und Rassa aufzunehmen.',
      },
      image: bhakri,
    },
    {
      name: 'Gulab Jamun',
      localName: 'गुलाबजाम',
      text: {
        en: 'Soft, syrup-soaked milk dumplings offering a sweet finish to the spicy meal.',
        de: 'Weiche, in Sirup getränkte Milchbällchen – ein süßer Abschluss für das scharfe Essen.',
      },
      image: gulabJamun,
    },
    {
      name: 'Kanda-Limbu',
      localName: 'कांदा-लिंबू',
      text: {
        en: 'Fresh sliced onions and lemon that add a crisp, tangy contrast to the spicy thali.',
        de: 'Frische Zwiebelscheiben und Zitrone – ein knackiger, säuerlicher Kontrast zum scharfen Thali.',
      },
      image: kandaLimbu,
    },
  ],
}
