import EventCard from "@/components/EventCard";
import Event, { IEvent } from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";
import { cacheLife } from "next/cache";


const Events = async () => {
  "use cache";
  cacheLife("hours");
  await connectToDatabase();
  const events = await Event.find({}).lean();
  return (
    <div id="events" className="mt-20 space-y-7">
      <h1 className="text-center">All Events</h1>
      <ul className="events list-none mt-20">
        {events &&
          events.length > 0 &&
          events.reverse().map((event: IEvent, idx: number) => (
            <li key={idx}>
              <EventCard {...event} />
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Events;
