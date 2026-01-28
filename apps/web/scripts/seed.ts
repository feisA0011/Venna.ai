const seed = {
  venues: [
    {
      name: "Nyhavn Bistro",
      locale: "da-DK",
      policy: "If unsure about allergens, always escalate to staff.",
      confidenceThreshold: 0.72
    }
  ],
  documents: [
    {
      title: "Opening Hours",
      content: "Open daily from 11:00 to 23:00. Kitchen closes at 22:00.",
      source: "manual"
    }
  ]
};

console.log(JSON.stringify(seed, null, 2));
