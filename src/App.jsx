import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { oldPaths, pages } from './i18n.js'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Menu from './pages/Menu.jsx'
import Contact from './pages/Contact.jsx'
import Catering from './pages/Catering.jsx'
import Impressum from './pages/Impressum.jsx'
import Datenschutz from './pages/Datenschutz.jsx'
import Agb from './pages/Agb.jsx'
import WeeklySpecials from './pages/WeeklySpecials.jsx'
import Journal from './pages/Journal.jsx'
import Allergens from './pages/Allergens.jsx'
import NotFound from './pages/NotFound.jsx'

const pageElements = {
  home: <Home />,
  menu: <Menu />,
  weekly: <WeeklySpecials />,
  catering: <Catering />,
  about: <About />,
  journal: <Journal />,
  contact: <Contact />,
  allergens: <Allergens />,
  impressum: <Impressum />,
  datenschutz: <Datenschutz />,
  agb: <Agb />,
}

// Each page at its German and its English address (once, where both are the same)
const routes = Object.entries(pages).flatMap(([page, paths]) =>
  [...new Set([paths.de, paths.en])].map((path) => ({ path, element: pageElements[page] })),
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
          {Object.entries(oldPaths).map(([from, to]) => (
            <Route key={from} path={from} element={<Navigate to={to} replace />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
