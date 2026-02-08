# Contributing

We’re happy to take contributions. Here’s the drill:

1. **Fork** the repo.
2. **Branch off:** `git checkout -b feature-name` (or something like `fix/whatever-you-fixed`).
3. **Commit** with a message that actually describes what you did: `git commit -m "Add feature-name"`. Use clear, imperative commit messages; avoid committing "wip" to main.
4. **Push** your branch: `git push origin feature-name`.
5. **Open a PR** against `main`.

**Before pushing to main:** Ensure the build is green. Run `npm install`, then `npm run dev` (or a quick smoke test), and optionally `npm run test`. Main should not have broken builds.

If you need the big picture—how things are wired, how to run stuff—the [docs/](docs/) folder and the main [README](README.md) have you covered.
