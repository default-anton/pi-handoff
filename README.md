# pi-handoff

Handoff command extension package for [pi](https://github.com/badlogic/pi-mono).

## Installation

From npm (after publish):

```bash
pi install npm:pi-handoff
```

From git:

```bash
pi install git:github.com/default-anton/pi-handoff
```

Or use without installing:

```bash
pi -e npm:pi-handoff
# or
pi -e git:github.com/default-anton/pi-handoff
```

## What it does

- Registers a `/handoff` command.
- Generates a concise handoff note from current session context.
- Creates a new session linked to the current session.
- Prefills the new session editor with handoff context plus task.

## Command usage

```bash
/handoff <goal or task for new thread>
```

Examples:

```bash
/handoff now implement this for teams as well
/handoff execute phase one of the plan
/handoff check other places that need this fix
```

## Requirements

- pi coding agent with extension loading enabled.

## License

Apache-2.0
