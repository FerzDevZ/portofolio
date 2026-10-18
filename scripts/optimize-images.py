#!/usr/bin/env python3
"""Convert the certificate source photos in img/ into the WebP files served
from public/certificates/.

Verified source → output mapping (do not reorder without opening the images):

  img/sertifikat1.png  2000x1414  E-MOSTFET 11 "Juara 2 Web Design Online"
                                  → emostfet-11-web-design.webp
  img/sertifikat2.png   738x1600  LKS Babel "Juara II ITSSB" — a phone
                                  screenshot, so the certificate band is
                                  cropped out of the black bars first
                                  → lks-babel-itssb-2025.webp
  img/sertifikat3.png  1280x927   OTN VI "Juara I Desain Web"
                                  → otn-vi-desain-web-2024.webp

The intrinsic dimensions printed here are the values that the certificate
entries in lib/content/en.ts and lib/content/id.ts must declare (imageWidth /
imageHeight); next/image renders the card and the lightbox from them, so a
mismatch distorts the aspect ratio.
"""

from pathlib import Path

from PIL import Image

SRC_DIR = Path("img")
OUT_DIR = Path("public/certificates")

# (source file, output file, crop the phone screenshot?)
SOURCES = [
    ("sertifikat1.png", "emostfet-11-web-design.webp", False),
    ("sertifikat2.png", "lks-babel-itssb-2025.webp", True),
    ("sertifikat3.png", "otn-vi-desain-web-2024.webp", False),
]

QUALITY = 85


def read_certificate_band(image: Image.Image) -> Image.Image:
    """Crop a phone screenshot down to the certificate band.

    The source has a status bar and large black letterbox bars. The
    certificate is the longest contiguous run of rows whose mean luminance
    is above the near-black floor; two pixels are trimmed from each edge so
    no transition row survives in the crop.
    """
    grayscale = image.convert("L")
    column = grayscale.resize((1, grayscale.height), Image.BOX).load()
    row_means = [column[0, y] for y in range(grayscale.height)]

    longest_start = 0
    longest_length = 0
    run_start = None
    for y, mean in enumerate(row_means):
        is_content = mean > 55
        if is_content and run_start is None:
            run_start = y
        elif not is_content and run_start is not None:
            if y - run_start > longest_length:
                longest_start, longest_length = run_start, y - run_start
            run_start = None
    if run_start is not None and len(row_means) - run_start > longest_length:
        longest_start, longest_length = run_start, len(row_means) - run_start

    inset = 2
    top = longest_start + inset
    bottom = longest_start + longest_length - inset
    cropped = image.crop((0, top, image.width, bottom))
    if cropped.width <= cropped.height:
        raise SystemExit(
            f"crop did not produce a landscape certificate: {cropped.size}"
        )
    return cropped


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for source_name, output_name, needs_crop in SOURCES:
        source_path = SRC_DIR / source_name
        output_path = OUT_DIR / output_name
        if not source_path.exists():
            raise SystemExit(f"missing source image: {source_path}")

        with Image.open(source_path) as source_image:
            converted = source_image.convert("RGB")
            if needs_crop:
                converted = read_certificate_band(converted)
            converted.save(
                output_path,
                format="WebP",
                quality=QUALITY,
                method=6,
                optimize=True,
            )
        size_kb = output_path.stat().st_size // 1024
        print(
            f"{source_name} -> {output_name}  "
            f"{converted.width}x{converted.height}  {size_kb}KB"
        )


if __name__ == "__main__":
    main()
