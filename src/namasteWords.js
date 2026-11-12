// The greetings of the Namaste section on Home, cut one by one from the design's greeting image
// (1609 × 579 px) so each can move on its own. x, y, w: where the piece sits and how wide it is,
// in % of that image. order: when it appears as the section scrolls into view (1 first);
// main: NAMASTE! in the centre, which comes last.
import kemCho1 from './assets/home/namaste/greeting-01.png'
import kemCho2 from './assets/home/namaste/greeting-02.png'
import vanakkam from './assets/home/namaste/greeting-03.png'
import namasteHindi1 from './assets/home/namaste/greeting-04.png'
import namaskarBengali1 from './assets/home/namaste/greeting-05.png'
import namaskaraKannada from './assets/home/namaste/greeting-06.png'
import namasteMalayalam1 from './assets/home/namaste/greeting-07.png'
import namaste from './assets/home/namaste/greeting-08.png'
import namasteMalayalam2 from './assets/home/namaste/greeting-09.png'
import namasteHindi2 from './assets/home/namaste/greeting-10.png'
import namaskarBengali2 from './assets/home/namaste/greeting-11.png'
import kemCho3 from './assets/home/namaste/greeting-12.png'

export const namasteWords = [
  { src: kemCho1, label: 'Kem cho (Gujarati)', x: 53.947, y: 0, w: 8.204, order: 7 },
  { src: kemCho2, label: 'Kem cho (Gujarati)', x: 12.181, y: 3.454, w: 7.955, order: 2 },
  { src: vanakkam, label: 'Vanakkam (Tamil)', x: 79.801, y: 8.29, w: 13.673, order: 4 },
  { src: namasteHindi1, label: 'Namaste (Hindi)', x: 35.799, y: 17.271, w: 6.215, order: 10 },
  { src: namaskarBengali1, label: 'Nomoshkar (Bengali)', x: 60.659, y: 35.233, w: 8.204, order: 6 },
  { src: namaskaraKannada, label: 'Namaskara (Kannada)', x: 18.397, y: 41.451, w: 10.441, order: 1 },
  { src: namasteMalayalam1, label: 'Namaste (Malayalam)', x: 78.31, y: 49.05, w: 11.684, order: 9 },
  { src: namaste, label: 'Namaste!', x: 39.03, y: 53.886, w: 19.888, order: 12, main: true },
  { src: namasteMalayalam2, label: 'Namaste (Malayalam)', x: 7.458, y: 64.94, w: 11.684, order: 5 },
  { src: namasteHindi2, label: 'Namaste (Hindi)', x: 67.62, y: 73.23, w: 6.464, order: 8 },
  { src: namaskarBengali2, label: 'Nomoshkar (Bengali)', x: 26.849, y: 81.52, w: 8.204, order: 3 },
  { src: kemCho3, label: 'Kem cho (Gujarati)', x: 49.72, y: 92.573, w: 7.955, order: 11 },
]
