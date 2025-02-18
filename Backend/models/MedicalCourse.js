const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }, // Name of the medication
    frequency: {                             // Frequency of intake
        morning: { type: Boolean, default: false },
        afternoon: { type: Boolean, default: false },
        night: { type: Boolean, default: false }
    }
});

const MedicalCourseSchema = new mongoose.Schema({
    email: { type: String, ref: 'User', required: true }, // Reference to the user
    description: { type: String, required: true },  // Course description
    startDate: { type: Date, required: true },      // Start date of the course
    endDate: { type: Date, required: true },        // End date (computed on frontend)
    medications: [MedicationSchema],               // List of medications
    createdAt: { type: Date, default: Date.now }   // Timestamp for record creation
},
{ collection: "medicines" },
{ timestamps: true }
);

// Create model
const MedicalCourse = mongoose.model('MedicalCourse', MedicalCourseSchema);

module.exports = MedicalCourse;