export const ARCHETYPES = {
  DIRECT: {
    occupationName: 'Automation Technician',
    count: 620,
    skills: [
      { name: 'PLC', profLow: 0.85, profHigh: 0.95, status: 'VERIFIED', confidence: 0.9 },
      { name: 'Industrial Safety', profLow: 0.9, profHigh: 0.95, status: 'VERIFIED', confidence: 0.95 },
      { name: 'Equipment Maintenance', profLow: 0.82, profHigh: 0.9, status: 'VERIFIED', confidence: 0.85 },
      { name: 'Automation', profLow: 0.88, profHigh: 0.98, status: 'VERIFIED', confidence: 0.9 },
      { name: 'Quality Control', profLow: 0.81, profHigh: 0.9, status: 'VERIFIED', confidence: 0.85 },
      { name: 'Process Operations', profLow: 0.85, profHigh: 0.9, status: 'VERIFIED', confidence: 0.88 },
    ]
  },
  ONE_STEP: {
    occupationName: 'Industrial Electrician',
    count: 540,
    skills: [
      { name: 'Electrical Systems', profLow: 0.9, profHigh: 0.95, status: 'VERIFIED', confidence: 0.9 },
      { name: 'Industrial Safety', profLow: 0.85, profHigh: 0.9, status: 'VERIFIED', confidence: 0.9 },
      { name: 'Troubleshooting', profLow: 0.8, profHigh: 0.9, status: 'VERIFIED', confidence: 0.85 },
      { name: 'PLC', profLow: 0.48, profHigh: 0.57, status: 'INFERRED', confidence: 0.6 },
    ],
    experienceYears: 7
  },
  TWO_STEP: {
    occupationName: 'General Mechanic',
    count: 470,
    skills: [
      { name: 'Mechanical Systems', profLow: 0.8, profHigh: 0.9, status: 'VERIFIED', confidence: 0.85 },
      { name: 'Equipment Maintenance', profLow: 0.85, profHigh: 0.95, status: 'VERIFIED', confidence: 0.9 },
    ]
  },
  NONE: {
    occupationName: 'Retail Associate',
    count: 370,
    skills: [
      { name: 'Customer Service', profLow: 0.9, profHigh: 0.95, status: 'VERIFIED', confidence: 0.9 }
    ]
  }
}
