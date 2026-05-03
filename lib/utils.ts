import { clsx, type ClassValue } from "clsx";
import { cacheLife } from "next/cache";
import { twMerge } from "tailwind-merge";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getEvent(slug: string) {
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

export async function getBooking(id: string) {
  "use cache";
  cacheLife("hours");
  const response = await fetch(`${BASE_URL}/api/booking/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch event: ${response.statusText}`);
  }
  const data = await response.json();
  return data.bookings ?? null;
}
