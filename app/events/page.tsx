import EventCard from '@/components/EventCard';
import { IEvent } from '@/database/event.model'
import { cacheLife } from 'next/cache'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;


const Events = async () => {
    'use cache'
  cacheLife('hours')
  const response = await fetch(`${BASE_URL}/api/events`);
  const { events } = await response.json();
  return (
    <div id="events" className="mt-20 space-y-7">
        <h1 className='text-center'>All Events</h1>
        <ul className="events list-none mt-20">
          {events && events.length>0 && events.reverse().map((event:IEvent, idx:number) => (
            <li key={idx}>
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>
  )
}

export default Events
