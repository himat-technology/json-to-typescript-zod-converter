# JSON to TypeScript & Zod Converter

<p align="center">
  <strong>HiMat Technology</strong> · Free Developer Tool<br/>
  Convert JSON into production-ready <b>TypeScript</b> types and <b>Zod</b> schemas — 100% in your browser.
</p>

<p align="center">
  <a href="https://himat.tech/free-tools/json-to-typescript-zod-converter"><b>Live Demo</b></a>
  ·
  <a href="https://himat.co.in">himat.co.in</a>
  ·
  <a href="mailto:info@himat.co.in">info@himat.co.in</a>
</p>

---

## Live Demo

Try the converter online:

**https://himat.tech/free-tools/json-to-typescript-zod-converter**

## About HiMat Technology

HiMat Technology builds practical developer utilities and digital products.

| | |
|---|---|
| **Website** | [himat.co.in](https://himat.co.in) |
| **Email** | [info@himat.co.in](mailto:info@himat.co.in) |
| **Phone** | [94452 34023](tel:+919445234023) |
| **Demo** | [JSON → TypeScript & Zod Converter](https://himat.tech/free-tools/json-to-typescript-zod-converter) |

### Social

- [Facebook — Himat Technology](https://www.facebook.com/people/Himat-technology/61593829197445/)
- [LinkedIn — Himat Technology](https://www.linkedin.com/company/himat-technology)
- [Instagram — @himat_technology](https://www.instagram.com/himat_technology)

## Screenshots

> Placeholder: add UI screenshots of the converter workspace (input panel + generated output) here.

## Features

- **JSON → TypeScript interfaces** or type aliases
- **JSON → Zod schemas** with `z.infer` types
- Combined TypeScript + Zod output
- Nested object naming (`UserProfile_Profile_Socials`)
- Arrays, mixed unions, null, empty arrays
- Optional (`?`) and `readonly` field toggles
- Smart string detection (email, URL, ISO datetime)
- Browser-local JSON auto-repair (trailing commas, unquoted keys, single quotes)
- Quick presets: User Profile, E-Commerce Order, AI Agent Payload
- Copy + download `.ts`
- Interactive payload validator powered by runtime Zod
- Live statistics (properties, depth, lines, size)
- Light / dark mode
- Responsive desktop & mobile layout
- **100% browser-local** — your JSON never leaves the device

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Zod
- Lucide React
- Vitest

## Installation

```bash
npm install
```

## Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
npm run build
npm run start
```

## Testing

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

## Linting

```bash
npm run lint
```

## Architecture

```text
src/
  app/                  # Next.js App Router pages & styles
  components/           # UI (config, editor, output, validator)
  lib/
    parser/             # JSON parse/repair, type inference, naming, stats
    generators/         # TypeScript & Zod code generation
    validation/         # Runtime Zod schema builder + payload tests
    utils/              # Clipboard, download, formatting helpers
  types/                # Shared converter types
```

Business logic lives in `src/lib/*` and is independent of React. The UI calls `convertJson()` which:

1. Validates the root type name
2. Parses JSON in the browser
3. Recursively infers an `InferredType` tree
4. Generates TypeScript / Zod source strings
5. Computes statistics

The payload tester builds a **runtime** Zod schema from the same inference tree and runs `safeParse` locally.

### Type inference

- Primitives → `string` | `number` | `boolean` | `null`
- Objects → named nested declarations (`Root_Key_NestedKey`)
- Homogeneous arrays → `T[]`
- Mixed arrays → `(A | B | C)[]`
- Empty arrays → `unknown[]`
- Invalid JSON keys are sanitized into valid PascalCase type segments

### Zod generation

Maps inferred types to `z.string()`, `z.number()`, `z.boolean()`, `z.null()`, `z.array()`, `z.object()`, `z.union()`, plus `.optional()`, `.nullable()`, and smart refinements (`.email()`, `.url()`, `.datetime()`).

## Privacy Model

- No backend API for conversion
- No database
- No authentication
- No analytics that transmit your JSON
- After the app loads, conversion works offline

Your payloads stay in memory in the current browser tab.

## Contact & Support

Questions about this tool or HiMat Technology?

- **Email:** [info@himat.co.in](mailto:info@himat.co.in)
- **Phone:** [94452 34023](tel:+919445234023)
- **Web:** [himat.co.in](https://himat.co.in)
- **Demo:** [himat.tech free tool](https://himat.tech/free-tools/json-to-typescript-zod-converter)
- **Facebook:** [Himat Technology](https://www.facebook.com/people/Himat-technology/61593829197445/)
- **LinkedIn:** [Himat Technology](https://www.linkedin.com/company/himat-technology)
- **Instagram:** [@himat_technology](https://www.instagram.com/himat_technology)

## Contribution

1. Fork / clone the repository
2. Create a feature branch
3. Add or update tests under `src/lib/__tests__`
4. Run `npm test`, `npm run lint`, and `npm run build`
5. Open a pull request

## License

MIT — see [LICENSE](./LICENSE).

---

<p align="center">
  Built with care by <a href="https://himat.co.in"><b>HiMat Technology</b></a><br/>
  <a href="https://himat.tech/free-tools/json-to-typescript-zod-converter">Live Demo</a>
  · <a href="mailto:info@himat.co.in">info@himat.co.in</a>
  · <a href="tel:+919445234023">94452 34023</a>
</p>
