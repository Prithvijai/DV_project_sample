
$path = "project.css"
$lines = Get-Content $path
$modified = $false

for ($i=0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "background-color:\s*black\s*!important;") {
        Write-Host "Replacing background-color at line $($i+1)"
        $lines[$i] = "    background-color: rgba(0, 0, 0, 0.6) !important; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px;"
        $modified = $true
    }
    if ($lines[$i] -match "background:\s*black\s*!important;") {
        Write-Host "Replacing background at line $($i+1)"
        $lines[$i] = "    background: rgba(0, 0, 0, 0.6) !important;"
        $modified = $true
    }
}

if ($modified) {
    $lines | Set-Content $path
    Write-Host "Successfully updated project.css"
} else {
    Write-Host "No matches found in project.css"
}
