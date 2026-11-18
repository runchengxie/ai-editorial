// The backend of the site's modules, installed by the api and the worker when they start (configs/site/modules/index.ts).
import type { ServerModule } from "@aihot/backend/modules";

import editorial from "../../../packages/editorial-workbench/server.ts";

export const SERVER_MODULES: readonly ServerModule[] = [editorial];
