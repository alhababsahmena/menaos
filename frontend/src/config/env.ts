import { z } from 'zod'

const BoolFromString = z
  .union([z.boolean(), z.string()])
  .transform((value, ctx) => {
    if (typeof value === 'boolean') return value
    const lowered = value.trim().toLowerCase()
    if (lowered === 'true' || lowered === '1') return true
    if (lowered === 'false' || lowered === '0' || lowered === '') return false
    ctx.addIssue({
      code: 'custom',
      message: `Expected a boolean-like string ("true" | "false" | "1" | "0"), got "${value}"`,
    })
    return z.NEVER
  })

const EnvSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .url({ message: 'VITE_API_BASE_URL must be a valid URL' })
    .default('http://localhost:8000/api'),
  VITE_USE_MOCKS: BoolFromString.default(true),
})

export type Env = z.infer<typeof EnvSchema>

function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(import.meta.env)
  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n')
    throw new Error(
      `[menaos] Invalid frontend environment configuration:\n${formatted}\n` +
        `Copy frontend/.env.example to frontend/.env and adjust.`,
    )
  }
  return parsed.data
}

export const env: Env = loadEnv()
