import { IEvent } from "@/database/event.model";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import EventCard from "./EventCard";

const SimilarEvents = async ({ slug }: { slug: string }) => {
    'use cache'
  const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);
  const serialized = JSON.parse(JSON.stringify(similarEvents));
  return (
    <div className="flex w-full flex-col gap-4 pt-20">
      <h2>Similar Events</h2>
      <div className="events">
        {serialized.length > 0 &&
          serialized.map((event: IEvent, idx: number) => (
            <EventCard {...event} key={idx} />
          ))}
      </div>
    </div>
  );
};

export default SimilarEvents;
