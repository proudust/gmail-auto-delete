import { assertEquals } from "@std/assert";
import { parseLabel } from "./main.ts";

Deno.test("parseLabel - KeepFor days", () => {
  const result = parseLabel("AutoDelete/KeepFor-7days");
  assertEquals(result, {
    type: "keepFor",
    value: 7,
    unit: "days",
  });
});

Deno.test("parseLabel - KeepFor weeks", () => {
  const result = parseLabel("AutoDelete/KeepFor-1weeks");
  assertEquals(result, {
    type: "keepFor",
    value: 1,
    unit: "weeks",
  });
});

Deno.test("parseLabel - KeepFor months", () => {
  const result = parseLabel("AutoDelete/KeepFor-3months");
  assertEquals(result, {
    type: "keepFor",
    value: 3,
    unit: "months",
  });
});

Deno.test("parseLabel - KeepFor years", () => {
  const result = parseLabel("AutoDelete/KeepFor-1years");
  assertEquals(result, {
    type: "keepFor",
    value: 1,
    unit: "years",
  });
});

Deno.test("parseLabel - KeepLatest", () => {
  const result = parseLabel("AutoDelete/KeepLatest-5");
  assertEquals(result, {
    type: "keepLatest",
    value: 5,
  });
});

Deno.test("parseLabel - KeepLatest with large number", () => {
  const result = parseLabel("AutoDelete/KeepLatest-100");
  assertEquals(result, {
    type: "keepLatest",
    value: 100,
  });
});

Deno.test("parseLabel - KeepLatest without count (default 1)", () => {
  const result = parseLabel("AutoDelete/KeepLatest");
  assertEquals(result, {
    type: "keepLatest",
    value: 1,
  });
});

Deno.test("parseLabel - Invalid label (no prefix)", () => {
  const result = parseLabel("KeepFor-7days");
  assertEquals(result, null);
});

Deno.test("parseLabel - Invalid label (wrong format)", () => {
  const result = parseLabel("AutoDelete/KeepFor-7");
  assertEquals(result, null);
});

Deno.test("parseLabel - Invalid label (unknown unit)", () => {
  const result = parseLabel("AutoDelete/KeepFor-7hours");
  assertEquals(result, null);
});

Deno.test("parseLabel - Invalid label (empty)", () => {
  const result = parseLabel("");
  assertEquals(result, null);
});
