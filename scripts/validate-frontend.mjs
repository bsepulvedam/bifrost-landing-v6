import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { posix } from "node:path";

const pages = ["index.html", "producciones.html", "soluciones.html", "nosotros.html", "contacto.html"];
const knownMissingVideo = "assets/clientes/cliente-01.mp4";
const read = (file) => readFileSync(new URL("../" + file, import.meta.url), "utf8");
const errors = [];
const check = (condition, message) => {
  if (!condition) errors.push(message);
};

const copyLines = read("Dockerfile").match(/^COPY .+$/gm) ?? [];
const copied = new Set(copyLines.flatMap((line) => line.trim().split(/\s+/).slice(1, -1)));
const published = new Set([...copied].filter((file) => file !== "deploy/nginx.conf"));
const ignore = read(".dockerignore").trim().split(/\r?\n/);
check(ignore[0] === "**", "El contexto Docker debe excluir todo como regla inicial.");
for (const file of copied) {
  check(!file.includes("*") && ignore.includes("!" + file), "COPY sin ruta explícita en .dockerignore: " + file);
}
for (const line of ignore.slice(1)) {
  const entry = line.slice(1);
  check(line.startsWith("!") && (entry === "Dockerfile" || copied.has(entry)),
    "Entrada inesperada en .dockerignore: " + line);
}
for (const file of published) {
  check(pages.includes(file) || file === "styles.css" || file === "script.js" ||
    /^assets\/[\w./-]+\.(?:png|jpe?g|webp|avif|svg|mp4|webm)$/.test(file) && !file.split("/").includes(".."),
    "Archivo fuera del alcance público en COPY: " + file);
  try {
    readFileSync(new URL("../" + file, import.meta.url));
  } catch {
    errors.push("Archivo de publicación inexistente: " + file);
  }
}

const documents = new Map();
for (const file of pages) {
  const html = read(file);
  const tags = [...html.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<([a-z][\w-]*)\b((?:[^"'<>]|"[^"]*"|'[^']*')*)>/gi)]
    .map(([, tag, attrs]) => ({
      tag: tag.toLowerCase(),
      attrs: Object.fromEntries([...attrs.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
        .map(([, name, double, single]) => [name.toLowerCase(), double ?? single])),
    }));
  const ids = new Set();
  for (const { tag, attrs } of tags) {
    if (attrs.id) {
      check(!ids.has(attrs.id), file + ": ID duplicado " + attrs.id);
      ids.add(attrs.id);
    }
    if (tag === "img") check("alt" in attrs, file + ": imagen sin alt");
  }
  check(published.has(file), file + ": página fuera del artefacto");
  check(/^<!doctype html>/i.test(html) && tags[0]?.attrs.lang === "es", file + ": falta doctype o idioma");
  for (const landmark of ["title", "h1", "header", "nav", "main", "footer"]) {
    check(tags.filter(({ tag }) => tag === landmark).length === 1, file + ": se esperaba un elemento " + landmark);
  }
  check(tags.some(({ tag, attrs }) => tag === "main" && attrs.id === "contenido" && attrs.tabindex === "-1"),
    file + ": destino del salto al contenido ausente o sin foco");
  check(tags.find(({ tag }) => tag === "a")?.attrs.href === "#contenido", file + ": el primer enlace debe saltar al contenido");
  const current = tags.filter(({ attrs }) => attrs["aria-current"] === "page");
  check(current.length === 1 && current[0]?.attrs.href === file, file + ": enlace de página actual incorrecto");
  documents.set(file, { tags, ids });
}

const warnings = [];
function checkReference(file, value, allowMissingVideo = false) {
  const url = new URL(value, "https://bifrost.invalid/" + file);
  if (url.origin !== "https://bifrost.invalid") return;
  const target = posix.normalize(decodeURIComponent(url.pathname).slice(1) || "index.html");
  if (allowMissingVideo && target === knownMissingVideo && !published.has(target)) {
    warnings.push(file + ": pendiente incorporar el MP4 aprobado a la lista pública.");
    return;
  }
  check(published.has(target), file + ": referencia local fuera del artefacto " + value);
  if (url.hash) {
    check(documents.get(target)?.ids.has(decodeURIComponent(url.hash.slice(1))),
      file + ": destino de fragmento inexistente " + value);
  }
}

for (const [file, { tags, ids }] of documents) {
  for (const { tag, attrs } of tags) {
    for (const name of ["href", "src", "poster"]) {
      if (attrs[name]) checkReference(file, attrs[name], file === "index.html" && tag === "video" && name === "src");
    }
    for (const name of ["aria-controls", "aria-labelledby", "aria-describedby"]) {
      for (const id of attrs[name]?.split(/\s+/) ?? []) {
        check(ids.has(id), file + ": referencia de " + name + " inexistente " + id);
      }
    }
  }
}
for (const [, value] of read("styles.css").matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
  checkReference("styles.css", value.trim());
}

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
for (const file of tracked) {
  check(!/(^|\/)(?:crm|bi|auditoria-crm|\.aws|\.claude|\.codex)(?:\/|$)/i.test(file) &&
    !/(^|\/)(?:\.env(?:\..*)?|id_rsa|id_ed25519)(?:$|\/)|\.(?:pem|key|p12|pfx)$/i.test(file),
    "Ruta sensible o fuera de alcance registrada en Git: " + file);
}

for (const warning of new Set(warnings)) console.warn(warning);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Validación básica del frontend y de la lista pública correcta.");
}
