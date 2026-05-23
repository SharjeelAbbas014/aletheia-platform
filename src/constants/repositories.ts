export interface PublicRepository {
  label: string;
  href: string;
}

export const publicRepositoryLinks: PublicRepository[] = [
  {
    label: "AletheiaDB Platform",
    href: "https://github.com/SharjeelAbbas014/aletheia-platform",
  },
  {
    label: "AletheiaDB JS Client",
    href: "https://github.com/SharjeelAbbas014/aletheia-js-client",
  },
  {
    label: "AletheiaDB Python Client",
    href: "https://github.com/SharjeelAbbas014/aletheia-python-client",
  },
  {
    label: "Claude Code Memory",
    href: "https://github.com/SharjeelAbbas014/aletheia-claude-code-memory",
  },
  {
    label: "Gemini Memory",
    href: "https://github.com/SharjeelAbbas014/aletheia-gemini-memory",
  },
  {
    label: "Grok Memory",
    href: "https://github.com/SharjeelAbbas014/aletheia-grok-memory",
  },
  {
    label: "OpenAI Memory",
    href: "https://github.com/SharjeelAbbas014/aletheia-openai-memory",
  },
];

export const privateRepositoryNote =
  "Core engine repository is private: AletheiaDB";
