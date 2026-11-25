$staging = 'staging-deploy'
if (Test-Path $staging) { Remove-Item -Recurse -Force $staging }
New-Item -ItemType Directory -Path $staging | Out-Null

Write-Host "Copying source, config and assets..."
Copy-Item -Recurse src "$staging\src"
Copy-Item -Recurse prisma "$staging\prisma"
Copy-Item -Recurse public "$staging\public"
Copy-Item -Recurse data "$staging\data"
Copy-Item package.json "$staging\package.json"
Copy-Item package-lock.json "$staging\package-lock.json"
Copy-Item postcss.config.mjs "$staging\postcss.config.mjs"
Copy-Item next.config.ts "$staging\next.config.ts"
Copy-Item tsconfig.json "$staging\tsconfig.json"
Copy-Item .env "$staging\.env"
Copy-Item server.js "$staging\server.js"

Write-Host "Copying compiled .next production output..."
New-Item -ItemType Directory -Path "$staging\.next" | Out-Null
Copy-Item -Recurse .next\server "$staging\.next\server"
Copy-Item -Recurse .next\static "$staging\.next\static"
Copy-Item -Recurse .next\types "$staging\.next\types" -ErrorAction SilentlyContinue
Get-ChildItem .next -File | Copy-Item -Destination "$staging\.next"

Write-Host "Copying pre-bundled node_modules..."
Copy-Item -Recurse .next\standalone\node_modules "$staging\node_modules"

Write-Host "Copying Linux Prisma query engines..."
Copy-Item -Force "node_modules\.prisma\client\libquery_engine-*.so.node" "$staging\node_modules\.prisma\client\"

Write-Host "Removing any existing zip..."
if (Test-Path zenhosta-deploy.zip) { Remove-Item -Force zenhosta-deploy.zip }

Write-Host "Creating clean zip with standard relative paths..."
Set-Location $staging
tar.exe -a -cf ..\zenhosta-deploy.zip * .next .env
Set-Location ..

Write-Host "Cleaning up staging directory..."
Remove-Item -Recurse -Force $staging

$zipItem = Get-Item zenhosta-deploy.zip
Write-Host "Finished! zenhosta-deploy.zip size: $([math]::Round($zipItem.Length / 1MB, 2)) MB"
