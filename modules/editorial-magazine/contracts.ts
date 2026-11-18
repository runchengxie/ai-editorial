import {z} from 'zod';
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
const issueSchema=z.object({id:z.string(),kind:z.enum(['daily','weekly']),generatedAt:z.iso.datetime(),start:z.string(),end:z.string(),coverageStart:z.iso.datetime(),coverageEnd:z.iso.datetime(),title:publicBlock,lead:publicBlock,
 stories:z.array(z.object({id:z.string(),audience:z.enum(['finance','development','general']),headline:publicBlock,summary:publicBlock,paragraphs:z.array(publicBlock).min(2).max(4),related:z.array(publicBlock).max(3),practicalNote:publicBlock.nullable()}).strict()).min(1).max(12),briefs:z.array(publicBlock).max(25),outlook:z.array(z.object({date:z.string(),text:publicBlock}).strict()).max(5),sources:z.array(sourceSchema).min(1).max(60)}).strict();
export const librarySchema=z.object({schemaVersion:z.literal(2),issues:z.array(issueSchema).max(42)}).strict();
