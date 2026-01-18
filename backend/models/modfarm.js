
/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 * 
 * This source code is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or
 * derivative creation is STRICTLY PROHIBITED.
 *
 * Protected under USPTO application filings for:
 *  - MODX Orbital OS
 *  - MODA/MODX Digital Constitution
 *  - AURA AI Systems
 *  - PQC Identity Rail
 *  - Quantum Governance Engine
 *  - CoinPurse Financial Layer
 *
 * Any tampering triggers MODX Quantum Sentinel.
 */

const mongoose=require("mongoose");const ModFarmSchema=new mongoose.Schema({projectName:{type:String,required:true},cropType:String,region:String,country:String,acreage:Number,yieldEstimate:Number,carbonOffsetTons:Number,irrigationType:String,energySource:String,investmentAmount:{type:Number,required:true},walletAddress:String,txHash:String,blockchainNetwork:{type:String,default:"Polygon"},auditTrail:[{timestamp:{type:Date,default:Date.now},action:String,user:String,details:Object}],status:{type:String,enum:["active","harvested","pending","paused","completed"],default:"active"}},{timestamps:true});ModFarmSchema.pre("save",function(n){this.auditTrail.push({action:this.isNew?"CREATE":"UPDATE",user:"system",details:{auto:true}});n();});module.exports=mongoose.model("ModFarm",ModFarmSchema);

