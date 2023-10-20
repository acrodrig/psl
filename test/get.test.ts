#!/usr/bin/env -S deno test -A --no-check

import { assertEquals } from "std/assert/mod.ts";
import { get } from "../src/psl.ts";

// Test data taken from
// http://mxr.mozilla.org/mozilla-central/source/netwerk/test/unit/data/test_psl.txt?raw=1

// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

Deno.test("get", function () {
  // null input.
  // deno-lint-ignore no-explicit-any
  assertEquals(get(null as any), null);

  // Mixed case.
  assertEquals(get("COM"), null);
  assertEquals(get("example.COM"), "example.com");
  assertEquals(get("WwW.example.COM"), "example.com");

  // Leading dot.
  assertEquals(get(".com"), null);
  assertEquals(get(".example"), null);
  assertEquals(get(".example.com"), null);
  assertEquals(get(".example.example"), null);

  // Unlisted TLD.
  assertEquals(get("example"), null);
  assertEquals(get("example.example"), "example.example");
  assertEquals(get("b.example.example"), "example.example");
  assertEquals(get("a.b.example.example"), "example.example");

  // Listed, but non-Internet, TLD.
  assertEquals(get("local"), null);
  assertEquals(get("example.local"), null);
  assertEquals(get("b.example.local"), null);
  assertEquals(get("a.b.example.local"), null);

  // TLD with only 1 rule.
  assertEquals(get("biz"), null);
  assertEquals(get("domain.biz"), "domain.biz");
  assertEquals(get("b.domain.biz"), "domain.biz");
  assertEquals(get("a.b.domain.biz"), "domain.biz");

  // TLD with some 2-level rules.
  assertEquals(get("com"), null);
  assertEquals(get("example.com"), "example.com");
  assertEquals(get("b.example.com"), "example.com");
  assertEquals(get("a.b.example.com"), "example.com");
  assertEquals(get("uk.com"), null);
  assertEquals(get("example.uk.com"), "example.uk.com");
  assertEquals(get("b.example.uk.com"), "example.uk.com");
  assertEquals(get("a.b.example.uk.com"), "example.uk.com");
  assertEquals(get("test.ac"), "test.ac");

  // More complex TLD.
  assertEquals(get("jp"), null);
  assertEquals(get("test.jp"), "test.jp");
  assertEquals(get("www.test.jp"), "test.jp");
  assertEquals(get("ac.jp"), null);
  assertEquals(get("test.ac.jp"), "test.ac.jp");
  assertEquals(get("www.test.ac.jp"), "test.ac.jp");
  assertEquals(get("kyoto.jp"), null);
  assertEquals(get("test.kyoto.jp"), "test.kyoto.jp");
  assertEquals(get("ide.kyoto.jp"), null);
  assertEquals(get("b.ide.kyoto.jp"), "b.ide.kyoto.jp");
  assertEquals(get("a.b.ide.kyoto.jp"), "b.ide.kyoto.jp");
  assertEquals(get("c.kobe.jp"), null);
  assertEquals(get("b.c.kobe.jp"), "b.c.kobe.jp");
  assertEquals(get("a.b.c.kobe.jp"), "b.c.kobe.jp");
  assertEquals(get("city.kobe.jp"), "city.kobe.jp");
  assertEquals(get("www.city.kobe.jp"), "city.kobe.jp");

  // TLD with a wildcard rule and exceptions.
  assertEquals(get("ck"), null);
  assertEquals(get("test.ck"), null);
  assertEquals(get("b.test.ck"), "b.test.ck");
  assertEquals(get("a.b.test.ck"), "b.test.ck");
  assertEquals(get("www.ck"), "www.ck");
  assertEquals(get("www.www.ck"), "www.ck");

  // US K12.
  assertEquals(get("us"), null);
  assertEquals(get("test.us"), "test.us");
  assertEquals(get("www.test.us"), "test.us");
  assertEquals(get("ak.us"), null);
  assertEquals(get("test.ak.us"), "test.ak.us");
  assertEquals(get("www.test.ak.us"), "test.ak.us");
  assertEquals(get("k12.ak.us"), null);
  assertEquals(get("test.k12.ak.us"), "test.k12.ak.us");
  assertEquals(get("www.test.k12.ak.us"), "test.k12.ak.us");

  // IDN labels.
  assertEquals(get("食狮.com.cn"), "食狮.com.cn");
  assertEquals(get("食狮.公司.cn"), "食狮.公司.cn");
  assertEquals(get("www.食狮.公司.cn"), "食狮.公司.cn");
  assertEquals(get("shishi.公司.cn"), "shishi.公司.cn");
  assertEquals(get("公司.cn"), null);
  assertEquals(get("食狮.中国"), "食狮.中国");
  assertEquals(get("www.食狮.中国"), "食狮.中国");
  assertEquals(get("shishi.中国"), "shishi.中国");
  assertEquals(get("中国"), null);

  // Same as above, but punycoded.
  assertEquals(get("xn--85x722f.com.cn"), "xn--85x722f.com.cn");
  assertEquals(get("xn--85x722f.xn--55qx5d.cn"), "xn--85x722f.xn--55qx5d.cn");
  assertEquals(get("www.xn--85x722f.xn--55qx5d.cn"), "xn--85x722f.xn--55qx5d.cn");
  assertEquals(get("shishi.xn--55qx5d.cn"), "shishi.xn--55qx5d.cn");
  assertEquals(get("xn--55qx5d.cn"), null);
  assertEquals(get("xn--85x722f.xn--fiqs8s"), "xn--85x722f.xn--fiqs8s");
  assertEquals(get("www.xn--85x722f.xn--fiqs8s"), "xn--85x722f.xn--fiqs8s");
  assertEquals(get("shishi.xn--fiqs8s"), "shishi.xn--fiqs8s");
  assertEquals(get("xn--fiqs8s"), null);
});
