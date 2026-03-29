import { component$ } from "@builder.io/qwik";
import {
  type DocumentHead,
  routeLoader$
} from "@builder.io/qwik-city";

import { commonHeadLinks, commonHeadScripts } from "~/constants/theme";
import { detailedDocsBySlug } from "~/lib/docs-content";

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

export const head: DocumentHead = ({ resolveValue }) => {
  const page = resolveValue(useDocsPage);

  if (!page) {
    return {
      title: "Docs | Not Found",
      meta: [
        {
          name: "description",
          content: "Requested docs page was not found."
        }
      ],
      links: commonHeadLinks,
      scripts: commonHeadScripts
    };
  }

  return {
    title: `${page.title} | Aletheia`,
    meta: [
      {
        name: "description",
        content: page.description
      }
    ],
    links: commonHeadLinks,
    scripts: commonHeadScripts
  };
};
