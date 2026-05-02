import Event, { IEvent } from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { slug } = await params;

    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        {
          message: "Invalid or missing slug parameter",
        },
        { status: 400 },
      );
    }
    const sanitizedSlug = slug.trim().toLowerCase();

    const event: IEvent | null = await Event.findOne({
      slug: sanitizedSlug,
    }).lean();

    if (!event) {
      return NextResponse.json(
        { message: `Event with slug ${sanitizedSlug} is not found` },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { message: "Event Fetched Successfully", event },
      { status: 200 },
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching slug:", error);
    }
    if (error instanceof Error) {
      if (error.message.includes("MONGODB_URI")) {
      }
      return NextResponse.json(
        { message: "Failed to fetch event", error: error.message },
        { status: 500 },
      );
    }
    return NextResponse.json(
      {
        message: "An unexpected error occured",
      },
      { status: 500 },
    );
  }
}
