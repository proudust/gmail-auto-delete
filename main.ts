/// <reference path="https://raw.githubusercontent.com/proudust/deno-gas-types/main/types/index.d.ts" />

import { sortBy } from "@std/collections";
import { difference, Unit } from "@std/datetime";

declare let global: {
  doGet: (e?: GoogleAppsScript.Events.DoGet) =>
    | GoogleAppsScript.HTML.HtmlOutput
    | GoogleAppsScript.Content.TextOutput;
  doPost: (e?: GoogleAppsScript.Events.DoPost) =>
    | GoogleAppsScript.HTML.HtmlOutput
    | GoogleAppsScript.Content.TextOutput;
  [key: string]: () => void;
};

interface DeleteConfig {
  type: "keepFor" | "keepLatest";
  unit?: Unit;
  value: number;
}

function trashIfDateLater(
  label: GoogleAppsScript.Gmail.GmailLabel,
  unit: Unit,
  diff: number,
): void {
  label
    .getThreads()
    .filter((thread) =>
      diff <= (difference(
        new Date(),
        thread.getLastMessageDate() as Date,
      )[unit] || Number.MIN_VALUE)
    )
    .forEach((thread) => {
      console.log(
        `Trash: ${thread.getFirstMessageSubject()} (${thread.getLastMessageDate().toISOString()})`,
      );
      return thread.moveToTrash();
    });
}

function trashIfDuplicates(
  label: GoogleAppsScript.Gmail.GmailLabel,
  count: number,
) {
  sortBy(
    label.getThreads(),
    (thread) => thread.getLastMessageDate().getMilliseconds(),
  )
    .slice(count)
    .forEach((thread) => {
      console.log(
        `Trash: ${thread.getFirstMessageSubject()} (${thread.getLastMessageDate().toISOString()})`,
      );
      return thread.moveToTrash();
    });
}

export function parseLabel(labelName: string): DeleteConfig | null {
  // Parse AutoDelete/KeepFor-{count}{unit} format
  const keepForMatch = labelName.match(
    /^AutoDelete\/KeepFor-(\d+)(days|weeks|months|years)$/,
  );
  if (keepForMatch) {
    return {
      type: "keepFor",
      value: parseInt(keepForMatch[1]),
      unit: keepForMatch[2] as Unit,
    } as const;
  }

  // Parse AutoDelete/KeepLatest(-{count})? format (count is optional, defaults to 1)
  const keepLatestMatch = labelName.match(
    /^AutoDelete\/KeepLatest(?:-(\d+))?$/,
  );
  if (keepLatestMatch) {
    return {
      type: "keepLatest",
      value: keepLatestMatch[1] ? parseInt(keepLatestMatch[1]) : 1,
    } as const;
  }

  return null;
}

global.gmailAutoDelete = () => {
  GmailApp.getUserLabels().forEach((label) => {
    const labelName = label.getName();
    const config = parseLabel(labelName);
    if (!config) return;

    console.log(`Find label: "${labelName}" -> ${JSON.stringify(config)}`);

    if (config.type === "keepFor") {
      trashIfDateLater(label, config.unit!, config.value);
    } else if (config.type === "keepLatest") {
      trashIfDuplicates(label, config.value);
    }
  });
};
