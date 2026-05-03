import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import Event, { IEvent } from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";
import { cacheLife } from "next/cache";


const Home = async () => {
  "use cache";
  cacheLife("hours");
  await connectToDatabase();
  const events = await Event.find({}).lean();
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
          {events && events.length>0 && events.reverse().map((event:IEvent, idx:number) => (
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
