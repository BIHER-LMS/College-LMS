# Obsidian Memory Strict Update Rule

## Mandate
You **MUST** update the Obsidian knowledge base located in `docs/Obsidian-Vault/` after every query implementation, bug fix, error resolution, new feature implementation, and major thought process/decision.

## When to apply this rule
- Whenever you fix a bug (e.g. database error, UI issue).
- Whenever you implement a new feature.
- Whenever you make an architectural or design decision.
- Whenever you resolve an error.

## Actions Required
1. Identify the relevant Markdown files in `docs/Obsidian-Vault/` to update.
   - Typically `06_Development_Log_&_Bugs.md` for bug fixes and development logs.
   - `08_Conversation_History_&_Decisions.md` for decisions and context.
   - `10_Comprehensive_Project_Report.md` for overall status.
2. Formulate a concise summary of the issue, the fix, the files modified, and the thought process.
3. Update the files using your available file modification tools (e.g., `replace_file_content` or `multi_replace_file_content`).
4. **Never end a session or consider a task complete without ensuring the Obsidian Vault accurately reflects your recent work.**
