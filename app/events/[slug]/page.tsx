import EventDetails from "@/components/EventDetails";
import { DotmSquare10 } from "@/components/ui/dotm-square-10";
import {  Suspense } from "react";


const EventDetailsPage = ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  return (
    <Suspense fallback={<DotmSquare10/>}>
      <EventDetails paramsPromise={params} />
    </Suspense>
  );
};

export default EventDetailsPage;
