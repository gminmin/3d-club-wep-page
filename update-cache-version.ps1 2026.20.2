$version = if ($args.Count -gt 0 -and $args[0]) {
    $args[0]
} else {
    Get-Date -Format "yyyy-MM-dd-HHmmss"
}

$htmlFiles = Get-ChildItem -Path $PSScriptRoot -Filter *.html -File
$pattern = '(?<=[?&]v=)[0-9A-Za-z._:-]+'

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $updated = [regex]::Replace($content, $pattern, $version)

    if ($updated -ne $content) {
        Set-Content -Path $file.FullName -Value $updated -Encoding UTF8
        Write-Output "Updated $($file.Name) -> $version"
    }
}

Write-Output "Cache version ready: $version"
