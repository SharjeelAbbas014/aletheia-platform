import { loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
// @ts-ignore generated during the Fumadocs build step
import { docs, meta } from "../.source/server";

export const source = loader({
  baseUrl: "/docs",
  source: toFumadocsSource(docs, meta)
});
