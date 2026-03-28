import { component$ } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  routeLoader$,
  type DocumentHead
} from "@builder.io/qwik-city";

import {
  DEFAULT_TEST_API_KEY,
  DEFAULT_TEST_API_KEY_ID,
  createApiKey,
  getApiKeys,
  revokeApiKey
} from "~/lib/api-keys";
import { requireAuth } from "~/lib/auth";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export const usePlatformData = routeLoader$((event) => {
  const user = requireAuth(event);
  const keys = getApiKeys(event.cookie);

  return {
    user,
    keys
  };
});

export const useCreateApiKeyAction = routeAction$(async (data, event) => {
  requireAuth(event);
  createApiKey(event.cookie, String(data.name ?? "Default production key"));

  return {
    created: true
  };
});

export const useRevokeApiKeyAction = routeAction$(async (data, event) => {
  requireAuth(event);
  const id = String(data.id ?? "");

  if (id) {
    revokeApiKey(event.cookie, id);
  }

  return {
    revoked: true
  };
});

export default component$(() => {
  const platformData = usePlatformData();
  const createKeyAction = useCreateApiKeyAction();
  const revokeKeyAction = useRevokeApiKeyAction();
  const keys = platformData.value.keys;
  const codeToken = keys[0]?.token ?? DEFAULT_TEST_API_KEY;

  return (
    <main class="page-pad">
      <section class="shell dashboard-grid">
        <div class="card page-card">
          <div class="dashboard-header">
            <div>
              <div class="eyebrow">Platform dashboard</div>
              <h1>Welcome back, {platformData.value.user.email}</h1>
            </div>

            <form method="post" action="/logout">
              <button type="submit" class="button button-ghost">
                Log out
              </button>
            </form>
          </div>

          <p class="lead-copy">
            This shell gives you a place to onboard users, issue API keys, and
            present the docs without splitting your marketing and developer
            product across multiple repos.
          </p>

          <div class="stats-grid">
            <article class="card metric-card">
              <div class="metric-label">Active keys</div>
              <div class="big-metric">{keys.length}</div>
            </article>
            <article class="card metric-card">
              <div class="metric-label">Default scope</div>
              <div class="metric-value">read:memories write:memories</div>
            </article>
            <article class="card metric-card">
              <div class="metric-label">Mode</div>
              <div class="metric-value">built-in test key + cookie extras</div>
            </article>
          </div>
        </div>

        <div class="dark-card page-card">
          <div class="metric-label metric-label-dark">Quickstart snippet</div>
          <pre class="code-window">
            <code>{`from aletheia import AletheiaClient

client = AletheiaClient.from_cloud(
    "http://143.110.246.15:3000",
    api_key="${codeToken}",
)

results = client.query(
    "What changed about the user's preferences?",
    entity_id="user-123",
)`}</code>
          </pre>
        </div>
      </section>

      <section class="shell dashboard-grid dashboard-grid-bottom">
        <div class="card page-card">
          <div class="metric-label">Create API key</div>
          <Form action={createKeyAction} class="form-stack form-stack-tight">
            <label class="field">
              <span>Key label</span>
              <input
                name="name"
                placeholder="Production app, staging, or local benchmark"
                value={String(createKeyAction.formData?.get("name") ?? "")}
              />
            </label>
            <button type="submit" class="button button-dark">
              Generate new key
            </button>
          </Form>

          {createKeyAction.value?.created ? (
            <div class="notice notice-success">API key created.</div>
          ) : null}
        </div>

        <div class="card page-card">
          <div class="panel-heading">
            <div class="metric-label">Issued keys</div>
            <span class="pill">cookie-backed demo store</span>
          </div>

          {revokeKeyAction.value?.revoked ? (
            <div class="notice notice-success">API key revoked.</div>
          ) : null}

          <div class="key-list">
            {keys.length === 0 ? (
              <div class="empty-state">
                No keys yet. Generate one and this dashboard will immediately
                show the token, label, scope, and revocation control.
              </div>
            ) : (
              keys.map((key) => (
                <article key={key.id} class="key-card">
                  <div class="key-card-head">
                    <div>
                      <h2>{key.name}</h2>
                      {key.id === DEFAULT_TEST_API_KEY_ID ? (
                        <div class="pill pill-dark">Built-in test key</div>
                      ) : null}
                      <div class="token-text">{key.token}</div>
                    </div>

                    {key.id === DEFAULT_TEST_API_KEY_ID ? (
                      <span class="pill">Always available</span>
                    ) : (
                      <Form action={revokeKeyAction}>
                        <input type="hidden" name="id" value={key.id} />
                        <button type="submit" class="button button-ghost">
                          Revoke
                        </button>
                      </Form>
                    )}
                  </div>

                  <div class="key-meta-grid">
                    <div class="key-meta-item">
                      <div class="metric-label">Preview</div>
                      <div class="token-preview">{key.preview}</div>
                    </div>
                    <div class="key-meta-item">
                      <div class="metric-label">Scope</div>
                      <div>{key.scope}</div>
                    </div>
                    <div class="key-meta-item">
                      <div class="metric-label">Created</div>
                      <div>{formatDate(key.createdAt)}</div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
});

export const head: DocumentHead = {
  title: "Platform | Aletheia",
  meta: [
    {
      name: "description",
      content: "Demo API key dashboard for the hosted Aletheia platform shell."
    }
  ]
};
