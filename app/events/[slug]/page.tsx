import BookEvent from "@/components/BookEvent";
import SimilarEvents from "@/components/SimilarEvents";
import { cacheLife } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
}

async function getEvent(slug: string) {
  "use cache";
  cacheLife("hours");

  const response = await fetch(`${BASE_URL}/api/events/${slug}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch event: ${response.statusText}`);
  }
  const data = await response.json();
  return data.event ?? null;
}

const EventDetailItem = ({
  icon,
  label,
  alt,
}: {
  icon: string;
  label: string;
  alt: string;
}): ReactNode => {
  return (
    <div className="flex flex-row gap-2 items-center">
      <Image src={icon} alt={alt} width={17} height={17} />
      <p>{label}</p>
    </div>
  );
};

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }): ReactNode => {
  return (
    <div className="agenda">
      <h2>Agenda</h2>
      <ul>
        {agendaItems.map((item, idx: number) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

const EventTags = ({ tags }: { tags: string[] }): ReactNode => {
  return (
    <div className="flex flex-row gap-1.5 flex-wrap">
      {tags.map((tag, idx: number) => (
        <div className="pill" key={idx}>
          {tag}
        </div>
      ))}
    </div>
  );
};

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
    organiser,
    tags,
  } = event;

  const bookings = 10;

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
            <EventDetailItem
              icon="/icons/calendar.svg"
              alt="calendar"
              label={date}
            />
            <EventDetailItem
              icon="/icons/clock.svg"
              alt="clock"
              label={time}
            />
            <EventDetailItem
              icon="/icons/pin.svg"
              alt="location"
              label={location}
            />
            <EventDetailItem
              icon="/icons/mode.svg"
              alt="mode"
              label={mode}
            />
            <EventDetailItem
              icon="/icons/audience.svg"
              alt="audience"
              label={audience}
            />
          </section>
          <EventAgenda agendaItems={agenda} />
          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organiser}</p>
          </section>
          <EventTags tags={tags} />
        </div>
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who have already booked their spot
              </p>
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

const EventDetailsPage = ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  return (
    <Suspense fallback={<div>Loading event...</div>}>
      <EventDetails paramsPromise={params} />
    </Suspense>
  );
};

export default EventDetailsPage;