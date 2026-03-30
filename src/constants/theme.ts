export const commonHeadLinks: Array<{
  rel: string;
  href: string;
  crossOrigin?: "anonymous";
}> = [];

export const commonHeadScripts: Array<{
  key: string;
  props?: Record<string, string | boolean>;
  script?: string;
}> = [];
