param([string]$DateTag = (Get-Date -Format 'yyyy-MM-dd'))

$ErrorActionPreference = 'Stop'
$project = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$dist = Join-Path $project 'dist'
$stageRoot = Join-Path $dist '.package-stage'

function Assert-InProject([string]$Target) {
  $full = [System.IO.Path]::GetFullPath($Target)
  if (-not $full.StartsWith($project + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to modify a path outside the project: $full"
  }
  return $full
}

New-Item -ItemType Directory -Path $dist -Force | Out-Null
if (Test-Path -LiteralPath $stageRoot) {
  Remove-Item -LiteralPath (Assert-InProject $stageRoot) -Recurse -Force
}
New-Item -ItemType Directory -Path $stageRoot | Out-Null

try {
  foreach ($variant in @('estate', 'boutique')) {
    $stage = Join-Path $stageRoot $variant
    New-Item -ItemType Directory -Path $stage | Out-Null
    foreach ($file in @('package.json', 'server.mjs', 'Dockerfile', 'compose.yaml', 'README.md', 'DESIGN_NOTES.md', 'SITE_REVIEW.md', '.dockerignore', '.env.example')) {
      Copy-Item -LiteralPath (Join-Path $project $file) -Destination $stage
    }
    foreach ($directory in @('src', 'integrations', 'tests')) {
      Copy-Item -LiteralPath (Join-Path $project $directory) -Destination $stage -Recurse
    }
    $pages = @('estate.html', 'properties.html', 'property.html', 'editorials.html', 'article.html', 'about.html', 'boutique.html', 'collection.html', 'cars.html', 'admin.html')
    if ($variant -eq 'estate') {
      $entryPage = 'estate.html'
      $siteName = 'Ravi Seth Estate'
    } else {
      $entryPage = 'boutique.html'
      $siteName = 'Ravi Seth Atelier and Cars'
    }
    foreach ($page in $pages) {
      Copy-Item -LiteralPath (Join-Path $project $page) -Destination $stage
    }
    Copy-Item -LiteralPath (Join-Path $project $entryPage) -Destination (Join-Path $stage 'index.html')
    Add-Content -LiteralPath (Join-Path $stage '.env.example') -Value "SITE_VARIANT=$variant"
    @"
# $siteName package

This package is one independent deployment. Its home page is /$entryPage and /.
Copy .env.example to .env, set ADMIN_TOKEN, then run npm run dev:env.
For Docker deployment, use the included README.md and Compose file.
The backend and Content Studio are included. The estate and boutique packages use separate SQLite databases when deployed separately.
Sample listings and remote illustrative photos must be replaced before public launch.
"@ | Set-Content -LiteralPath (Join-Path $stage 'PACKAGE-README.md') -Encoding utf8
    $archive = Assert-InProject (Join-Path $dist "Ravi-Seth-$variant-$DateTag.zip")
    if (Test-Path -LiteralPath $archive) { Remove-Item -LiteralPath $archive -Force }
    Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $archive -CompressionLevel Optimal
    Write-Output $archive
  }
} finally {
  if (Test-Path -LiteralPath $stageRoot) {
    Remove-Item -LiteralPath (Assert-InProject $stageRoot) -Recurse -Force
  }
}
