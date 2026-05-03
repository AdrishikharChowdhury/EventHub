# Event Management Platform

This project is a modern event management platform built with Next.js, designed to streamline the process of discovering, managing, and booking events. It provides a robust solution for both event organizers and attendees, offering features like event browsing, detailed event pages, and a seamless booking experience.

## Features

*   **Event Listing:** Browse a comprehensive list of upcoming events.
*   **Event Details:** View detailed information for each event, including description, date, time, location, and more.
*   **Event Booking:** Securely book tickets or register for events.
*   **Admin Panel (Planned/Basic):** Basic interface for managing events and bookings (inferred from `app/admin` directory).
*   **Image Uploads:** Integrate with Cloudinary for efficient image management for events.
*   **Analytics:** Basic analytics integration using PostHog.
*   **Responsive Design:** Optimized for various devices and screen sizes.

## Technologies Used

*   **Framework:** Next.js 14+ (React)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, Shadcn UI
*   **Database:** MongoDB (via Mongoose ODM)
*   **Image Storage:** Cloudinary
*   **Analytics:** PostHog
*   **State Management:** React Context / Hooks (standard React practices)
*   **UI Components:** `@base-ui/react`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   Node.js (LTS version recommended)
*   npm, yarn, pnpm, or bun
*   MongoDB Atlas account or a local MongoDB instance
*   Cloudinary account (for image storage)
*   PostHog account (optional, for analytics)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd event-management
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    # or pnpm install
    # or bun install
    ```

### Environment Variables

Create a `.env.local` file in the root of the project and add the following environment variables:

```dotenv
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_public_api_key
```

*   **`MONGODB_URI`**: Your connection string for MongoDB.
*   **`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`**: Your Cloudinary cloud name.
*   **`CLOUDINARY_API_KEY`**: Your Cloudinary API key.
*   **`CLOUDINARY_API_SECRET`**: Your Cloudinary API secret.
*   **`NEXT_PUBLIC_POSTHOG_HOST`**: PostHog host (usually `https://app.posthog.com`).
*   **`NEXT_PUBLIC_POSTHOG_KEY`**: Your PostHog public API key.

### Running the Development Server

To start the development server:

```bash
npm run dev
# or yarn dev
# or pnpm dev
# or bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The application will auto-update as you edit the code.

## Project Structure

*   `app/`: Contains all Next.js routes and pages (e.g., `/app/events` for event listings, `/app/admin` for admin panel).
*   `components/`: Reusable React components.
*   `database/`: MongoDB models and database connection setup.
*   `lib/`: Utility functions, constants, and server actions.
*   `public/`: Static assets like images and icons.
*   `styled-system/`: Configuration for styling utilities (e.g., Tailwind CSS).

## API Endpoints (inferred)

*   `GET /api/events`: Fetch all events.
*   `GET /api/events/[slug]`: Fetch a single event by slug.
*   `POST /api/booking`: Create a new booking.
*   `GET /api/booking/[id]`: Fetch booking details by ID.

*(Note: These are inferred based on the file structure and may require authentication and further implementation details.)*

## Learn More

To learn more about Next.js, take a look at the following resources:

*   [Next.js Documentation](https://nextjs.org/docs)
*   [Learn Next.js](https://nextjs.org/learn)

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License.