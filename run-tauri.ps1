#!/usr/bin/env pwsh
# Script to run Tauri with proper environment setup

# Add Cargo to PATH
$env:PATH = "$env:PATH;$env:USERPROFILE\.cargo\bin"

# Set SSL certificates
$env:CARGO_HTTP_CAINFO = "C:/certificates/netskope-ssl-fix/complete_cacert.pem"
$env:SSL_CERT_FILE = "C:/certificates/netskope-ssl-fix/complete_cacert.pem"
$env:REQUESTS_CA_BUNDLE = "C:/certificates/netskope-ssl-fix/complete_cacert.pem"
$env:CURL_CA_BUNDLE = "C:/certificates/netskope-ssl-fix/complete_cacert.pem"

# Verify cargo is available
Write-Host "Checking Cargo availability..."
cargo --version

# Run Tauri dev
Write-Host "Starting Tauri development server..."
tauri dev