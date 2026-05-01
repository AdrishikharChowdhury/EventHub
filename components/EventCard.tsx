"use client";

import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";
import { EventItem } from "@/lib/constants";

const EventCard = ({ title, image, slug, location, date, time }: EventItem) => {
  return (
    <Link
      href={`/events`}
      id="event-card"
      onClick={() => {
        posthog.capture("event_card_clicked", {
          event_title: title,
          event_slug: slug,
          event_location: location,
          event_date: date,
        });
      }}
    >
      <Image
        src={image}
        alt={title}
        width={410}
        height={300}
        className="poster"
      />
      <div className="flex flex-row gap-2">
        <Image src="/icons/pin.svg" alt="location" width={14} height={14} />
        <p>{location}</p>
      </div>
      <p className="title">{title}</p>
      <div className="datetime">
        <Image
          src="/icons/calendar.svg"
          alt="location"
          width={14}
          height={14}
        />
        <p>{date}</p>
        <div className="datetime">
          <Image src="/icons/clock.svg" alt="location" width={14} height={14} />
          <p>{time}</p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
