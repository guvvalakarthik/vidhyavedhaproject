import{blockerReport,recordBlocker}from"../services/blockerAnalyticsService.js";
export const createBlockerEvent=async(q,r)=>{try{await recordBlocker({userId:q.user.userId,event:q.body});return r.status(202).json({message:"Blocker signal recorded without free text or resident identity."})}catch(error){if(error?.code===11000)return r.status(200).json({message:"This blocker was already counted today."});throw error}};
export const getBlockerAnalytics=async(q,r)=>r.json(await blockerReport({from:new Date(Date.now()-q.validated.query.days*86400000)}));
