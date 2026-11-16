import { en } from "./web/locales/en.ts";
import { defineModule } from "@aihot/contracts/modules";
export default defineModule({
  name: "editorial-workbench",
  pages: [
    { path: "editorial", file: "web/board.tsx", admin: true, nav: en.nav },
    {
      path: "editorial/:id",
      file: "web/topic.tsx",
      admin: true,
      nav: en.topicNav,
    },
  ],
  apiPaths: [/^\/api\/admin\/editorial\//],
});
