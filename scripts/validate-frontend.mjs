
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const brands = ["adidas", "samsung", "hbo-max", "salcobrand", "score"];
const servicePages = ["videos-corporativos", "comerciales-y-campanas", "contenido-para-redes-sociales",
  "videos-con-ia", "postproduccion-vfx", "cobertura-de-eventos"].map(slug => "producciones/" + slug + ".html");
const solutionPages = ["marcas-y-empresas", "agencias-y-productoras", "instituciones-publicas",
  "restaurantes-bares-y-comercio"].map(slug => "soluciones/" + slug + ".html");
const draftPages = [];
const hubs = ["index.html", "producciones.html", "soluciones.html", "clientes.html", "nosotros.html", "contacto.html"];
const publicPages = [...hubs, ...servicePages, ...solutionPages];
const pages = [...publicPages, ...draftPages];
const clientVideos = new Set(brands.map(brand => "assets/clientes/videos/" + brand + ".mp4"));
const publicAssets = ["assets/bifrost-logo.png", "assets/bifrost-footer.png",
  ...brands.flatMap(brand => ["assets/clientes/posters/" + brand + ".webp", "assets/clientes/logos/" + brand + ".svg"])];
const publicFiles = new Set([...publicPages, ...publicAssets, "styles.css", "script.js", "robots.txt"]);
const copiedExpected = new Set([...publicFiles, "deploy/nginx.conf"]);
const read = file => readFileSync(new URL("../" + file, import.meta.url), "utf8");
const errors = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}
const parse = html => [...html.matchAll(/<([a-z][\w-]*)\b((?:[^"'<>]|"[^"]*"|'[^']*')*)>/gi)]
  .map(([, tag, attrs]) => ({
    tag: tag.toLowerCase(),
    attrs: Object.fromEntries([...attrs.matchAll(/\s+([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g)]
      .map(([, name, double, single]) => [name.toLowerCase(), double ?? single ?? ""])),
  }));

const origin = "https://bifrost.invalid";
const resolve = (file, value) => new URL(value, origin + "/" + file);
const targetOf = url => decodeURIComponent(url.pathname.slice(1)) || "index.html";
const hasClass = (attrs, token) => attrs.class?.split(/\s+/).includes(token);
const byId = tags => new Set(tags.map(({ attrs }) => attrs.id).filter(Boolean));
const stripComments = html => html.replace(/<!--[\s\S]*?-->/g, "");
const stripReview = html => html.replace(/^[ \t]*<!-- review-local -->[ \t]*\r?\n[\s\S]*?^[ \t]*<!-- \/review-local -->[ \t]*\r?\n/gm, "");
const sameSet = (a, b) => a.size === b.size && [...a].every(value => b.has(value));

const copyLines = read("Dockerfile").match(/^COPY .+$/gm) ?? [];
const copied = new Set(copyLines.filter(line => !line.startsWith("COPY --from=prepare "))
  .flatMap(line => line.trim().split(/\s+/).slice(1, -1)));
const [firstIgnore, ...excludes] = read(".dockerignore").trim().split(/\r?\n/);
check(firstIgnore === "**", "El contexto Docker debe excluir todo como regla inicial.");
check(sameSet(copiedExpected, copied), "COPY debe coincidir con la lista de archivos públicos.");
check(sameSet(new Set(excludes), new Set(["!Dockerfile", ...[...copiedExpected].map(file => "!" + file)])),
  ".dockerignore debe incluir exclusivamente los archivos públicos.");
for (const file of publicFiles) read(file);

const development = new Map();
const publication = new Map();
const titles = new Set();
const descriptions = new Set();
for (const file of pages) {
  const raw = read(file);
  const html = stripComments(raw);
  const tags = parse(html);
  const nav = html.match(/<nav class="main-nav"[\s\S]*?<\/nav>/)?.[0] ?? "";
  const menuPaths = parse(nav).filter(({ tag }) => tag === "a")
    .map(({ attrs }) => targetOf(resolve(file, attrs.href)));
  const navigation = ["producciones.html", ...servicePages, "soluciones.html", ...solutionPages,
    "clientes.html", "nosotros.html", "contacto.html"];
  check(JSON.stringify(menuPaths) === JSON.stringify(navigation), file + ": navegación principal incorrecta.");
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = tags.find(({ tag, attrs }) => tag === "meta" && attrs.name === "description")?.attrs.content;
  check(title && !titles.has(title), file + ": title ausente o repetido.");
  check(description && !descriptions.has(description), file + ": descripción ausente o repetida.");
  titles.add(title);
  descriptions.add(description);
  check(!/\[\[(?:PENDIENTE|CORREO_CONTACTO)/.test(html), file + ": marcador visible.");
  check(/^<!doctype html>/i.test(html) && ["es", "es-CL"].includes(tags[0]?.attrs.lang), file + ": falta doctype o idioma.");
  for (const landmark of ["title", "h1", "header", "main", "footer"]) {
    check(tags.filter(({ tag }) => tag === landmark).length === 1, file + ": se esperaba un elemento " + landmark);
  }
  check(tags.filter(({ tag }) => tag === "nav").length === (file === "index.html" ? 1 : 2),
    file + ": navegación o breadcrumbs incorrectos.");
  check(tags.some(({ tag, attrs }) => tag === "main" && attrs.id === "contenido" && attrs.tabindex === "-1"),
    file + ": destino del salto al contenido ausente o sin foco.");
  check(tags.find(({ tag }) => tag === "a")?.attrs.href === "#contenido", file + ": el primer enlace debe saltar al contenido.");
  const current = tags.filter(({ tag, attrs }) => tag === "a" && attrs["aria-current"] === "page");
  const currentHub = file.includes("/") ? file.split("/")[0] + ".html" : file;
  check(current.length === 1 && targetOf(resolve(file, current[0].attrs.href)) === currentHub,
    file + ": enlace de página actual incorrecto.");
  const ids = byId(tags);
  check(ids.size === tags.filter(({ attrs }) => attrs.id).length, file + ": ID duplicado.");
  for (const { tag, attrs } of tags) {
    if (tag === "img") check("alt" in attrs, file + ": imagen sin alt.");
    if (tag === "a" && attrs.target === "_blank") check(attrs.rel?.split(/\s+/).includes("noopener"), file + ": enlace externo sin noopener.");
  }
  for (const [, data] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const json = JSON.parse(data);
      if (servicePages.includes(file)) {
        check(json["@type"] === "FAQPage" && json.mainEntity?.length === 2, file + ": datos de FAQ incompletos.");
      }
    } catch {
      errors.push(file + ": JSON-LD inválido.");
    }
  }
  if (servicePages.includes(file)) {
    check(tags.filter(({ tag }) => tag === "details").length === 2, file + ": se esperaban dos FAQ.");
  }
  if (draftPages.includes(file)) {
    check(tags.some(({ attrs }) => attrs.name === "robots" && attrs.content?.includes("noindex")), file + ": borrador indexable.");
  } else {
    const publicHtml = stripReview(raw);
    check(!/<!-- \/?review-local -->/.test(publicHtml), file + ": bloque local mal delimitado.");
    publication.set(file, parse(stripComments(publicHtml)));
  }
  development.set(file, tags);
}

function checkReference(file, value, available, documents, video = false) {
  const url = resolve(file, value);
  if (url.origin !== origin) return;
  const target = targetOf(url);
  if (video && file === "clientes.html" && clientVideos.has(target)) return;
  check(available.has(target), file + ": referencia local no disponible " + value);
  if (url.hash) {
    check(byId(documents.get(target) ?? []).has(decodeURIComponent(url.hash.slice(1))),
      file + ": fragmento inexistente " + value);
  }
}

function checkDocuments(documents, available) {
  for (const [file, tags] of documents) {
    const ids = byId(tags);
    for (const { tag, attrs } of tags) {
      for (const name of ["href", "src", "poster"]) {
        if (attrs[name]) checkReference(file, attrs[name], available, documents, tag === "video" && name === "src");
      }
      for (const name of ["aria-controls", "aria-labelledby", "aria-describedby"]) {
        for (const id of attrs[name]?.split(/\s+/) ?? []) check(ids.has(id), file + ": referencia ARIA inexistente " + id);
      }
    }
  }
}

checkDocuments(development, new Set([...publicFiles, ...draftPages]));
checkDocuments(publication, publicFiles);
for (const [, value] of read("styles.css").matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
  checkReference("styles.css", value.trim(), publicFiles, publication);
}

const homeTags = development.get("index.html");
const players = development.get("clientes.html").filter(({ tag }) => tag === "video");
check(!homeTags.some(({ tag }) => tag === "video"), "Inicio debe funcionar sin reproductores.");
check(!homeTags.some(({ attrs }) => hasClass(attrs, "slider-controls") || hasClass(attrs, "home-links")),
  "Inicio conserva controles antiguos del carrusel.");
check(homeTags.some(({ tag, attrs }) => tag === "button" && hasClass(attrs, "slider-toggle") &&
  attrs["aria-controls"] === "clientSlider" && "aria-pressed" in attrs && "hidden" in attrs),
  "Falta el botón de pausa accesible del carrusel.");
check(players.length === brands.length, "Clientes debe incluir un reproductor por marca.");
for (const brand of brands) {
  const src = "assets/clientes/videos/" + brand + ".mp4";
  const matching = players.filter(({ attrs }) => attrs.src === src);
  check(matching.length === 1, "Reproductor ausente o repetido: " + brand);
  if (matching.length === 1) {
    const { attrs } = matching[0];
    check(attrs.preload === "none" && "controls" in attrs && "playsinline" in attrs &&
      !("autoplay" in attrs) && attrs.poster === "assets/clientes/posters/" + brand + ".webp",
      "Configuración de reproducción incorrecta: " + brand);
  }
  check(homeTags.some(({ tag, attrs }) => tag === "a" && attrs.href === "clientes.html#" + brand),
    "Falta enlace desde el carrusel: " + brand);
  try {
    execFileSync("git", ["check-ignore", "-q", "--", src], { stdio: "ignore" });
  } catch {
    errors.push("Video sin excluir de Git: " + src);
  }
}

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
for (const file of tracked) {
  check(!/^assets\/clientes\/videos\//i.test(file) &&
    !/(^|\/)(?:crm|bi|auditoria-crm|\.aws|\.claude|\.codex)(?:\/|$)/i.test(file) &&
    !/(^|\/)(?:\.env(?:\..*)?|id_rsa|id_ed25519)(?:$|\/)|\.(?:pem|key|p12|pfx)$/i.test(file),
    "Ruta sensible o fuera de alcance registrada en Git: " + file);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else if (process.argv.includes("--public-routes")) {
  console.log([...publicFiles].join("\n"));
} else if (process.argv.includes("--draft-routes")) {
  console.log(draftPages.join("\n"));
} else {
  console.log(pages.length + " páginas de desarrollo y " + publicPages.length + " páginas públicas verificadas.");
}
