import { describe, expect, it } from "vitest";
import { operationalRecord } from "../services/providerOperationsService.js";
describe("provider operations dashboard", () => {
  it("redacts healthcare resident details", () => {
    const item = operationalRecord("healthcare", { confirmationCode:"APT-12345678",status:"booked",specialty:"General Medicine",startTime:new Date(),location:{city:"Hyderabad"},patientName:"Private",phone:"+910000000000",reason:"Private reason" });
    expect(item).toMatchObject({ id:"APT-12345678",kind:"healthcare",service:"General Medicine" });
    expect(item.patientName).toBeUndefined(); expect(item.phone).toBeUndefined(); expect(item.reason).toBeUndefined();
  });
  it("does not expose precise emergency location", () => {
    const item=operationalRecord("emergency",{requestId:"EMR-12345678",status:"requested",serviceName:"Tow",priority:"urgent",createdAt:new Date(),location:{description:"Exact private location",latitude:1,longitude:2}});
    expect(item.area).toBe("Location shared with dispatch record"); expect(JSON.stringify(item)).not.toContain("Exact private location");
  });
});
