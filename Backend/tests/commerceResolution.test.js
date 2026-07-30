import {describe,expect,it} from "vitest";
import CommerceCase from "../models/CommerceCase.js";
import {COMMERCE_GUIDES,COMMERCE_OUTCOMES} from "../data/commerceGuides.js";
describe("commerce resolution cases",()=>{
 it("provides reviewed official routes without payment, credential, address, or evidence fields",()=>{expect(COMMERCE_GUIDES).toHaveLength(4);expect(COMMERCE_GUIDES.every(({officialUrl,tasks})=>officialUrl.startsWith("https://")&&tasks.length===5)).toBe(true);for(const field of ["accountId","amount","address","mobile","upiId","cardNumber","otp","evidence"]){expect(CommerceCase.schema.path(field)).toBeUndefined();}});
 it("uses constrained outcomes, states, and owner indexes",()=>{expect(CommerceCase.schema.path("desiredOutcome").enumValues).toEqual(COMMERCE_OUTCOMES);expect(CommerceCase.schema.path("status").enumValues).toEqual(["open","resolved","archived"]);const indexes=CommerceCase.schema.indexes();expect(indexes.some(([fields])=>fields.userId===1&&fields.createdAt===-1)).toBe(true);});
});
