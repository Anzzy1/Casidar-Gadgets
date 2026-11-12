// ============================================================
// Casidar Gadgets: shop settings. Edit these values.
// Anything marked TODO is a placeholder; replace with the real info.
// ============================================================
window.CASIDAR_CONFIG = {
  shopName: "Casidar Gadgets",

  // Where inquiries / pre-orders get sent (the customer picks one).
  contact: {
    messengerPage: "casidargadgets",      // TODO: Facebook page username, opens m.me/<this>
    smsNumber: "+639000000000",           // TODO: shop mobile number (SMS / call)
    viberNumber: "+639000000000",         // TODO: Viber number (leave "" to hide)
    email: "hello@casidargadgets.com",    // TODO: shop email
    facebookUrl: "https://facebook.com/casidargadgets", // TODO
  },

  branches: [
    {
      id: "antipolo",
      name: "Antipolo Main",
      area: "Brittany 1, Antipolo City",
      address: "Brittany 1, Antipolo City, Rizal", // TODO: full street address
      mapQuery: "Brittany 1, Antipolo City, Rizal", // what Google Maps searches for
      phone: "+639000000000",                      // TODO
      tag: "Main store",
    },
    {
      id: "cainta",
      name: "Cainta Branch",
      area: "Gold Land, Cainta",
      address: "Gold Land, Cainta, Rizal",         // TODO: full street address / stall no.
      mapQuery: "Gold Land, Cainta, Rizal",
      phone: "+639000000000",                      // TODO
      tag: "Branch",
    },
  ],

  // "Available now" highlights shown in the hero and the "What we sell" section.
  // Update these whenever a batch arrives. Set to [] to hide.
  //   device/series/model must match the names in `models` below (used to pre-fill the form).
  // Example: { label: "iPhone 13", note: "128GB · Pre-owned", device: "iphone", series: "iPhone 13", model: "iPhone 13", storage: "128GB", type: "Pre-owned" }
  availableNow: [],

  // Unit types the shop sells.
  types: ["Pre-owned", "Brand new"],

  // Models customers can ask about / pre-order. This is NOT a stock list,
  // just the choices in the request form. Add or remove freely.
  models: {
    iphone: {
      label: "iPhone",
      range: "Older models to the latest",
      series: {
        "iPhone 17 / Air": ["iPhone 17", "iPhone Air", "iPhone 17 Pro", "iPhone 17 Pro Max"],
        "iPhone 16": ["iPhone 16e", "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max"],
        "iPhone 15": ["iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max"],
        "iPhone 14": ["iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max"],
        "iPhone 13": ["iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max"],
        "iPhone 12": ["iPhone 12 mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max"],
        "iPhone 11 / SE": ["iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max", "iPhone SE (2nd/3rd gen)"],
        "iPhone X / XR / XS": ["iPhone X", "iPhone XR", "iPhone XS", "iPhone XS Max"],
        "iPhone 7 / 8": ["iPhone 7", "iPhone 7 Plus", "iPhone 8", "iPhone 8 Plus"],
        "iPhone 6 / 6s": ["iPhone 6", "iPhone 6 Plus", "iPhone 6s", "iPhone 6s Plus", "iPhone SE (1st gen)"],
      },
      storage: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"],
      // Openline = works with any SIM. Wi-Fi only = no SIM signal, used on Wi-Fi (cheaper).
      extra: { label: "Network", options: ["Openline", "Wi-Fi only"] },
    },
    ipad: {
      label: "iPad",
      range: "Old to new: iPad, mini, Air & Pro",
      series: {
        "iPad": ["iPad (A16)", "iPad (10th gen)", "iPad (9th gen)", "iPad (8th gen)", "iPad (7th gen)", "iPad (6th gen)", "iPad (5th gen)"],
        "iPad mini": ["iPad mini (A17 Pro)", "iPad mini 6", "iPad mini 5", "iPad mini 4", "iPad mini 2 / 3"],
        "iPad Air": ["iPad Air (M3)", "iPad Air 11\" / 13\" (M2)", "iPad Air (M1)", "iPad Air 4", "iPad Air 3", "iPad Air 2", "iPad Air (1st gen)"],
        "iPad Pro": ["iPad Pro 11\" / 13\" (M4)", "iPad Pro 11\" (M1/M2)", "iPad Pro 12.9\" (M1/M2)", "iPad Pro 11\" (2018–2020)", "iPad Pro 10.5\"", "iPad Pro 9.7\"", "iPad Pro 12.9\" (older)"],
      },
      storage: ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB+"],
      extra: { label: "Connectivity", options: ["Wi-Fi only", "Wi-Fi + Cellular"] },
    },
  },
};
