import Booking, { IBooking } from "@/database/booking.model";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { id } = await params;

    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { message: "Invalid or missing id parameter" },
        { status: 400 },
      );
    }

    const bookings: IBooking[] = await Booking.find({
      eventId: id,
    }).lean<IBooking[]>();

    if (bookings.length === 0) {
      return NextResponse.json(
        { message: `No bookings found for event with id ${id}` },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Bookings Fetched Successfully", bookings },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Booking fetching failed",
        error: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 },
    );
  }
}