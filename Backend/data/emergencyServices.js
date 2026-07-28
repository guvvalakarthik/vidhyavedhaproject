export const EMERGENCY_SERVICES = [
  {
    code: "towing",
    name: "Towing and recovery",
    summary: "Request recovery when your vehicle cannot be driven safely.",
  },
  {
    code: "flat-tyre",
    name: "Flat tyre assistance",
    summary: "Get help fitting a usable spare or arranging recovery.",
  },
  {
    code: "battery-jump",
    name: "Battery jump-start",
    summary: "Request a jump-start when the vehicle battery is flat.",
  },
  {
    code: "fuel-delivery",
    name: "Emergency fuel delivery",
    summary: "Request enough fuel to reach a nearby filling station.",
  },
  {
    code: "vehicle-lockout",
    name: "Vehicle lockout help",
    summary: "Request non-destructive access support after being locked out.",
  },
  {
    code: "mechanic",
    name: "Roadside mechanic",
    summary: "Ask a mechanic to assess a minor breakdown at your location.",
  },
];

export const EMERGENCY_SERVICE_CODES = EMERGENCY_SERVICES.map(({ code }) => code);
