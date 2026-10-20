import { readFile, writeFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { registrySchema, registryItemSchema } from "shadcn/schema"

const root = new URL("../", import.meta.url)
const origin = "https://raw.githubusercontent.com/design-compass/compass-design-system/main/r"
const index = registrySchema.parse(JSON.parse(await readFile(new URL("registry.json", root), "utf8")))
for (const item of index.items) for (const file of item.files || []) {
  if ("content" in file) throw new Error("The public index must reference files, not embed their content.")
}
const built = spawnSync(process.execPath, ["node_modules/shadcn/dist/index.js", "build", "--output", "r"], { cwd: fileURLToPath(root), stdio: "inherit" })
if (built.status !== 0) process.exit(built.status || 1)

const paths = ["registry.json", "r/registry.json", ...index.items.map(item => `r/${item.name}.json`)]
for (const item of index.items) {
  const path = new URL(`r/${item.name}.json`, root)
  const payload = registryItemSchema.parse(JSON.parse(await readFile(path, "utf8")))
  for (const dependency of payload.registryDependencies || []) {
    if (!dependency.startsWith(`${origin}/`)) throw new Error(`External registry dependency: ${dependency}`)
  }
}
const distributionPath = new URL("distribution.json", root)
const distribution = JSON.parse(await readFile(distributionPath, "utf8"))
const records = new Map(distribution.files.filter(file => !file.path.startsWith("r/")).map(file => [file.path, file]))
for (const path of [...paths, "README.md"]) records.set(path, {
  path,
  origin: path === "README.md" ? "reviewed-public-readme" : "public-directory-registry",
  sha256: createHash("sha256").update(await readFile(new URL(path, root))).digest("hex"),
})
distribution.files = [...records.values()].sort((a, b) => a.path.localeCompare(b.path))
await writeFile(distributionPath, JSON.stringify(distribution, null, 2) + "\n")
console.log(`Built ${index.items.length} public items at ${origin}/{name}.json`)
