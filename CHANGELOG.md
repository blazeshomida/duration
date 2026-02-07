# Changelog

## Unreleased

### Chores

- chore(*): 🎉 initialize repository scaffolding

Add baseline project files for licensing, documentation, and changelog
automation.

- 🔧 add git-cliff configuration and changelog generation tasks
- 📝 add README and placeholder CHANGELOG
- 🔨 add deno.json tasks and exclusions
- 📦 add MIT license and default gitignore

* chore(ci): 👷 add continuous integration workflow

Introduce a GitHub Actions CI pipeline to verify code quality and release
readiness.

- 👷 run deno verify tasks on pushes and pull requests
- 🔧 install and use git-cliff for changelog preview validation
- 📦 add publish dry-run to catch JSR release issues early
- 📝 document development and verification commands in README

### Features

- feat(core): ✨ implement Duration api with parsing, formatting, and arithmetic

Introduce the initial Duration implementation and publish-ready module surface.

- ✨ add Duration factories, conversions with rounding, and comparison helpers
- ✨ support parsing duration strings with strict and partial modes
- ✨ format human-readable outputs with negative handling
- ✅ add comprehensive Deno tests covering parsing, arithmetic, and formatting
- 📝 expand README with installation, api overview, and examples
- 🔧 configure deno.json for JSR publishing and add verification tasks
