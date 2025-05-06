#!/bin/bash

# This script requires ImageMagick to be installed
# Install with: brew install imagemagick

mkdir -p public/icons

# Generate favicon.ico (multi-size)
convert -background transparent public/icons/safari-pinned-tab.svg -define icon:auto-resize=16,32,48,64 public/icons/favicon.ico

# Generate various PNG sizes
convert -background transparent public/icons/safari-pinned-tab.svg -resize 16x16 public/icons/favicon-16x16.png
convert -background transparent public/icons/safari-pinned-tab.svg -resize 32x32 public/icons/favicon-32x32.png
convert -background transparent public/icons/safari-pinned-tab.svg -resize 192x192 public/icons/icon-192.png
convert -background transparent public/icons/safari-pinned-tab.svg -resize 512x512 public/icons/icon-512.png
convert -background transparent public/icons/safari-pinned-tab.svg -resize 180x180 public/icons/apple-touch-icon.png

echo "Icon generation complete!"
