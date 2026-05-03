import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database/event.model";
import { cacheLife } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Home = async () => {
  'use cache'
  cacheLife('hours')
  const response = await fetch(`${BASE_URL}/api/events`);
  const { events } = await response.json();
  return (
    <section className="">
      <h1 className="text-center">
        The Hub for Every Student <br /> Events You Can't Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Seminars, Workshops, Conferences, All in One Place
      </p>
      <ExploreBtn />
      <div id="events" className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events list-none">
          {events && events.length>0 && events.map((event:IEvent, idx:number) => (
            <li key={idx}>
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Home;
