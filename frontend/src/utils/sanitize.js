/**
 * Sanitiza HTML para prevenir XSS
 * @param {string} dirty - HTML sucio
 * @returns {string} - HTML sanitizado
 */
export function sanitizeHTML(dirty) {
  if (!dirty) return "";
  const div = document.createElement("div");
  div.textContent = dirty;
  return div.innerHTML;
}

/**
 * Sanitiza texto plano (sin HTML)
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export function sanitizeText(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.textContent || div.innerText || "";
}

/**
 * Renderiza contenido de usuario de forma segura
 * @param {string} content - Contenido a renderizar
 * @param {boolean} allowHTML - Si permite HTML básico (solo cuando tengas DOMPurify)
 * @returns {string} - Contenido seguro para renderizar
 */
export function safeRender(content, allowHTML = false) {
  if (!content) return "";
  if (allowHTML) {
    return sanitizeHTML(content);
  }
  return sanitizeText(content);
}
