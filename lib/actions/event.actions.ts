"use server";

import { Event } from "@/database";
import connectToDatabase from "../mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await connectToDatabase();
    const event = await Event.findOne({ slug });
    if (!event) {
      return [];
    }
    if (!event.tags || event.tags.length === 0) {
      return [];
    }
    return await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags }
    }).lean();
  } catch (error) {
    console.error("Failed to fetch similar events:", error);
    return [];
  }
};
