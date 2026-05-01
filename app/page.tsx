import EventCard from "@/components/EventCard"
import ExploreBtn from "@/components/ExploreBtn"
import { events } from "@/lib/constants"

const Home = () => {
  return (
    <section className="">
      <h1 className="text-center">The Hub for Every Student <br /> Events You Can't Miss</h1>
      <p className="text-center mt-5">Hackathons, Seminars, Workshops, Conferences, All in One Place</p>
      <ExploreBtn/>
      <div id="events" className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events list-none">
          {events.map((event,idx)=>(
            <li key={idx}><EventCard {...event} /></li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Home
