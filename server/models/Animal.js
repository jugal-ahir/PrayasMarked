const mongoose = require('mongoose');

const AnimalSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      unique: true,
      index: true,
      required: true
    },
    species: {
      type: String,
      required: true,
      index: true,
    },
    subspecies: {
      type: String, // e.g. 'Labrador', 'Kite', 'Other: SpecificName'
    },
    status: {
      type: String,
      enum: ['IN', 'OUT'],
      default: 'IN',
      index: true,
    },
    remark: {
      type: String, // e.g. 'Illness', 'Injured', 'Other'
    },
    isTreated: {
      type: Boolean,
      default: false
    },
    destination: {
      type: String,
      enum: ['Treatment Center', 'Rehab Center', 'Other'],
      required: true,
    },
    inchargePerson: {
      type: String,
    },
    inAt: {
      type: Date,
      required: true,
      index: true,
    },
    inBy: {
      type: String,
      required: true,
      index: true,
    },
    outAt: {
      type: Date,
    },
    outBy: {
      type: String,
    },
    markOutType: {
      type: String,
      enum: ['Release', 'Dead', 'Other'],
    },
    markOutReason: {
      type: String,
    }
  },
  {
    timestamps: true
  }
);

const Animal = mongoose.model('Animal', AnimalSchema);

// Attempt to drop the old unique index on animalId if it exists
Animal.collection.dropIndex('animalId_1').catch(() => {
  // Index might not exist, which is fine
});

module.exports = Animal;


