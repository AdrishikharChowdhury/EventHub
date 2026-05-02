import { Event } from "@/database";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { error } from "console";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();
    const event: Record<string, any> = Object.fromEntries(formData.entries());

    // -- Parse agenda / tags early --
    if (typeof event.agenda === "string") {
      try {
        event.agenda = JSON.parse(event.agenda);
      } catch {
        return NextResponse.json(
          { message: "agenda must be a valid JSON array" },
          { status: 400 },
        );
      }
    }

    if (typeof event.tags === "string") {
      try {
        event.tags = JSON.parse(event.tags);
      } catch {
        return NextResponse.json(
          { message: "tags must be a valid JSON array" },
          { status: 400 },
        );
      }
    }

    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { message: "Image is required" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image", folder: "EventHub" },
          (error, results) => {
            if (error) return reject(error);

            resolve(results);
          },
        )
        .end(buffer);
    });

    event.image = (uploadResult as { secure_url: string }).secure_url;

    // Now pass to Mongoose
    const createdEvent = await Event.create(event);

    return NextResponse.json(
      {
        message: "Event created successfully",
        event: createdEvent,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Event Creation Failed",
        error: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(
      { message: "Event Fetched Successfully", events: events },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Event fetching failed", error: error },
      { status: 500 },
    );
  }
}
