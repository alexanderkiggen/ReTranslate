// lib/prompts.js
export const PROMPTS = {
  "Page Title <meta_title> (admin)": "Generate an SEO-optimized meta title that mirrors the provided one but is adapted to the linguistic and search preferences of this language. Ensure it remains engaging and effective. Only return the translation, without additional information or commentary. Translate to: {}",
  "Meta Description <meta_description> (admin)": "Generate an SEO-optimized meta description that mirrors the provided one but is adapted to the linguistic and search preferences of this language. Ensure it remains engaging and effective. Only return the translation, without additional information or commentary. Translate to: {}",
  "Short Description <short_description> (admin)": "Translate this text to: {}. Maintain the original HTML structure, including all tags, classes, and JavaScript functions exactly as they are. Ensure that any interactive elements such as 'read-more/read-less' buttons function correctly after translation. The translated content should be provided in proper HTML format without any modifications to functionality. Do not add extra information or commentary, and keep the collapsible section hidden by default.",
  "Description <description> (admin)": "Translate this text to: {}. Provide only the translated content in HTML format, maintaining all tags and classes exactly as they are. Only return the translation, without additional information or commentary.",
  "default": "Translate this text to: {}. Only return the translation, without additional information or commentary.",
  "html": "Translate the following HTML content into {target_language}. Preserve all tags and classes exactly as they appear: {}. Only return the translation, without additional information or commentary."
};
