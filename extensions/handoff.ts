/**
 * Handoff extension - generate context handoff and move it to a new session
 *
 * Usage:
 *   /handoff now implement this for teams as well
 *   /handoff execute phase one of the plan
 *   /handoff check other places that need this fix
 */

import type { ExtensionAPI, ExtensionCommandContext, SessionEntry } from "@mariozechner/pi-coding-agent";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

type RoleMessage = {
  role: "user" | "assistant";
  content: unknown;
};

type AssistantRoleMessage = RoleMessage & {
  role: "assistant";
  stopReason?: unknown;
};

const HANDOFF_TIMEOUT_MS = 5 * 60 * 1000;
const HANDOFF_POLL_INTERVAL_MS = 25;

const HANDOFF_INSTRUCTIONS = `You are writing a handoff note for another AI agent with NO access to this chat.

Extract only task-relevant context from this conversation.

Rules:
- Be tight and token-efficient.
- Use only concrete facts from this conversation.
- Prefer specifics: file paths, symbols, commands, errors, outputs, decisions.
- Include constraints/invariants only when explicit, non-negotiable, and task-relevant.
- Include line numbers only if known from this conversation.
- Omit irrelevant history and broad retrospectives.
- Do not invent missing details.
- If a critical detail is unknown, say so briefly and include the smallest verification step.
- Do not write a plan unless one already exists in this conversation.
- Do not call tools.

Output:
- Markdown only.
- Handoff context only (do not restate the task).`;

function getRoleMessage(entry: SessionEntry, role: "user" | "assistant"): RoleMessage | null {
  if (entry.type !== "message" || !isRecord(entry.message)) {
    return null;
  }

  const message = entry.message;
  if (message.role !== role || !("content" in message)) {
    return null;
  }

  return message as RoleMessage;
}

function getAssistantMessage(entry: SessionEntry): AssistantRoleMessage | null {
  const message = getRoleMessage(entry, "assistant");
  if (!message || !isRecord(message)) {
    return null;
  }

  return message as AssistantRoleMessage;
}

function getMessageText(entry: SessionEntry): string {
  if (entry.type !== "message" || !isRecord(entry.message) || !("content" in entry.message)) {
    return "";
  }

  const content = entry.message.content;
  if (typeof content === "string") {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .filter((block): block is { type: "text"; text: string } => isRecord(block) && block.type === "text" && typeof block.text === "string")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function findUserMessageIndex(entries: SessionEntry[], fromIndex: number, text: string): number {
  for (let i = entries.length - 1; i >= fromIndex; i--) {
    const entry = entries[i];
    if (!getRoleMessage(entry, "user")) {
      continue;
    }

    if (getMessageText(entry) === text) {
      return i;
    }
  }

  return -1;
}

function hasAssistantAfterIndex(entries: SessionEntry[], fromIndex: number): boolean {
  for (let i = entries.length - 1; i > fromIndex; i--) {
    const entry = entries[i];
    if (getRoleMessage(entry, "assistant")) {
      return true;
    }
  }

  return false;
}

type HandoffTurn = {
  branch: SessionEntry[];
  handoffUserIndex: number;
};

async function waitForHandoffTurn(
  ctx: ExtensionCommandContext,
  startIndex: number,
  handoffRequest: string,
  timeoutMs = HANDOFF_TIMEOUT_MS,
): Promise<HandoffTurn | null> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const branch = ctx.sessionManager.getBranch();
    const handoffUserIndex = findUserMessageIndex(branch, startIndex, handoffRequest);

    if (handoffUserIndex !== -1 && hasAssistantAfterIndex(branch, handoffUserIndex) && ctx.isIdle()) {
      return {
        branch,
        handoffUserIndex,
      };
    }

    await new Promise<void>((resolve) => setTimeout(resolve, HANDOFF_POLL_INTERVAL_MS));
  }

  return null;
}

function getAssistantText(entries: SessionEntry[], fromIndex: number): string | null {
  for (let i = entries.length - 1; i >= fromIndex; i--) {
    const entry = entries[i];
    const message = getAssistantMessage(entry);
    if (!message) {
      continue;
    }

    if (message.stopReason !== "stop") {
      return null;
    }

    const text = getMessageText(entry);
    if (text.length > 0) {
      return text;
    }
  }

  return null;
}

export default function(pi: ExtensionAPI) {
  pi.registerCommand("handoff", {
    description: "Transfer context to a new focused session",
    handler: async (args, ctx) => {
      const notify = (message: string, level: "info" | "warning" | "error") => {
        ctx.ui?.notify?.(message, level);
      };

      if (!ctx.model) {
        notify("No model selected", "error");
        return;
      }

      const task = args.trim();
      if (!task) {
        notify("Usage: /handoff <goal or task for new thread>", "error");
        return;
      }

      const currentSessionFile = ctx.sessionManager.getSessionFile();
      const startIndex = ctx.sessionManager.getBranch().length;

      const handoffRequest = `${HANDOFF_INSTRUCTIONS}\n\nTask for the next agent:\n${task}`;

      if (ctx.isIdle()) {
        pi.sendUserMessage(handoffRequest);
      } else {
        pi.sendUserMessage(handoffRequest, { deliverAs: "followUp" });
      }

      notify("Generating handoff note...", "info");
      const handoffTurn = await waitForHandoffTurn(ctx, startIndex, handoffRequest);

      if (!handoffTurn) {
        notify("Timed out waiting for handoff note", "error");
        return;
      }

      const handoffNote = getAssistantText(handoffTurn.branch, handoffTurn.handoffUserIndex + 1);

      if (!handoffNote) {
        notify("Failed to capture handoff note from the assistant response", "error");
        return;
      }

      const newSessionResult = await ctx.newSession({
        parentSession: currentSessionFile,
      });

      if (newSessionResult.cancelled) {
        notify("New session cancelled", "info");
        return;
      }

      const promptForNewSession = `${handoffNote}\n\n---\n\n## Task\n${task}`;

      if (ctx.isIdle()) {
        pi.sendUserMessage(promptForNewSession);
      } else {
        pi.sendUserMessage(promptForNewSession, { deliverAs: "followUp" });
      }

      notify("Handoff sent to the new session.", "info");
    },
  });
}
