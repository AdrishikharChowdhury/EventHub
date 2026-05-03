import EventDetails from "@/components/EventDetails";
import Loader from "@/components/Loader";
import {  Suspense } from "react";


const EventDetailsPage = ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  return (
    <Suspense fallback={<Loader/>}>
      <EventDetails paramsPromise={params} />
    </Suspense>
  );
};

export default EventDetailsPage;
