import { weeklySpecial } from '../weeklySpecial.js'

// This week's thali, put together from the dish pictures on a steel plate (until there's a photo
// of it): one dish in the middle, the rest around it
export default function ThaliPlate({ className = '' }) {
  const centre = weeklySpecial.dishes.find((dish) => dish.plateCentre)
  const around = weeklySpecial.dishes.filter((dish) => dish !== centre)
  return (
    <div className={`ws-plate ${className}`.trim()} aria-hidden="true">
      {centre && <img className="ws-plate__centre" src={centre.image} alt="" />}
      {around.map((dish, i) => {
        const angle = (i / around.length) * 2 * Math.PI - Math.PI / 2
        return (
          <img
            key={dish.name}
            className="ws-plate__bowl"
            src={dish.image}
            alt=""
            style={{ left: `${50 + 34 * Math.cos(angle)}%`, top: `${50 + 34 * Math.sin(angle)}%` }}
          />
        )
      })}
    </div>
  )
}
