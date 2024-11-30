#!/usr/bin/env bash
set -o errexit

bundle install
yarn install

# Clean up any previous builds
bundle exec rails assets:clobber

# Precompile assets
bundle exec rails assets:precompile

# Build Tailwind CSS
bundle exec rails tailwindcss:build

# bundle exec rails db:migrate