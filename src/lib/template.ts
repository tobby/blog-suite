import { BLOG_TEMPLATES, type TemplateConfig } from "./constants";

export function getTemplateConfig(template: string): TemplateConfig {
  if (template in BLOG_TEMPLATES) {
    return BLOG_TEMPLATES[template]!;
  }
  return BLOG_TEMPLATES.clean!;
}
