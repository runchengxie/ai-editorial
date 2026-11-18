// What the site's modules add to the web pages (configs/site/modules/index.ts).
import type { WebModule } from "@aihot/web/modules";

import editorial from "../../../modules/editorial-workbench/web.tsx";

export const WEB_MODULES: readonly WebModule[] = [editorial];
