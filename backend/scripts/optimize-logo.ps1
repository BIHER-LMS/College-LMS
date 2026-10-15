Add-Type -AssemblyName System.Drawing
$srcPath = Join-Path $PSScriptRoot "..\..\frontend\public\logo.png"
$origPath = Join-Path $PSScriptRoot "..\..\frontend\public\logo-orig.png"

if (-not (Test-Path $origPath)) {
    Copy-Item $srcPath $origPath
}

$img = [System.Drawing.Image]::FromFile($origPath)
$targetWidth = 256
$targetHeight = 256
$newImg = New-Object System.Drawing.Bitmap $targetWidth, $targetHeight
$g = [System.Drawing.Graphics]::FromImage($newImg)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g.DrawImage($img, 0, 0, $targetWidth, $targetHeight)
$g.Dispose()
$img.Dispose()

$newImg.Save($srcPath, [System.Drawing.Imaging.ImageFormat]::Png)
$newImg.Dispose()

$origSize = (Get-Item $origPath).Length
$newSize = (Get-Item $srcPath).Length
Write-Host "Original logo size: $origSize bytes"
Write-Host "Optimized logo size: $newSize bytes"
Write-Host "Savings: $([math]::Round(($origSize - $newSize) / $origSize * 100, 1))%"
