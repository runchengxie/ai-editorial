/** Match the engine's default HTML mode, without permitting a paid Jina listing read. */
export function freeWebListing(config:Record<string,unknown>):boolean {
 return config.fetchVia!=='jina' && typeof config.url==='string' && !config.url.startsWith('https://r.jina.ai/')
   && !config.url.startsWith('http://r.jina.ai/') && (config.parseMode===undefined||config.parseMode==='html') && config.adapter===undefined;
}
