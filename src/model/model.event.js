const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  shortDescription: {
    type: String,
    maxLength: 200
  },

  // Date and Time
  date: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  time: {
    type: String
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },

  // Location
  venue: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  coordinates: {
    lat: Number,
    lng: Number
  },

  // Event type
  type: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    default: 'offline'
  },
  meetingLink: { // For online events
    type: String
  },
  platform: { // Zoom, Google Meet, etc.
    type: String
  },

  // Cover and media
  coverImage: {
    type: String // Cloudinary URL
  },
  gallery: [{
    url: String,
    caption: String
  }],

  // Capacity
  maxCapacity: {
    type: Number
  },
  currentRegistrations: {
    type: Number,
    default: 0
  },
  waitlistEnabled: {
    type: Boolean,
    default: false
  },

  // Pricing
  isPaid: {
    type: Boolean,
    default: false
  },
  ticketPrice: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },

  // Speakers
  speakers: [{
    name: {
      type: String,
      required: true
    },
    title: String,
    organization: String,
    bio: String,
    photo: String,
    linkedinUrl: String
  }],

  // Agenda
  agenda: [{
    time: String,
    title: String,
    description: String,
    speaker: String
  }],

  // Registration and Tickets
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  tickets: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    ticketNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    qrCode: String,
    paymentId: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    amount: Number,
    registeredAt: {
      type: Date,
      default: Date.now
    },
    checkedIn: {
      type: Boolean,
      default: false
    },
    checkedInAt: Date,
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }],
  waitlist: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Creator and approval
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  adminId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'draft'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admins"
  },
  approvedAt: Date,
  rejectionReason: String,

  // Categorization
  category: {
    type: String,
    enum: ['reunion', 'seminar', 'workshop', 'networking', 'cultural', 'sports', 'career', 'other'],
    default: 'other'
  },
  tags: [String],

  // Featured
  isFeatured: {
    type: Boolean,
    default: false
  },

  // Feedback
  feedback: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware
eventSchema.pre('save', async function () {
  this.updatedAt = Date.now();

  // Update current registrations count
  if (this.registeredUsers) {
    this.currentRegistrations = this.registeredUsers.length;
  }
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function () {
  if (!this.maxCapacity) return null;
  return Math.max(0, this.maxCapacity - this.currentRegistrations);
});

// Virtual for is full
eventSchema.virtual('isFull').get(function () {
  if (!this.maxCapacity) return false;
  return this.currentRegistrations >= this.maxCapacity;
});

// Virtual for average rating
eventSchema.virtual('averageRating').get(function () {
  if (!this.feedback || this.feedback.length === 0) return 0;
  const sum = this.feedback.reduce((acc, f) => acc + f.rating, 0);
  return Math.round((sum / this.feedback.length) * 10) / 10;
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

// Generate ticket number
eventSchema.statics.generateTicketNumber = async function (eventId) {
  const event = await this.findById(eventId);
  const prefix = 'TKT';
  const eventCode = eventId.toString().slice(-4).toUpperCase();
  const count = event.tickets ? event.tickets.length + 1 : 1;
  return `${prefix}-${eventCode}-${count.toString().padStart(4, '0')}`;
};

// Indexes
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ createdBy: 1, status: 1 });

module.exports = mongoose.model("Event", eventSchema);
