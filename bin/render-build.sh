#!/usr/bin/env bash
set -o errexit

node --version
bundle install

# Clean up any previous builds
rm -rf app/assets/builds/*
bundle exec rails assets:clobber

# Build Tailwind CSS
bundle exec rails tailwindcss:build

# Precompile assets
bundle exec rails assets:precompile

bundle exec rails db:migrate