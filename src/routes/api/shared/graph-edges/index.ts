import type { RequestHandler } from "@builder.io/qwik-city";
import { getAletheiaDBCoreUrl } from "~/lib/aletheia-core";
import { getCurrentUser } from "~/lib/auth";
import { getAdminSupabaseClient } from "~/lib/supabase";
import { captureError } from "~/lib/sentry";
import type { GraphEdge } from "~/lib/aletheia-core";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse facts from the AletheiaDB observation_block textual_content format */
function parseFactsFromMemory(textualContent: string): Array<{ text: string; terms: string[]; relations?: string[][] }> {
  try {
    const jsonMatch = textualContent.match(/\{[\s\S]+\}/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(jsonMatch[0]);
    const out: Array<{ text: string; terms: string[]; relations?: string[][] }> = [];
    if (Array.isArray(parsed.facts)) {
      for (const f of parsed.facts) {
        out.push({
          text: f.text || "",
          terms: Array.isArray(f.terms) ? f.terms.filter((t: string) => t.length > 2) : [],
        });
      }
    }
    return out;
  } catch {
    return [];
  }
}

const STOP_WORDS = new Set(["and", "or", "the", "both", "now", "with", "for", "are", "was", "has", "had", "not", "but"]);

function entityLabel(entityId: string): string {
  const parts = entityId.split("::");
  return parts[parts.length - 1];
}

function buildEdgesFromFacts(
  facts: Array<{ text: string; terms: string[]; relations?: string[][] }>,
  entityId: string,
  startIdx: number
): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const label = entityLabel(entityId);

  for (const fact of facts) {
    // Co-occurrence edges from extracted terms
    const terms = fact.terms.filter((t) => !STOP_WORDS.has(t));
    for (let i = 0; i < terms.length; i++) {
      // entity → term
      edges.push({
        edge_id: `${label}-${terms[i]}-${startIdx++}`,
        source: label,
        target: terms[i],
        edge_type: "entity_term",
        label: `${label} → ${terms[i]}`,
        weight: 0.7,
        timestamp_ms: Date.now(),
        memory_id: `entity-term-${startIdx}`,
      });
      // term ↔ term (co-occurrence within same fact)
      for (let j = i + 1; j < terms.length; j++) {
        edges.push({
          edge_id: `${terms[i]}-${terms[j]}-${startIdx++}`,
          source: terms[i],
          target: terms[j],
          edge_type: "co_occurs",
          label: fact.text.slice(0, 60),
          weight: 0.9,
          timestamp_ms: Date.now(),
          memory_id: `co-${startIdx}`,
        });
      }
    }
  }
  return edges;
}

function buildEdgesFromRelations(
  relations: string[][], // [source, edge_type, target][]
  startIdx: number
): GraphEdge[] {
  return relations
    .filter((r) => Array.isArray(r) && r.length === 3)
    .map((r, i) => ({
      edge_id: `rel-${r[0]}-${r[2]}-${startIdx + i}`,
      source: r[0],
      target: r[2],
      edge_type: r[1],
      label: `${r[0]} ${r[1]} ${r[2]}`,
      weight: 1.0,
      timestamp_ms: Date.now(),
      memory_id: `relation-${startIdx + i}`,
    }));
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export const onGet: RequestHandler = async (event) => {
  const user = getCurrentUser(event.cookie);
  if (!user) throw event.error(401, "Unauthorized");

  try {
    const supabase = getAdminSupabaseClient(event.env);
    if (!supabase) throw event.error(500, "Database offline");

    // Get the user's active API keys
    const { data: apiKeys } = await supabase
      .from("api_keys")
      .select("key_value")
      .eq("user_id", user.user_id)
      .eq("is_active", true)
      .limit(5);

    if (!apiKeys?.length) {
      event.json(200, []);
      return;
    }

    const engineUrl = (
      event.env.get("ALETHEIADB_URL") ||
      getAletheiaDBCoreUrl()
    ).replace(/\/+$/, "");

    // Try all active keys and use the first that returns data
    const queryPayloads = [
      { textual_query: "knowledge facts memories entities", limit: 20 },
      { textual_query: "project work technology preferences people", limit: 20 },
    ];

    const allEdges: GraphEdge[] = [];
    const seenEdgeIds = new Set<string>();
    let edgeIdx = 0;

    // Try each API key — the user may have multiple keys for different entity namespaces
    for (const { key_value: apiKey } of apiKeys) {
      await Promise.all(
        queryPayloads.map(async (payload) => {
          try {
            const ac = new AbortController();
            const timeout = setTimeout(() => ac.abort(), 8000);
            const res = await fetch(`${engineUrl}/query`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-api-key": apiKey },
              body: JSON.stringify(payload),
              signal: ac.signal,
            });
            clearTimeout(timeout);
            if (!res.ok) return;

            const memories: any[] = await res.json();
            for (const mem of memories) {
              if (!mem.textual_content) continue;
              const facts = parseFactsFromMemory(mem.textual_content);
              const factEdges = buildEdgesFromFacts(facts, mem.entity_id || "entity", edgeIdx);
              edgeIdx += factEdges.length;

              for (const edge of factEdges) {
                if (!seenEdgeIds.has(edge.edge_id)) {
                  seenEdgeIds.add(edge.edge_id);
                  allEdges.push(edge);
                }
              }
            }
          } catch {
            // non-fatal: key may be invalid or engine unreachable
          }
        })
      );
    }

    event.json(200, allEdges);
  } catch (e: any) {
    if (e?.headers?.location) throw e;
    if (e?.status) throw e;
    captureError(e, { action: "sharedGraphEdges" });
    throw event.error(500, "Internal error");
  }
};
