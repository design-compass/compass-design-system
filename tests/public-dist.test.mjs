import assert from "node:assert/strict"
import test from "node:test"
import { readFile, readdir, lstat } from "node:fs/promises"
import { join } from "node:path"
import { createHash } from "node:crypto"
import { registrySchema } from "shadcn/schema"
import ts from "typescript"

const root = new URL("../", import.meta.url)
async function entries(path = "") {
  const list = []
  for (const file of await readdir(new URL(path || ".", root))) {
    if ([".git", "node_modules", ".next", "out"].includes(file) || file.endsWith(".tsbuildinfo")) continue
    const name = path ? `${path}/${file}` : file
    const stat = await lstat(new URL(name, root))
    assert.equal(stat.isSymbolicLink(), false, name)
    if (stat.isDirectory()) list.push(...await entries(name))
    else list.push(name)
  }
  return list
}

test("distribution contains only free source and no service or account files", async () => {
  const files = await entries()
  for (const path of files) {
    assert.doesNotMatch(path, /(^|\/)(\.env[^/]*|work|supabase|admin|compass-plus|api)(\/|$)|backup|\.pdf$|\.pages$|\.pem$|\.key$/i)
    if (/\.png$/.test(path)) continue
    const body = await readFile(new URL(path, root), "utf8")
    assert.doesNotMatch(body, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/)
    assert.doesNotMatch(body, /\b(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-proj-[A-Za-z0-9_-]{20,}|sb_secret_[A-Za-z0-9_-]{20,})/)
    assert.doesNotMatch(body, /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/)
    const emails = body.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g) || []
    assert.deepEqual(emails.filter(email => email !== "help@designcompass.org"), [], path)
  }
})

test("exported sources match the reviewed public distribution checksums", async () => {
  const manifest = JSON.parse(await readFile(new URL("distribution.json", root), "utf8"))
  assert.equal(manifest.sharedComponents, 37)
  assert.equal(manifest.registryItems, 42)
  assert.ok(manifest.basicRuleEntries >= 75)
  for (const file of manifest.files) {
    const content = await readFile(new URL(file.path, root))
    assert.equal(createHash("sha256").update(content).digest("hex"), file.sha256, file.path)
  }
})

test("Basic Skill links resolve to local public reference files", async () => {
  const index = await readFile(new URL("skills/compass/references/components.md", root), "utf8")
  for (const match of index.matchAll(/\]\((en|ko)\/([a-z0-9-]+)\.md\)/g)) {
    const reference = await readFile(new URL(`skills/compass/references/${match[1]}/${match[2]}.md`, root), "utf8")
    assert.match(reference, /## Do/)
    assert.match(reference, /## Don't/)
  }
})

test("public registry and local imports are self-contained", async () => {
  const registry = JSON.parse(await readFile(new URL("registry.json", root), "utf8"))
  registrySchema.parse(registry)
  assert.equal(registry.items.length, 42)
  const files = new Set(await entries())
  for (const path of files) {
    if (!path.endsWith(".tsx")) continue
    const ast = ts.createSourceFile(path, await readFile(new URL(path, root), "utf8"), ts.ScriptTarget.Latest, true)
    for (const node of ast.statements) {
      if (!ts.isImportDeclaration(node) || !node.moduleSpecifier.text.startsWith("@/")) continue
      const imported = node.moduleSpecifier.text.slice(2)
      assert.ok(files.has(imported) || files.has(`${imported}.tsx`), `${path}: ${imported}`)
    }
  }
  for (const item of registry.items) assert.ok(item.dependencies.includes("leaflet@1.9.4"))
})
