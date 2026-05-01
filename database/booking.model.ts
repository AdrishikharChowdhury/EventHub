import { model, models, Schema, Types, type HydratedDocument, type Model } from 'mongoose';
import Event from './event.model';

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string): boolean => emailRegex.test(value),
        message: 'Invalid email format.',
      },
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.pre('save', async function (this: HydratedDocument<IBooking>) {
  this.email = this.email.trim().toLowerCase();
  if (!emailRegex.test(this.email)) {
    throw new Error('Invalid email format.');
  }

  // Ensure bookings cannot reference an event that does not exist.
  if (this.isNew || this.isModified('eventId')) {
    const eventExists = await Event.exists({ _id: this.eventId });
    if (!eventExists) {
      throw new Error('Referenced event does not exist.');
    }
  }
});

bookingSchema.index({ eventId: 1 });

const Booking = (models.Booking as Model<IBooking>) || model<IBooking>('Booking', bookingSchema);

export default Booking;
