"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

export default function Preferences() {
  const { setTheme, theme } = useTheme()
  const [name, setName] = useState("Alex")
  const [enabled, setEnabled] = useState(true)
  const [result, setResult] = useState("")
  const [error, setError] = useState(false)

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const missing = !name.trim()
    setError(missing)
    setResult(missing ? "Enter a display name." : "Preferences saved for this preview.")
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:py-16">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 font-semibold">COMPASS</p>
          <h1 className="text-2xl font-semibold">Preferences</h1>
        </div>
        <label className="flex items-center gap-3">
          <span>Theme</span>
          <select aria-label="Theme" value={theme || "system"} onChange={event => setTheme(event.target.value)} className="h-10 rounded-lg border border-input bg-background px-3">
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </header>
      <form onSubmit={save} noValidate>
        <Card>
          <CardHeader><CardTitle>Profile and notifications</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="display-name" className="font-medium">Display name</label>
              <Input id="display-name" value={name} onChange={event => { setName(event.target.value); setResult("") }} aria-invalid={error} aria-describedby={error ? "save-result" : undefined} autoComplete="off" />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
              <label htmlFor="project-updates" className="font-medium">Project updates</label>
              <Switch id="project-updates" checked={enabled} onCheckedChange={value => { setEnabled(value); setResult("") }} />
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
              <Button type="submit">Save preferences</Button>
              <Button type="button" variant="outline" onClick={() => { setName("Alex"); setEnabled(true); setError(false); setResult("") }}>Reset</Button>
            </div>
            <p id="save-result" role="status" className={`min-h-6 ${error ? "text-destructive" : "text-muted-foreground"}`}>{result}</p>
          </CardContent>
        </Card>
      </form>
      <p className="mt-6 text-muted-foreground">Sample data only. Changes stay in this page and are not sent to a server.</p>
    </main>
  )
}
