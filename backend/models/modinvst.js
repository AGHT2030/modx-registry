
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

const mongoose=require("mongoose");const ModInvstSchema=new mongoose.Schema({investorName:{type:String,required:true},email:String,project:String,investmentAmount:{type:Number,required:true},returnsExpected:Number,roiActual:Number,currency:{type:String,default:"USD"},region:String,walletAddress:String,txHash:String,blockchainNetwork:{type:String,default:"Polygon"},esgRating:String,greitLinked:{type:Boolean,default:false},auditTrail:[{timestamp:{type:Date,default:Date.now},action:String,user:String,details:Object}],status:{type:String,enum:["active","closed","pending","flagged"],default:"active"}},{timestamps:true});ModInvstSchema.pre("save",function(n){this.auditTrail.push({action:this.isNew?"CREATE":"UPDATE",user:"system",details:{auto:true}});n();});module.exports=mongoose.model("ModInvst",ModInvstSchema);

