export const COMMERCE_GUIDES = [
  { guideCode: "marketplace-refund", category: "orders", title: "Non-delivery, return or refund problem", authority: "Seller or marketplace followed by the National Consumer Helpline", officialUrl: "https://consumerhelpline.gov.in/", summary: "Ask the seller or marketplace for a documented remedy, then use the National Consumer Helpline when the consumer issue remains unresolved.", boundary: "Do not upload invoices, addresses, card details or marketplace passwords here; this tracker is not an official complaint.", tasks: [
    { taskId: "check-policy", title: "Check the seller or marketplace policy", description: "Review the promised delivery, cancellation, return and refund terms." },
    { taskId: "contact-platform", title: "Contact official platform support", description: "State the issue and desired remedy concisely." },
    { taskId: "retain-response", title: "Retain the official response", description: "Keep acknowledgements and evidence privately." },
    { taskId: "check-refund", title: "Check the stated resolution timeline", description: "Verify whether delivery, replacement or refund occurs." },
    { taskId: "consumer-helpline", title: "Use the National Consumer Helpline", description: "Continue through the official pre-litigation channel if unresolved." },
  ] },
  { guideCode: "suspicious-payment", category: "payment safety", title: "Suspicious digital payment or commerce fraud", authority: "Your regulated bank or payment provider and the National Cyber Crime Reporting Portal", officialUrl: "https://cybercrime.gov.in/", summary: "Secure the payment account through the provider's official channel, preserve evidence privately, and report suspected cybercrime on the official portal.", boundary: "Never enter a UPI PIN, OTP, card number, CVV, password, bank account number or recovery code in Vidhya Vedha.", tasks: [
    { taskId: "secure-account", title: "Secure the payment account", description: "Use the bank or payment provider's official app, site or support channel." },
    { taskId: "notify-provider", title: "Notify the regulated provider", description: "Report the transaction through the provider's official dispute route." },
    { taskId: "preserve-evidence", title: "Preserve evidence privately", description: "Keep messages, transaction references and screenshots off this platform." },
    { taskId: "report-cybercrime", title: "Use the official cybercrime portal", description: "Report suspected cybercrime through the government channel." },
    { taskId: "monitor-response", title: "Monitor official acknowledgements", description: "Track only references issued by the bank, provider or government portal." },
  ] },
  { guideCode: "postal-parcel", category: "delivery", title: "India Post parcel or delivery grievance", authority: "Department of Posts", officialUrl: "https://indiapost.gov.in/contact.htm", summary: "Use official India Post tracking and grievance contacts for an India Post consignment; contact a private courier on its own official channel.", boundary: "Vidhya Vedha does not book pickups, track live parcels or store full addresses and consignment documents.", tasks: [
    { taskId: "check-tracking", title: "Check the official tracking record", description: "Use the carrier's own official tracking service." },
    { taskId: "confirm-carrier", title: "Confirm the responsible carrier", description: "Use India Post guidance only for an India Post consignment." },
    { taskId: "contact-carrier", title: "Contact the carrier", description: "Raise the issue through the carrier's official grievance route." },
    { taskId: "retain-reference", title: "Retain the grievance reference", description: "Keep it privately with the consignment evidence." },
    { taskId: "review-outcome", title: "Review the official outcome", description: "Confirm delivery, return or the carrier's written decision." },
  ] },
  { guideCode: "consumer-commission", category: "formal escalation", title: "Prepare for a consumer commission filing", authority: "National Consumer Disputes Redressal Commission", officialUrl: "https://edaakhil.nic.in/", summary: "Review the official e-Daakhil route only after organising the chronology, remedy and supporting material for a formal consumer dispute.", boundary: "Vidhya Vedha is not legal counsel, does not assess limitation or jurisdiction, and does not file or store case evidence.", tasks: [
    { taskId: "define-remedy", title: "Define the requested remedy", description: "Write the specific refund, replacement or other outcome sought." },
    { taskId: "build-chronology", title: "Build a concise chronology", description: "List material dates and provider responses." },
    { taskId: "organise-documents", title: "Organise documents privately", description: "Keep invoices, correspondence and evidence in your own secure storage." },
    { taskId: "review-jurisdiction", title: "Review official filing guidance", description: "Check forum, fee and procedure on the official platform." },
    { taskId: "use-edaakhil", title: "Continue to e-Daakhil", description: "Create and track any filing only on the official system." },
  ] },
];
export const COMMERCE_GUIDE_CODES = COMMERCE_GUIDES.map(({ guideCode }) => guideCode);
export const COMMERCE_OUTCOMES = ["refund", "replacement", "delivery", "charge-review", "information"];
