export const categories = [
  "All Categories",
  "Electronics",
  "Appliances",
  "Electrical",
  "Motorcycle",
  "Computer",
  "Plumbing"
];

export const repairers = [
  {
    id: "juan-dela-cruz",
    name: "Juan Dela Cruz",
    initials: "JD",
    category: "Electronics",
    rating: 4.9,
    reviews: 127,
    repairs: 214,
    experience: 8,
    location: "Cebu City, Cebu",
    price: 500,
    verified: true,
    available: true,
    services: [
      "TV Repair",
      "Refrigerator",
      "Washing Machine",
      "Electronics"
    ],
    about:
      "I have been repairing electronics and household appliances for more than 8 years. I focus on honest diagnosis, proper repairs, and making sure customers understand what was fixed."
  },
  {
    id: "maria-santos",
    name: "Maria Santos",
    initials: "MS",
    category: "Appliances",
    rating: 4.8,
    reviews: 94,
    repairs: 176,
    experience: 6,
    location: "Lapu-Lapu City, Cebu",
    price: 450,
    verified: true,
    available: true,
    services: [
      "Appliance Repair",
      "Refrigerator",
      "Washing Machine"
    ],
    about:
      "Experienced appliance repairer specializing in household appliances and reliable maintenance services."
  },
  {
    id: "pedro-reyes",
    name: "Pedro Reyes",
    initials: "PR",
    category: "Electrical",
    rating: 4.9,
    reviews: 88,
    repairs: 189,
    experience: 7,
    location: "Mandaue City, Cebu",
    price: 600,
    verified: true,
    available: true,
    services: [
      "Electrical Repair",
      "Wiring",
      "Troubleshooting"
    ],
    about:
      "Provides dependable electrical repair and troubleshooting services for homes and small businesses."
  },
  {
    id: "ana-lim",
    name: "Ana Lim",
    initials: "AL",
    category: "Computer",
    rating: 4.7,
    reviews: 72,
    repairs: 142,
    experience: 5,
    location: "Cebu City, Cebu",
    price: 400,
    verified: true,
    available: true,
    services: [
      "Computer Repair",
      "Laptop Repair",
      "Software Troubleshooting"
    ],
    about:
      "Computer and laptop repair specialist focused on hardware diagnostics and software troubleshooting."
  },
  {
    id: "roberto-garcia",
    name: "Roberto Garcia",
    initials: "RG",
    category: "Motorcycle",
    rating: 4.6,
    reviews: 61,
    repairs: 128,
    experience: 6,
    location: "Talisay City, Cebu",
    price: 550,
    verified: true,
    available: false,
    services: [
      "Motorcycle Repair",
      "Engine Repair",
      "Maintenance"
    ],
    about:
      "Experienced motorcycle repairer offering maintenance, diagnostics, and mechanical repair services."
  },
  {
    id: "carlo-mendoza",
    name: "Carlo Mendoza",
    initials: "CM",
    category: "Plumbing",
    rating: 4.5,
    reviews: 53,
    repairs: 116,
    experience: 5,
    location: "Cebu City, Cebu",
    price: 350,
    verified: true,
    available: true,
    services: [
      "Plumbing",
      "Pipe Repair",
      "Leak Repair"
    ],
    about:
      "Reliable plumbing services for common household plumbing problems and maintenance."
  }
];

export default repairers;
