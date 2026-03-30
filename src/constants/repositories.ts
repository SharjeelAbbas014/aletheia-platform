export interface PublicRepository {
  label: string;
  href: string;
}

export const publicRepositoryLinks: PublicRepository[] = [
  {
    label: "Aletheia Platform",
    href: "https://github.com/SharjeelAbbas014/aletheia-platform"
  },
  {
    label: "Aletheia JS Client",
    href: "https://github.com/SharjeelAbbas014/aletheia-js-client"
  },
  {
    label: "Aletheia Python Client",
    href: "https://github.com/SharjeelAbbas014/aletheia-python-client"
  },
  {
    label: "Claude Code Memory",
    href: "https://github.com/SharjeelAbbas014/aletheia-claude-code-memory"
  },
  {
    label: "Gemini Memory",
    href: "https://github.com/SharjeelAbbas014/aletheia-gemini-memory"
  },
  {
    label: "Grok Memory",
    href: "https://github.com/SharjeelAbbas014/aletheia-grok-memory"
  },
  {
    label: "OpenAI Memory",
    href: "https://github.com/SharjeelAbbas014/aletheia-openai-memory"
  }
];

export const privateRepositoryNote =
  "Core engine repository is private: Aletheia (https://github.com/SharjeelAbbas014/Aletheia).";
