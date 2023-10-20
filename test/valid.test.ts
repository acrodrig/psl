#!/usr/bin/env -S deno test -A --no-check

import { assertEquals } from "std/assert/mod.ts";
import { isValid } from "../src/psl.ts";

Deno.test("isValid", function () {
  assertEquals(isValid("google.com"), true);
  assertEquals(isValid("www.google.com"), true);
  assertEquals(isValid("x.yz"), false);
  assertEquals(isValid("github.io"), false);
  assertEquals(isValid("pages.github.io"), true);
  assertEquals(isValid("gov.uk"), false);
  assertEquals(isValid("data.gov.uk"), true);
});
