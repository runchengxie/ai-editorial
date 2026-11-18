import {z} from 'zod';
import {isValidDate,beijingDate} from '@aihot/contracts/time';
const line=z.string().min(1).max(1200);
export const anchorSchema=z.object({id:z.string().min(1).max(64),quote:z.string().min(12).max(400)}).strict();
export const draftBlockSchema=z.object({en:line,zh:line,anchors:z.array(anchorSchema).min(1).max(4)}).strict();
export const draftSchema=z.object({
 title:draftBlockSchema,lead:draftBlockSchema,
 stories:z.array(z.object({headline:draftBlockSchema,summary:draftBlockSchema,paragraphs:z.array(draftBlockSchema).min(2).max(4),related:z.array(draftBlockSchema).max(3),practicalNote:draftBlockSchema.nullable()}).strict()).min(1).max(12),
 briefs:z.array(draftBlockSchema).max(25),outlook:z.array(z.object({date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),text:draftBlockSchema}).strict()).max(5)
}).strict();
export type Draft=z.infer<typeof draftSchema>;
export interface Evidence {id:string;url:string;title:string;source:string;publishedAt:string;text:string;level:'article'|'feed';audience:'finance'|'development'|'general';}
export interface Packet {kind:'daily'|'weekly';generatedAt:string;start:string;end:string;coverageStart:string;coverageEnd:string;evidence:Evidence[];}
export interface Block {en:string;zh:string;sourceIds:string[];}
export interface Story {id:string;audience:Evidence['audience'];headline:Block;summary:Block;paragraphs:Block[];related:Block[];practicalNote:Block|null;}
export interface Issue {id:string;kind:Packet['kind'];generatedAt:string;start:string;end:string;coverageStart:string;coverageEnd:string;title:Block;lead:Block;stories:Story[];briefs:Block[];outlook:{date:string;text:Block}[];sources:Omit<Evidence,'text'>[];}
export interface Library {schemaVersion:2;issues:Issue[];}
const publicBlock=z.object({en:line,zh:line,sourceIds:z.array(z.string().min(1).max(64)).min(1).max(4)}).strict();
const sourceSchema=z.object({id:z.string().min(1).max(64),url:z.url().max(4000),title:z.string().max(500),source:z.string().max(500),publishedAt:z.iso.datetime(),level:z.enum(['article','feed']),audience:z.enum(['finance','development','general'])}).strict();
export const packetSchema=z.object({kind:z.enum(['daily','weekly']),generatedAt:z.iso.datetime(),start:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),end:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),coverageStart:z.iso.datetime(),coverageEnd:z.iso.datetime(),
 evidence:z.array(sourceSchema.extend({text:z.string().min(1).max(6000)})).min(1).max(60)}).strict().superRefine((packet,ctx)=>{
 const begin=Date.parse(packet.coverageStart),end=Date.parse(packet.coverageEnd),ids=new Set<string>(),urls=new Set<string>();
 if(begin>=end||end-begin>(packet.kind==='daily'?3:7)*86400000||!isValidDate(packet.start)||!isValidDate(packet.end)||packet.start>packet.end||
  packet.start!==beijingDate(begin)||packet.end!==beijingDate(packet.kind==='weekly'?end-1:end)||end>Date.parse(packet.generatedAt))ctx.addIssue({code:'custom',message:'Invalid evidence window or period labels'});
 if(packet.evidence.reduce((n,e)=>n+e.text.length,0)>(packet.kind==='daily'?97200:176000))ctx.addIssue({code:'custom',message:'Evidence text budget exceeded'});
 for(const e of packet.evidence){
  const url=new URL(e.url),time=Date.parse(e.publishedAt);
  if(ids.has(e.id)||urls.has(e.url)||time<begin||time>=end||!['http:','https:'].includes(url.protocol)||url.username||url.password)ctx.addIssue({code:'custom',message:'Duplicate, unsafe or out-of-window evidence'});
  ids.add(e.id);urls.add(e.url);
 }
});
const issueSchema=z.object({id:z.string(),kind:z.enum(['daily','weekly']),generatedAt:z.iso.datetime(),start:z.string(),end:z.string(),coverageStart:z.iso.datetime(),coverageEnd:z.iso.datetime(),title:publicBlock,lead:publicBlock,
 stories:z.array(z.object({id:z.string(),audience:z.enum(['finance','development','general']),headline:publicBlock,summary:publicBlock,paragraphs:z.array(publicBlock).min(2).max(4),related:z.array(publicBlock).max(3),practicalNote:publicBlock.nullable()}).strict()).min(1).max(12),briefs:z.array(publicBlock).max(25),outlook:z.array(z.object({date:z.string(),text:publicBlock}).strict()).max(5),sources:z.array(sourceSchema).min(1).max(60)}).strict();
export const librarySchema=z.object({schemaVersion:z.literal(2),issues:z.array(issueSchema).max(42)}).strict();
