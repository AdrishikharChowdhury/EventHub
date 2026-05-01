import { model, models, Schema, type HydratedDocument, type Model } from 'mongoose';

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const nonEmptyStringValidator = {
  validator: (value: string): boolean => value.trim().length > 0,
  message: 'Field cannot be empty.',
};

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, validate: nonEmptyStringValidator },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true, validate: nonEmptyStringValidator },
    overview: { type: String, required: true, trim: true, validate: nonEmptyStringValidator },
    image: { type: String, required: true, trim: true, validate: nonEmptyStringValidator },
    venue: { type: String, required: true, trim: true, validate: nonEmptyStringValidator },
    location: { type: String, required: true, trim: true, validate: nonEmptyStringValidator },
    date: { type: String, required: true, trim: true, validate: nonEmptyStringValidator },
    time: { type: String, required: true, trim: true, validate: nonEmptyStringValidator },
    mode: { type: String, required: true, trim: true, validate: nonEmptyStringValidator },
    audience: { type: String, required: true, trim: true, validate: nonEmptyStringValidator },
    agenda: {
      type: [String],
      required: true,
      set: (items: string[]): string[] => items.map((item) => item.trim()),
      validate: [
        {
          validator: (items: string[]): boolean => items.length > 0,
          message: 'Agenda must contain at least one item.',
        },
        {
          validator: (items: string[]): boolean => items.every((item) => item.length > 0),
          message: 'Agenda items cannot be empty.',
        },
      ],
    },
    organizer: { type: String, required: true, trim: true, validate: nonEmptyStringValidator },
    tags: {
      type: [String],
      required: true,
      set: (items: string[]): string[] => items.map((item) => item.trim()),
      validate: [
        {
          validator: (items: string[]): boolean => items.length > 0,
          message: 'Tags must contain at least one item.',
        },
        {
          validator: (items: string[]): boolean => items.every((item) => item.length > 0),
          message: 'Tags cannot contain empty values.',
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const twentyFourHourTimeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const twelveHourTimeRegex = /^(\d{1,2})(?::([0-5]\d))?\s*(AM|PM)$/i;

const ensureNonEmptyString = (fieldName: string, value: string): string => {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${fieldName} is required.`);
  }
  return normalized;
};

// Convert the title into a URL-friendly slug.
const createSlug = (title: string): string => {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  if (!slug) {
    throw new Error('Unable to generate slug from title.');
  }

  return slug;
};

// Store date values as ISO strings for consistent persistence.
const normalizeDateToISO = (dateValue: string): string => {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date format.');
  }
  return parsedDate.toISOString();
};

// Normalize time to HH:mm (24-hour) regardless of 12h or 24h input.
const normalizeTime = (timeValue: string): string => {
  const normalized = timeValue.trim();
  const twentyFourMatch = normalized.match(twentyFourHourTimeRegex);

  if (twentyFourMatch) {
    const hours = Number(twentyFourMatch[1]);
    const minutes = Number(twentyFourMatch[2]);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  const twelveMatch = normalized.match(twelveHourTimeRegex);
  if (!twelveMatch) {
    throw new Error('Invalid time format. Use HH:mm or h:mm AM/PM.');
  }

  let hours = Number(twelveMatch[1]);
  const minutes = Number(twelveMatch[2] ?? '0');
  const meridiem = twelveMatch[3].toUpperCase();

  if (hours < 1 || hours > 12) {
    throw new Error('Invalid time value.');
  }

  if (meridiem === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

eventSchema.pre('save', function (this: HydratedDocument<IEvent>) {
  this.title = ensureNonEmptyString('title', this.title);
  this.description = ensureNonEmptyString('description', this.description);
  this.overview = ensureNonEmptyString('overview', this.overview);
  this.image = ensureNonEmptyString('image', this.image);
  this.venue = ensureNonEmptyString('venue', this.venue);
  this.location = ensureNonEmptyString('location', this.location);
  this.mode = ensureNonEmptyString('mode', this.mode);
  this.audience = ensureNonEmptyString('audience', this.audience);
  this.organizer = ensureNonEmptyString('organizer', this.organizer);
  this.date = normalizeDateToISO(ensureNonEmptyString('date', this.date));
  this.time = normalizeTime(ensureNonEmptyString('time', this.time));

  if (!Array.isArray(this.agenda) || this.agenda.length === 0) {
    throw new Error('Agenda must contain at least one item.');
  }
  if (!Array.isArray(this.tags) || this.tags.length === 0) {
    throw new Error('Tags must contain at least one item.');
  }

  this.agenda = this.agenda.map((item) => ensureNonEmptyString('agenda item', item));
  this.tags = this.tags.map((item) => ensureNonEmptyString('tag', item));

  // Regenerate slug only when the title changes.
  if (this.isNew || this.isModified('title')) {
    this.slug = createSlug(this.title);
  }
});

eventSchema.index({ slug: 1 }, { unique: true });

const Event = (models.Event as Model<IEvent>) || model<IEvent>('Event', eventSchema);

export default Event;
