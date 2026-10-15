#!/usr/bin/env python3
"""
Derive the light-mode iOS launch images from the dark ones.

Why derive instead of redraw: the dark artwork was produced by a process that
no longer exists in this repo, so redrawing it would silently change the grid
phase, the mark position, and the letter spacing — and the two variants have to
be the same picture in two palettes, or a device that switches appearance shows
a jump. A per-channel linear re-map guarantees that: every shape, edge and
anti-aliased pixel lands in exactly the same place, and only the colour of each
pixel changes.

The map is fitted to two anchors per channel:

    dark canvas  ->  light canvas      (the paper the page uses)
    dark ink     ->  light ink         (the brightest structural element)

Both light anchors are computed from OKLCH below, matching the light block in
app/globals.css, so the launch image stays in step with the theme rather than
with a hand-picked hex. A glow, a hairline or a grey label is a mix of those two
anchors, so it re-maps to the equivalent mix in the light palette — the same
relationship the CSS tokens invert.

Run from the project root:      python3 scripts/generate-splash.py
Verify the result is current:   python3 scripts/generate-splash.py --check
"""

from __future__ import annotations

import argparse
import math
import pathlib
import sys

from PIL import Image

SPLASH_DIR = pathlib.Path("public/splash")

# --- OKLCH -> sRGB ---------------------------------------------------------
# Björn Ottosson's Oklab matrices, inverted. Kept here so the palette below can
# be written in the same notation as the stylesheet.
def oklch_to_srgb(lightness: float, chroma: float, hue_degrees: float) -> tuple[int, int, int]:
    hue = math.radians(hue_degrees)
    a = chroma * math.cos(hue)
    b = chroma * math.sin(hue)

    l_ = lightness + 0.3963377774 * a + 0.2158037573 * b
    m_ = lightness - 0.1055613458 * a - 0.0638541728 * b
    s_ = lightness - 0.0894841775 * a - 1.2914855480 * b

    l, m, s = l_**3, m_**3, s_**3

    linear = (
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    )

    channels = []
    for value in linear:
        value = max(0.0, min(1.0, value))
        gamma = 12.92 * value if value <= 0.0031308 else 1.055 * value ** (1 / 2.4) - 0.055
        channels.append(round(max(0.0, min(1.0, gamma)) * 255))
    return channels[0], channels[1], channels[2]


# The light palette, copied from the `prefers-color-scheme: light` block.
LIGHT_CANVAS = oklch_to_srgb(0.965, 0.006, 258)
LIGHT_INK = oklch_to_srgb(0.21, 0.02, 258)

# The dark anchor that must reproduce the shipped splash exactly; used as the
# conversion self-test so a broken matrix fails loudly before any file is read.
KNOWN_DARK_CANVAS = oklch_to_srgb(0.125, 0.006, 258)


def channel_extremes(image: Image.Image) -> tuple[list[int], list[int]]:
    """Per-channel darkest and brightest sample, i.e. canvas and ink."""
    red, green, blue = image.split()
    lows, highs = [], []
    for band in (red, green, blue):
        histogram = band.histogram()
        lows.append(next(index for index, count in enumerate(histogram) if count))
        highs.append(
            next(index for index, count in reversed(list(enumerate(histogram))) if count)
        )
    return lows, highs


def palette_lookup(dark_canvas: int, dark_ink: int, light_canvas: int, light_ink: int) -> list[int]:
    """256-entry LUT mapping one dark channel onto its light counterpart."""
    span = dark_ink - dark_canvas
    if span <= 0:
        raise ValueError("degenerate anchor: the image has no tonal range")
    gain = (light_ink - light_canvas) / span
    return [
        max(0, min(255, round(light_canvas + gain * (value - dark_canvas))))
        for value in range(256)
    ]


def to_light(source: pathlib.Path, destination: pathlib.Path) -> str:
    image = Image.open(source).convert("RGB")
    dark_lows, dark_highs = channel_extremes(image)

    bands = []
    for band, dark_canvas, dark_ink, light_canvas, light_ink in zip(
        image.split(), dark_lows, dark_highs, LIGHT_CANVAS, LIGHT_INK
    ):
        bands.append(band.point(palette_lookup(dark_canvas, dark_ink, light_canvas, light_ink)))

    light = Image.merge("RGB", bands)
    light.save(destination, format="PNG", optimize=True)
    return f"{dark_lows} -> {LIGHT_CANVAS}"


def verify(destination: pathlib.Path, expected_size: tuple[int, int]) -> list[str]:
    """Independent read-back: the file must be the size it claims and light."""
    problems = []
    image = Image.open(destination).convert("RGB")
    if image.size != expected_size:
        problems.append(f"{destination.name}: size {image.size} != {expected_size}")

    width, height = image.size
    bottom = image.getpixel((2, height - 3))
    top = image.getpixel((2, 2))
    for label, sample in (("bottom", bottom), ("top", top)):
        if min(sample) < 180:
            problems.append(f"{destination.name}: {label} corner {sample} is not a light surface")
    if top == bottom:
        problems.append(f"{destination.name}: gradient between top and bottom collapsed")
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="report drift instead of writing files (exit 1 if any light asset is stale)",
    )
    arguments = parser.parse_args()

    if KNOWN_DARK_CANVAS != (5, 7, 9):
        print(
            f"FAIL: oklch(0.125 0.006 258) converted to {KNOWN_DARK_CANVAS}, expected (5, 7, 9). "
            "The OKLCH conversion is wrong; refusing to touch the assets.",
            file=sys.stderr,
        )
        return 2

    sources = sorted(SPLASH_DIR.glob("apple-splash-*.png"))
    sources = [path for path in sources if not path.name.startswith("apple-splash-light-")]
    if not sources:
        print(f"FAIL: no dark splash images under {SPLASH_DIR}", file=sys.stderr)
        return 2

    stale, written, problems = [], 0, []
    for source in sources:
        destination = SPLASH_DIR / source.name.replace("apple-splash-", "apple-splash-light-")
        with Image.open(source) as probe:
            expected_size = probe.size

        if arguments.check:
            if not destination.exists():
                stale.append(f"{destination.name}: missing")
                continue
            current = Image.open(destination).convert("RGB")
            expected = to_light_image(source)
            if current.tobytes() != expected.tobytes():
                stale.append(f"{destination.name}: out of date")
            continue

        anchors = to_light(source, destination)
        written += 1
        problems.extend(verify(destination, expected_size))
        print(f"{source.name} -> {destination.name} [{anchors}]")

    if arguments.check:
        if stale:
            print("Stale light splash assets:", file=sys.stderr)
            for entry in stale:
                print(f"  {entry}", file=sys.stderr)
            return 1
        print(f"{len(sources)} light splash assets are current")
        return 0

    if problems:
        for problem in problems:
            print(f"FAIL: {problem}", file=sys.stderr)
        return 1

    print(f"wrote {written} light splash images into {SPLASH_DIR}")
    return 0


def to_light_image(source: pathlib.Path) -> Image.Image:
    """Same mapping as `to_light`, without touching the filesystem."""
    image = Image.open(source).convert("RGB")
    dark_lows, dark_highs = channel_extremes(image)
    bands = [
        band.point(palette_lookup(dark_canvas, dark_ink, light_canvas, light_ink))
        for band, dark_canvas, dark_ink, light_canvas, light_ink in zip(
            image.split(), dark_lows, dark_highs, LIGHT_CANVAS, LIGHT_INK
        )
    ]
    return Image.merge("RGB", bands)


if __name__ == "__main__":
    raise SystemExit(main())
