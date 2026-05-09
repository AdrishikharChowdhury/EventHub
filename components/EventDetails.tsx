import SimilarEvents from "./SimilarEvents";
import BookEvent from "./BookEvent";
import EventTags from "./EventTags";
import EventAgenda from "./EventAgenda";
import EventDetailItem from "./EventDetailItem";
import Image from "next/image";
import { getBooking, getEvent } from "@/lib/utils";
import { notFound } from "next/navigation";

class EventDetailItemClass {
  icon: string;
  alt: string;
  label: string;
  constructor(icon: string, alt: string, label: string) {
    this.icon = icon;
    this.alt = alt;
    this.label = label;
  }
}

const EventDetails = async ({
  paramsPromise,
}: {
  paramsPromise: Promise<{ slug: string }>;
}) => {
  const { slug } = await paramsPromise;
  const event = await getEvent(slug);

  if (!event) return notFound();

  const {
    description,
    image,
    overview,
    date,
    time,
    location,
    mode,
    agenda,
    audience,
    organizer,
    tags,
  } = event;


  const bookings = await getBooking(event._id.toString());
  const dateItem = new EventDetailItemClass(
    "/icons/calendar.svg",
    "calendar",
    date,
  );
  const timeItem = new EventDetailItemClass("/icons/clock.svg", "clock", time);
  const locationItem = new EventDetailItemClass(
    "/icons/pin.svg",
    "location",
    location,
  );
  const modeItem = new EventDetailItemClass("/icons/mode.svg", "mode", mode);
  const audienceItem = new EventDetailItemClass(
    "/icons/audience.svg",
    "audience",
    audience,
  );
  const eventDetailItems: EventDetailItemClass[] = [
    dateItem,
    timeItem,
    locationItem,
    modeItem,
    audienceItem,
  ];

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description:</h1>
        <p className="mt-2">{description}</p>
      </div>
      <div className="details">
        <div className="content">
          <Image src={image} alt="event-banner" width={800} height={800} />
          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>
          <section className="flex-col-gap-2">
            <h2>Event Details</h2>
            {eventDetailItems.map((item, idx: number) => (
              <EventDetailItem
                key={idx}
                icon={item.icon}
                alt={item.alt}
                label={item.label}
              />
            ))}
          </section>
          <EventAgenda agendaItems={agenda} />
          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>
          <EventTags tags={tags} />
        </div>
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings?.length > 0 ? (
              bookings?.length > 1 ? (
                <p className="text-sm">
                  Join {bookings.length} people who have already booked their
                  spot
                </p>
              ) : (
                <p className="text-sm">
                  Join {bookings.length} person who have already booked their
                  spot
                </p>
              )
            ) : (
              <p className="text-sm">Be the first to Book Your spot!</p>
            )}
            <BookEvent eventId={event._id} slug={slug} />
          </div>
        </aside>
      </div>
      <SimilarEvents slug={slug} />
    </section>
  );
};

export default EventDetails;
