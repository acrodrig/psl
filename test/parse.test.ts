#!/usr/bin/env -S deno test -A --no-check

import { assertEquals, assertThrows } from "std/assert/mod.ts";
import { ERROR_CODES, parse } from "../src/psl.ts";

Deno.test("should throw when no domain passed", function () {
  assertThrows(function () {
    parse(1 as unknown as string);
  });
});

Deno.test("should return obj with error when domain too short", function () {
  const parsed = parse("");
  assertEquals(parsed.input, "");
  assertEquals(parsed.error, ERROR_CODES.DOMAIN_TOO_SHORT);
});

Deno.test("should return obj with error when domain too long", function () {
  const str = new Array(256).fill("x").join("");
  assertEquals(str.length, 256);
  const parsed = parse(str);
  assertEquals(parsed.input, str);
  assertEquals(parsed.error, ERROR_CODES.DOMAIN_TOO_LONG);
});

Deno.test("should return obj with error when label too short", function () {
  const parsed = parse("a..com");
  assertEquals(parsed.input, "a..com");
  assertEquals(parsed.error, ERROR_CODES.LABEL_TOO_SHORT);
});

Deno.test("should return obj with error when label too long", function () {
  const str = new Array(64).fill("x").join("");
  assertEquals(str.length, 64);
  const parsed = parse(str + ".com");
  assertEquals(parsed.input, str + ".com");
  assertEquals(parsed.error, ERROR_CODES.LABEL_TOO_LONG);
});

Deno.test("should return obj with error when domain starts with a dash", function () {
  const parsed = parse("-foo");
  assertEquals(parsed.input, "-foo");
  assertEquals(parsed.error, ERROR_CODES.LABEL_STARTS_WITH_DASH);
});

Deno.test("should throw when label starts with a dash", function () {
  const parsed = parse("aa.-foo.com");
  assertEquals(parsed.input, "aa.-foo.com");
  assertEquals(parsed.error, ERROR_CODES.LABEL_STARTS_WITH_DASH);
});

Deno.test("should throw when domain ends with a dash", function () {
  const parsed = parse("foo-");
  assertEquals(parsed.input, "foo-");
  assertEquals(parsed.error, ERROR_CODES.LABEL_ENDS_WITH_DASH);
});

Deno.test("should throw when label ends with a dash", function () {
  const parsed = parse("foo-.net");
  assertEquals(parsed.input, "foo-.net");
  assertEquals(parsed.error, ERROR_CODES.LABEL_ENDS_WITH_DASH);
});

Deno.test("should throw when domain has invalid chars", function () {
  const parsed = parse("foo-^%&!*&^.com");
  assertEquals(parsed.input, "foo-^%&!*&^.com");
  assertEquals(parsed.error, ERROR_CODES.LABEL_INVALID_CHARS);
});

Deno.test("should parse not-listed punycode domain", function () {
  const parsed = parse("xn----dqo34k.xn----dqo34k");
  assertEquals(parsed.tld, "xn----dqo34k");
  assertEquals(parsed.sld, "xn----dqo34k");
  assertEquals(parsed.domain, "xn----dqo34k.xn----dqo34k");
  assertEquals(parsed.subdomain, null);
  assertEquals(parsed.listed, false);
});

Deno.test("should parse a blogspot.co.uk domain", function () {
  const parsed = parse("foo.blogspot.co.uk");
  assertEquals(parsed.tld, "blogspot.co.uk");
  assertEquals(parsed.sld, "foo");
  assertEquals(parsed.domain, "foo.blogspot.co.uk");
  assertEquals(parsed.subdomain, null);
  assertEquals(parsed.listed, true);
});

Deno.test("should parse domain without subdomains", function () {
  const parsed = parse("google.com");
  assertEquals(parsed.tld, "com");
  assertEquals(parsed.sld, "google");
  assertEquals(parsed.domain, "google.com");
  assertEquals(parsed.subdomain, null);
  assertEquals(parsed.listed, true);
});

Deno.test("should parse domain with subdomains", function () {
  const parsed = parse("www.google.com");
  assertEquals(parsed.tld, "com");
  assertEquals(parsed.sld, "google");
  assertEquals(parsed.domain, "google.com");
  assertEquals(parsed.subdomain, "www");
  assertEquals(parsed.listed, true);
});

Deno.test("should parse FQDN", function () {
  const parsed = parse("www.google.com.");
  assertEquals(parsed.tld, "com");
  assertEquals(parsed.sld, "google");
  assertEquals(parsed.domain, "google.com");
  assertEquals(parsed.subdomain, "www");
  assertEquals(parsed.listed, true);
});

Deno.test("should parse a.b.c.d.foo.com", function () {
  const parsed = parse("a.b.c.d.foo.com");
  assertEquals(parsed.tld, "com");
  assertEquals(parsed.sld, "foo");
  assertEquals(parsed.domain, "foo.com");
  assertEquals(parsed.subdomain, "a.b.c.d");
  assertEquals(parsed.listed, true);
});

Deno.test("should parse data.gov.uk", function () {
  const parsed = parse("data.gov.uk");
  assertEquals(parsed.tld, "gov.uk");
  assertEquals(parsed.sld, "data");
  assertEquals(parsed.domain, "data.gov.uk");
  assertEquals(parsed.subdomain, null);
  assertEquals(parsed.listed, true);
});

Deno.test("should parse gov.uk", function () {
  const parsed = parse("gov.uk");
  assertEquals(parsed.tld, "gov.uk");
  assertEquals(parsed.sld, null);
  assertEquals(parsed.domain, null);
  assertEquals(parsed.subdomain, null);
  assertEquals(parsed.listed, true);
});

Deno.test("should parse github.io", function () {
  const parsed = parse("github.io");
  assertEquals(parsed.tld, "github.io");
  assertEquals(parsed.sld, null);
  assertEquals(parsed.domain, null);
  assertEquals(parsed.subdomain, null);
  assertEquals(parsed.listed, true);
});
