# ytcui-dl on Termux

ytcui-dl has no curl dependency and no platform-specific code paths at all
(see `include/yt_http.h`) — just OpenSSL, zlib, and pthreads, all of which
Termux packages directly. This made Termux support close to free.

## Install

```sh
pkg update
pkg install clang openssl zlib make git
git clone https://github.com/MilkmanAbi/ytcui-dl
cd ytcui-dl
make
make install     # installs to $PREFIX/bin (no root needed, ever)
```

`apt install` works identically to `pkg install` here — `pkg` is just
Termux's own frontend over the same apt/dpkg database, so either command
gets you the same packages.

## What the Makefile does differently on Termux

- Detects Termux via `$TERMUX_VERSION` (exported by every Termux session)
  rather than `uname -s`, which just reports `Linux` there.
- Forces `CXX := clang++` — Termux's `clang` package is the only compiler on
  offer, and a bare `c++`/`g++` symlink isn't guaranteed across versions.
- Skips the `OPENSSL_PREFIX` Homebrew-keg lookup — Termux's `$PREFIX` sysroot
  already has `openssl`'s headers/libs on the default search path once
  `pkg install openssl` has run.
- `PREFIX` still resolves correctly with **no Termux-specific code at all**:
  `make install`'s `PREFIX ?= /usr/local` only assigns when the environment
  doesn't already have one, and Termux exports its own
  (`/data/data/com.termux/files/usr`) into every session — so it lands in
  the right, writable, no-root place automatically.

## Verify

```sh
./ytcui-dl --diag
./ytcui-dl --version
```

`make size` reports a ~200KB binary with 9 shared-object dependencies on
desktop Linux; expect something similar on Termux (aarch64 builds are
typically a little larger).

## Known gaps / untested

This was built and smoke-tested in a Linux sandbox with `TERMUX_VERSION`
simulated for the Makefile branches, and with the real Termux package names
verified against `termux-packages` upstream — but **not run on an actual
Termux install on a phone**. Things worth checking on real hardware:

- Network path: Termux's DNS resolver behaves slightly differently from a
  full Linux distro's under some VPN/Private-DNS configurations. If InnerTube
  requests fail where `curl` from the same shell succeeds, that's the first
  place to look.
- `test-live` (the network-touching test target) hasn't been run on-device.
