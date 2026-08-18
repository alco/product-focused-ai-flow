<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- From `hotel_chat/frontend`, run `pnpm exec intent list` to see available local skills.
- If a listed skill matches the task, run `pnpm exec intent load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- For work that spans packages but changes the frontend, run the skill check from `hotel_chat/frontend` and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->
