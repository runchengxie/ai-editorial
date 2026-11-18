import type {Issue,Block} from '../../modules/editorial-magazine/contracts.ts';

export function pilotMarkdown(issue:Issue,locale:'en'|'zh'):string{
 const text=(b:Block)=>b[locale],lines=[`# ${text(issue.title)}`,'',`${issue.start} – ${issue.end}`,'',text(issue.lead),''];
 issue.stories.forEach((story,i)=>{lines.push(`## ${i+1}. ${text(story.headline)}`,'',text(story.summary),'');for(const b of [...story.paragraphs,...story.related,...(story.practicalNote?[story.practicalNote]:[])])lines.push(text(b),'');});
 if(issue.briefs.length)lines.push(locale==='zh'?'## 简讯':'## Briefs','',...issue.briefs.map(b=>'- '+text(b)),'');
 if(issue.outlook.length)lines.push(locale==='zh'?'## 后续观察':'## Outlook','',...issue.outlook.map(o=>`- ${o.date}: ${text(o.text)}`),'');
 lines.push(locale==='zh'?'## 来源':'## Sources','',...issue.sources.map(s=>`- [${s.source}: ${s.title}](${s.url})`),'',locale==='zh'?'本地验收稿，未经人工审核，未发布。':'Local evaluation draft; not human-reviewed or published.','');
 return lines.join('\n');
}
