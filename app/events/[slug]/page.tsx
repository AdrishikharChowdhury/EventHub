import EventDetails from "@/components/EventDetails";
import {  Suspense } from "react";


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
