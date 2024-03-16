import { difference, Unit } from "@std/datetime";
import { sortBy } from "@std/collections";

declare let global: {
  doGet: (e?: GoogleAppsScript.Events.DoGet) =>
    | GoogleAppsScript.HTML.HtmlOutput
    | GoogleAppsScript.Content.TextOutput;
  doPost: (e?: GoogleAppsScript.Events.DoPost) =>
    | GoogleAppsScript.HTML.HtmlOutput
    | GoogleAppsScript.Content.TextOutput;
  [key: string]: () => void;
};

interface Options {
  [labelName: string]:
    | {
      target: "date";
      unit: Unit;
      diff: number;
    }
    | {
      target: "duplicates";
      count: number;
    };
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

global.gmailAutoDelete = () => {
  const options: Options = JSON.parse(
    PropertiesService
      .getScriptProperties()
      .getProperty("OPTIONS") || "{}",
  );

  Object.keys(options).forEach((labelName) => {
    const label = GmailApp.getUserLabelByName(labelName);
    const option = options[labelName];

    switch (option.target) {
      case "date": {
        const { unit, diff } = option;
        trashIfDateLater(label, unit, diff);
        return;
      }
      case "duplicates": {
        const { count } = option;
        trashIfDuplicates(label, count);
        return;
      }
    }
  });
};
