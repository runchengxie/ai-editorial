import { defineServerModule } from "@aihot/backend/modules";
import { registerEditorial } from "./api/routes.ts";
export default defineServerModule({
  name: "editorial-workbench",
  http: registerEditorial,
});
