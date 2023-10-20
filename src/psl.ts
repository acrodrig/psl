import unicode from "punycode/punycode.js";
import RULES from "../data/rules.json" assert { type: "json" };

export const ERROR_CODES = {
  DOMAIN_TOO_SHORT: "DOMAIN_TOO_SHORT",
  DOMAIN_TOO_LONG: "DOMAIN_TOO_LONG",
  LABEL_STARTS_WITH_DASH: "LABEL_STARTS_WITH_DASH",
  LABEL_ENDS_WITH_DASH: "LABEL_ENDS_WITH_DASH",
  LABEL_TOO_LONG: "LABEL_TOO_LONG",
  LABEL_TOO_SHORT: "LABEL_TOO_SHORT",
  LABEL_INVALID_CHARS: "LABEL_INVALID_CHARS",
};

export const ERROR_MESSAGES = {
  DOMAIN_TOO_SHORT: "Domain name too short.",
  DOMAIN_TOO_LONG: "Domain name too long. It should be no more than 255 chars.",
  LABEL_STARTS_WITH_DASH: "Domain name label can not start with a dash.",
  LABEL_ENDS_WITH_DASH: "Domain name label can not end with a dash.",
  LABEL_TOO_LONG: "Domain name label should be at most 63 chars long.",
  LABEL_TOO_SHORT: "Domain name label should be at least 1 character long.",
  LABEL_INVALID_CHARS: "Domain name label can only contain alphanumeric characters or dashes.",
};

interface Rule {
  rule: string;
  suffix: string;
  punySuffix: string | undefined;
  wildcard: boolean;
  exception: boolean;
}

export class Result {
  input: string;
  tld: string | null = null;
  sld: string | null = null;
  domain: string | null = null;
  subdomain: string | null = null;
  listed = false;
  error?: keyof typeof ERROR_CODES;

  constructor(input: string) {
    this.input = input;
  }
}

// Read rules from file.
const rules = RULES.map(function (rule): Rule {
  return {
    rule: rule,
    suffix: rule.replace(/^(\*\.|!)/, ""),
    punySuffix: undefined,
    wildcard: rule.charAt(0) === "*",
    exception: rule.charAt(0) === "!",
  };
});

// Find rule for a given domain.
function findRule(domain: string) {
  const punyDomain = unicode.toASCII(domain);
  return rules.reduce(function (memo: Rule, rule) {
    if (rule.punySuffix === undefined) rule.punySuffix = unicode.toASCII(rule.suffix);
    if (!punyDomain.endsWith("." + rule.punySuffix) && punyDomain !== rule.punySuffix) return memo;
    return rule;
  }, undefined as unknown as Rule);
}

// Validate domain name and throw if not valid.
//
// From wikipedia:
//
// Hostnames are composed of series of labels concatenated with dots, as are all
// domain names. Each label must be between 1 and 63 characters long, and the
// entire hostname (including the delimiting dots) has a maximum of 255 chars.
//
// Allowed chars:
//
// * `a-z`
// * `0-9`
// * `-` but not as a starting or ending character
// * `.` as a separator for the textual portions of a domain name
//
// * http://en.wikipedia.org/wiki/Domain_name
// * http://en.wikipedia.org/wiki/Hostname
function validate(input: string) {
  // Before we can validate we need to take care of IDNs with unicode chars.
  const ascii = unicode.toASCII(input);

  if (ascii.length < 1) return ERROR_CODES.DOMAIN_TOO_SHORT;
  if (ascii.length > 255) return ERROR_CODES.DOMAIN_TOO_LONG;

  // Check each part's length and allowed chars.
  const labels = ascii.split(".");
  for (let i = 0; i < labels.length; ++i) {
    const label = labels[i];
    if (!label.length) return ERROR_CODES.LABEL_TOO_SHORT;
    if (label.length > 63) return ERROR_CODES.LABEL_TOO_LONG;
    if (label.startsWith("-")) return ERROR_CODES.LABEL_STARTS_WITH_DASH;
    if (label.endsWith("-")) return ERROR_CODES.LABEL_ENDS_WITH_DASH;
    if (!/^[a-z0-9\-]+$/.test(label)) return ERROR_CODES.LABEL_INVALID_CHARS;
  }
}

// Parse domain.
export function parse(input: string): Result {
  if (typeof input !== "string") throw new TypeError("Domain name must be a string.");

  // Force domain to lowercase.
  let domain = input.slice(0).toLowerCase();

  // Handle FQDN.
  // TODO: Simply remove trailing dot?
  if (domain.charAt(domain.length - 1) === ".") {
    domain = domain.slice(0, domain.length - 1);
  }

  const parsed = new Result(input);

  // Validate and sanitise input.
  parsed.error = validate(domain) as keyof typeof ERROR_CODES;
  if (parsed.error) return parsed;

  const domainParts = domain.split(".");

  // Non-Internet TLD
  if (domainParts[domainParts.length - 1] === "local") return parsed;

  const handlePunycode = function () {
    if (!/xn--/.test(domain)) return parsed;
    if (parsed.domain) parsed.domain = unicode.toASCII(parsed.domain);
    if (parsed.subdomain) parsed.subdomain = unicode.toASCII(parsed.subdomain);
    return parsed;
  };

  const rule = findRule(domain);

  // Unlisted tld.
  if (!rule) {
    if (domainParts.length < 2) return parsed;
    parsed.tld = domainParts.pop()!;
    parsed.sld = domainParts.pop()!;
    parsed.domain = [parsed.sld, parsed.tld].join(".");
    if (domainParts.length) parsed.subdomain = domainParts.pop()!;
    return handlePunycode();
  }

  // At this point we know the public suffix is listed.
  parsed.listed = true;

  const tldParts = rule.suffix.split(".");
  const privateParts = domainParts.slice(0, domainParts.length - tldParts.length);

  if (rule.exception) privateParts.push(tldParts.shift()!);

  parsed.tld = tldParts.join(".");
  if (!privateParts.length) return handlePunycode();
  if (rule.wildcard) {
    tldParts.unshift(privateParts.pop()!);
    parsed.tld = tldParts.join(".");
  }

  if (!privateParts.length) return handlePunycode();
  parsed.sld = privateParts.pop()!;
  parsed.domain = [parsed.sld, parsed.tld].join(".");
  if (privateParts.length) parsed.subdomain = privateParts.join(".");

  return handlePunycode();
}

// Get domain.
export function get(domain: string) {
  if (!domain) return null;
  const parsed = parse(domain);
  return typeof parsed !== "string" ? parsed.domain : null;
}

// Check whether domain belongs to a known public suffix.
export function isValid(domain: string) {
  const parsed = parse(domain);
  if (typeof parsed === "string") return false;
  return Boolean(parsed.domain && parsed.listed);
}
