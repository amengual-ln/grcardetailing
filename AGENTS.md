<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Agent directives

## Communication
- Keep responses short and direct. No preambles, no closing summaries, no narrating what you're about to do.
- If something is obvious from context, skip it.
- Code speaks for itself. Don't describe it line by line.

## Technical judgment
- **Don't assume the user's request is the best solution.** If there's a simpler, more performant, or more maintainable alternative, propose it first with a brief reason why.
- Call out trade-offs when relevant. One sentence is enough.
- If a design decision looks problematic down the line, say so — even if not asked.

## Code
- Always go for the simplest solution that solves the problem. Don't over-engineer.
- Follow existing project conventions (folder structure, naming, server actions patterns, etc.).
- Prefer composition over duplication. If something repeats twice, abstract it.
- Strict TypeScript. No `any` unless unavoidable — comment why when used.
- Before creating a new file, check if an equivalent already exists in the project.

## Priorities (in order)
1. Correctness
2. Maintainability
3. Performance
4. Code brevity
