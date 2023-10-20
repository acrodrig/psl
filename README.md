# psl (Public Suffix List)

This is a port of Node's [PSL library](https://www.npmjs.com/package/psl) to Deno, 
standard ESM modules and Typescript.

From the original library: `psl` is a `JavaScript` domain name parser based on the
[Public Suffix List](https://publicsuffix.org/).


## Port Notes

- Written in Typescript
- Modified modules to support standard ESM approach
- No emphasis on browser support (use original package from NPM if needed)
- Added throw/ catch option for errors


## What is the Public Suffix List?

The Public Suffix List is a cross-vendor initiative to provide an accurate list
of domain name suffixes.

The Public Suffix List is an initiative of the Mozilla Project, but is
maintained as a community resource. It is available for use in any software,
but was originally created to meet the needs of browser manufacturers.

A "public suffix" is one under which Internet users can directly register names.
Some examples of public suffixes are ".com", ".co.uk" and "pvt.k12.wy.us". The
Public Suffix List is a list of all known public suffixes.

Source: http://publicsuffix.org


## Example

```typescript
import { parse } from "https://deno.land/x/psl/mod.ts";

var parsed = parse("google.com");
console.log(parsed.tld); // 'com'
console.log(parsed.sld); // 'google'
console.log(parsed.domain); // 'google.com'
console.log(parsed.subdomain); // null
```

### Browser

No browser support, use original library.


## API

### `parse(domain)`

Parse domain based on Public Suffix List. Returns an `Object` with the following
properties:

* `tld`: Top level domain (this is the _public suffix_).
* `sld`: Second level domain (the first private part of the domain name).
* `domain`: The domain name is the `sld` + `tld`.
* `subdomain`: Optional parts left of the domain.

#### Example:

```js
import { parse } from "https://deno.land/x/psl/mod.ts";

// Parse domain without subdomain
var parsed = parse('google.com');
console.log(parsed.tld); // 'com'
console.log(parsed.sld); // 'google'
console.log(parsed.domain); // 'google.com'
console.log(parsed.subdomain); // null

// Parse domain with subdomain
var parsed = parse('www.google.com');
console.log(parsed.tld); // 'com'
console.log(parsed.sld); // 'google'
console.log(parsed.domain); // 'google.com'
console.log(parsed.subdomain); // 'www'

// Parse domain with nested subdomains
var parsed = parse('a.b.c.d.foo.com');
console.log(parsed.tld); // 'com'
console.log(parsed.sld); // 'foo'
console.log(parsed.domain); // 'foo.com'
console.log(parsed.subdomain); // 'a.b.c.d'
```

### `get(domain)`

Get domain name, `sld` + `tld`. Returns `null` if not valid.

#### Example:

```typescript
import { parse } from "https://deno.land/x/psl/mod.ts";

// null input.
get(null); // null

// Mixed case.
get('COM'); // null
get('example.COM'); // 'example.com'
get('WwW.example.COM'); // 'example.com'

// Unlisted TLD.
get('example'); // null
get('example.example'); // 'example.example'
get('b.example.example'); // 'example.example'
get('a.b.example.example'); // 'example.example'

// TLD with only 1 rule.
get('biz'); // null
get('domain.biz'); // 'domain.biz'
get('b.domain.biz'); // 'domain.biz'
get('a.b.domain.biz'); // 'domain.biz'

// TLD with some 2-level rules.
get('uk.com'); // null);
get('example.uk.com'); // 'example.uk.com');
get('b.example.uk.com'); // 'example.uk.com');

// More complex TLD.
get('c.kobe.jp'); // null
get('b.c.kobe.jp'); // 'b.c.kobe.jp'
get('a.b.c.kobe.jp'); // 'b.c.kobe.jp'
get('city.kobe.jp'); // 'city.kobe.jp'
get('www.city.kobe.jp'); // 'city.kobe.jp'

// IDN labels.
get('食狮.com.cn'); // '食狮.com.cn'
get('食狮.公司.cn'); // '食狮.公司.cn'
get('www.食狮.公司.cn'); // '食狮.公司.cn'

// Same as above, but punycoded.
get('xn--85x722f.com.cn'); // 'xn--85x722f.com.cn'
get('xn--85x722f.xn--55qx5d.cn'); // 'xn--85x722f.xn--55qx5d.cn'
get('www.xn--85x722f.xn--55qx5d.cn'); // 'xn--85x722f.xn--55qx5d.cn'
```

### `isValid(domain)`

Check whether a domain has a valid Public Suffix. Returns a `Boolean` indicating
whether the domain has a valid Public Suffix.

#### Example

```typescript
import { isValid } from "https://deno.land/x/psl/mod.ts";

isValid('google.com'); // true
isValid('www.google.com'); // true
isValid('x.yz'); // false
```


## Testing and Building

```sh
# This will run `check`, `lint` and `fmt` check
deno task check

# Run tests
deno test
```

Feel free to fork if you see possible improvements!


## Acknowledgements

* Forked from Node's [psl](https://www.npmjs.com/package/psl)
* Mozilla Foundation's [Public Suffix List](https://publicsuffix.org/)
* Thanks to Rob Stradling of [Comodo](https://www.comodo.com/) for providing
  test data.
* Inspired by [weppos/publicsuffix-ruby](https://github.com/weppos/publicsuffix-ruby)


## License

The MIT License (MIT)
