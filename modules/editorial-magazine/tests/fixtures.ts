import type {Packet,Draft} from '../contracts.ts';
export function samplePacket():Packet{return {kind:'daily',generatedAt:'2026-11-17T00:27:00.000Z',start:'2026-11-16',end:'2026-11-17',coverageStart:'2026-11-16T00:27:00.000Z',coverageEnd:'2026-11-17T00:27:00.000Z',evidence:[{id:'ev-one',url:'https://example.org/tools',title:'Sample Tools adds CSV import',source:'Example source',publishedAt:'2026-11-16T10:00:00.000Z',text:'Sample Tools supports CSV import with a maximum file size of 10MB. The feature is available only in the web application. PRIVATE RAW',level:'article',audience:'development'}]};}
export function sampleDraft():Draft{
 const b={en:'Sample Tools supports CSV import.',zh:'Sample Tools 支持 CSV 导入。',anchors:[{id:'ev-one',quote:'Sample Tools supports CSV import with a maximum file size of 10MB.'}]};
 return {title:b,lead:b,stories:[{headline:b,summary:b,paragraphs:[b,{...b,en:'The feature is available only in the web application.',zh:'该功能目前仅在网页端提供。',anchors:[{id:'ev-one',quote:'The feature is available only in the web application.'}]}],related:[],practicalNote:null}],briefs:[],outlook:[]};
}
