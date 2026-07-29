export const HOME_SERVICE_PROVIDERS = [
 {providerCode:"HOME-ELECTRICAL",name:"Vidhya Partner - Electrical",service:"Electrical repairs",description:"Inspection and scheduled household electrical repair visits.",serviceAreas:["Miyapur","Kukatpally","Chandanagar"],visitMinutes:60,slotHours:[9,11,14,16],workingDays:[1,2,3,4,5,6]},
 {providerCode:"HOME-PLUMBING",name:"Vidhya Partner - Plumbing",service:"Plumbing services",description:"Scheduled leak, fixture and household plumbing visits.",serviceAreas:["Miyapur","Kukatpally","Chandanagar"],visitMinutes:60,slotHours:[9,11,14,16],workingDays:[1,2,3,4,5,6]},
 {providerCode:"HOME-APPLIANCE",name:"Vidhya Partner - Appliance Care",service:"Appliance inspection",description:"Initial inspection visits for common household appliances.",serviceAreas:["Miyapur","Kukatpally"],visitMinutes:60,slotHours:[10,12,15],workingDays:[1,2,3,4,5,6]},
 {providerCode:"HOME-CARPENTRY",name:"Vidhya Partner - Carpentry",service:"Carpentry repairs",description:"Scheduled assessment and minor household carpentry visits.",serviceAreas:["Miyapur","Kukatpally","Chandanagar"],visitMinutes:90,slotHours:[9,12,15],workingDays:[1,2,3,4,5,6]},
];
export const HOME_PROVIDER_CODES=HOME_SERVICE_PROVIDERS.map(({providerCode})=>providerCode);
