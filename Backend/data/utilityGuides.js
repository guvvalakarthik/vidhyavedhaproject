export const UTILITY_GUIDES = [
  {
    guideCode: "electricity-grievance", category: "electricity", title: "Electricity supply or billing grievance",
    authority: "Your electricity distribution licensee and state grievance forum",
    officialUrl: "https://powermin.gov.in/en/content/electricity-rights-consumers-rules-2020",
    summary: "Record the issue, complain to the distribution licensee, and use the state grievance route if it is not resolved.",
    boundary: "Vidhya Vedha does not collect bill payments or consumer account numbers and cannot decide a billing dispute.",
    tasks: [
      { taskId: "capture-issue", title: "Record the issue and date", description: "Keep the bill period, outage time or disputed item in your own records." },
      { taskId: "contact-licensee", title: "Contact the distribution licensee", description: "Use the phone, portal or office printed on the official bill." },
      { taskId: "save-reference", title: "Keep the complaint reference", description: "Save the acknowledgement; do not paste the full consumer number here." },
      { taskId: "check-timeline", title: "Check the stated resolution timeline", description: "Use the licensee's published standard of performance." },
      { taskId: "escalate-forum", title: "Escalate through the state grievance route", description: "Use the Consumer Grievance Redressal Forum or Ombudsman route when applicable." },
    ],
  },
  {
    guideCode: "telecom-complaint", category: "telecom", title: "Mobile or broadband complaint escalation",
    authority: "Telecom service provider complaint centre and appellate authority",
    officialUrl: "https://www.trai.gov.in/faqcategory/complaint",
    summary: "Raise the complaint with the provider first, retain its docket number, and appeal through the provider's appellate authority when needed.",
    boundary: "TRAI does not handle individual complaints directly; provider credentials, OTPs and recharge payments must never be shared here.",
    tasks: [
      { taskId: "describe-problem", title: "Describe the service problem", description: "Note the service, location, date and expected outcome." },
      { taskId: "provider-complaint", title: "Contact the provider complaint centre", description: "Use the provider's official support channel." },
      { taskId: "retain-docket", title: "Retain the docket number", description: "Keep the official complaint acknowledgement." },
      { taskId: "allow-resolution", title: "Allow the stated resolution period", description: "Check the provider's response and published timeline." },
      { taskId: "provider-appeal", title: "Use the provider appellate authority", description: "Escalate with the original docket details if unresolved." },
    ],
  },
  {
    guideCode: "lpg-grievance", category: "lpg", title: "LPG delivery or service grievance",
    authority: "Your LPG distributor and the responsible public-sector oil company", officialUrl: "https://pgportal.gov.in/",
    summary: "Contact the distributor or oil company first, retain the complaint reference, and use CPGRAMS for an unresolved public-service grievance.",
    boundary: "Cylinder bookings, subsidy details, bank information, OTPs and payments stay on the official provider channel.",
    tasks: [
      { taskId: "identify-distributor", title: "Identify the official distributor", description: "Use the distributor details on your official LPG record." },
      { taskId: "raise-provider-issue", title: "Raise the issue with the provider", description: "Use the oil company's official support route." },
      { taskId: "retain-acknowledgement", title: "Retain the acknowledgement", description: "Keep the provider reference in your own records." },
      { taskId: "review-response", title: "Review the provider response", description: "Check whether the requested action was completed." },
      { taskId: "public-grievance", title: "Escalate a public-service grievance", description: "Use CPGRAMS only when the provider route has not resolved the issue." },
    ],
  },
  {
    guideCode: "consumer-helpline", category: "consumer", title: "General utility consumer grievance", authority: "National Consumer Helpline",
    officialUrl: "https://consumerhelpline.gov.in/",
    summary: "Prepare a concise chronology and use the National Consumer Helpline for pre-litigation consumer grievance support.",
    boundary: "The helpline is an official handoff. Vidhya Vedha does not submit the grievance or store evidence and payment records.",
    tasks: [
      { taskId: "contact-provider-first", title: "Contact the service provider first", description: "Ask the provider for a clear remedy and acknowledgement." },
      { taskId: "write-chronology", title: "Write a short chronology", description: "Keep dates, provider responses and the desired remedy concise." },
      { taskId: "organise-evidence", title: "Organise evidence privately", description: "Keep bills and messages ready without uploading them here." },
      { taskId: "use-nch", title: "Use the National Consumer Helpline", description: "Continue on the official NCH channel." },
      { taskId: "track-official-case", title: "Track the official grievance", description: "Use the acknowledgement issued by the official channel." },
    ],
  },
];
export const UTILITY_GUIDE_CODES = UTILITY_GUIDES.map(({ guideCode }) => guideCode);
