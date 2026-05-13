# frozen_string_literal: true

source "https://rubygems.org"

# Jekyll - aktuelle stabile Version (4.x)
gem "jekyll", "~> 4.3.4"

group :jekyll_plugins do
  gem "jekyll-sitemap", "~> 1.4"
  gem "jekyll-seo-tag", "~> 2.8"
  gem "jekyll-paginate", "~> 1.1"
end

# Markdown
gem "kramdown-parser-gfm", "~> 1.1"

group :development do
  gem "webrick", "~> 1.8"
  gem "listen", "~> 3.8"
end

platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]

# Ruby 3.4+/4.0+ compatibility - gems removed from stdlib
gem "logger", "~> 1.6"
gem "csv", "~> 3.3"
gem "base64", "~> 0.2"
