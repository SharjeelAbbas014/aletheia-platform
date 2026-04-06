import { component$ } from "@builder.io/qwik";
import {
  type DocumentHeadProps,
  routeLoader$
} from "@builder.io/qwik-city";

import { detailedDocsBySlug } from "~/lib/docs-content";
import { buildSeoHead } from "~/lib/seo";

export const useDocsPage = routeLoader$(({ params, status }) => {
  const page = detailedDocsBySlug[params.slug];

  if (!page) {
    status(404);
    return null;
  }

  return page;
});

export default component$(() => {
  const page = useDocsPage();

  if (!page.value) {
    return (
      <>
        <div class="eyebrow">Not Found</div>
        <h1>Page not found</h1>
        <p class="doc-lead">
          The documentation page you requested does not exist.
        </p>
      </>
    );
  }

  return (
    <>
      <div class="eyebrow">{page.value.eyebrow}</div>
      <h1>{page.value.title}</h1>
      <p class="doc-lead">{page.value.lead}</p>

      {page.value.sections.map((section, sectionIndex) => (
        <section key={`${page.value.slug}-${section.heading}-${sectionIndex}`}>
          <h2>{section.heading}</h2>

          {section.paragraphs?.map((paragraph, paragraphIndex) => (
            <p key={`${section.heading}-p-${paragraphIndex}`}>{paragraph}</p>
          ))}

          {section.callout ? (
            <div
              class={`docs-callout docs-callout-${section.callout.tone ?? "info"}`}
            >
              {section.callout.title ? (
                <p class="docs-callout-title">{section.callout.title}</p>
              ) : null}
              <p class="docs-callout-body">{section.callout.body}</p>
            </div>
          ) : null}

          {section.stats?.length ? (
            <div class="docs-stat-grid">
              {section.stats.map((stat, statIndex) => (
                <article
                  key={`${section.heading}-stat-${statIndex}`}
                  class={`docs-stat-card docs-stat-card-${stat.tone ?? "default"}`}
                >
                  <p class="docs-stat-label">{stat.label}</p>
                  <p class="docs-stat-value">{stat.value}</p>
                  {stat.description ? (
                    <p class="docs-stat-description">{stat.description}</p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}

          {section.bullets?.length ? (
            <ul>
              {section.bullets.map((bullet, bulletIndex) => (
                <li key={`${section.heading}-b-${bulletIndex}`}>{bullet}</li>
              ))}
            </ul>
          ) : null}

          {section.steps?.length ? (
            <ol>
              {section.steps.map((step, stepIndex) => (
                <li key={`${section.heading}-s-${stepIndex}`}>{step}</li>
              ))}
            </ol>
          ) : null}

          {section.artifacts?.length ? (
            <div class="docs-artifact-grid">
              {section.artifacts.map((artifact, artifactIndex) => (
                <article
                  key={`${section.heading}-artifact-${artifactIndex}`}
                  class="docs-artifact-card"
                >
                  <div class="docs-artifact-chip">Artifact</div>
                  <h3>{artifact.name}</h3>
                  <p>{artifact.description}</p>
                  {artifact.meta ? (
                    <p class="docs-artifact-meta">{artifact.meta}</p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}

          {section.table ? (
            <div class="docs-table-wrap">
              <table class="docs-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    {section.table.columns.map((column, columnIndex) => (
                      <th key={`${section.heading}-column-${columnIndex}`}>
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row, rowIndex) => (
                    <tr key={`${section.heading}-row-${rowIndex}`}>
                      <th>{row.label}</th>
                      {row.values.map((value, valueIndex) => (
                        <td key={`${section.heading}-value-${rowIndex}-${valueIndex}`}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {section.table.footnote ? (
                <p class="docs-table-footnote">{section.table.footnote}</p>
              ) : null}
            </div>
          ) : null}

          {section.codeBlocks?.map((block, blockIndex) => (
            <figure key={`${section.heading}-c-${blockIndex}`}>
              {block.label ? (
                <figcaption class="docs-code-caption">{block.label}</figcaption>
              ) : null}
              <pre class="docs-code">
                <code>{block.code}</code>
              </pre>
            </figure>
          ))}
        </section>
      ))}
    </>
  );
});

export const head = ({ resolveValue }: DocumentHeadProps) => {
  const page = resolveValue(useDocsPage);

  if (!page) {
    return buildSeoHead({
      title: "Docs | Not Found",
      description: "Requested docs page was not found.",
      pathname: "/docs",
      noindex: true
    });
  }

  return buildSeoHead({
    title: `${page.title} | Aletheia`,
    description: page.description,
    pathname: `/docs/${page.slug}`
  });
};
