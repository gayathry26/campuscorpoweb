<#
.SYNOPSIS
    Deploys the compiled CampusCorp React frontend to Amazon S3 and invalidates CloudFront cache.
.PARAMETER FrontendBucket
    Target Amazon S3 bucket name for frontend assets.
.PARAMETER CloudFrontDistributionId
    CloudFront distribution ID to invalidate.
#>

param (
    [Parameter(Mandatory=$false)]
    [string]$FrontendBucket = $env:AWS_FRONTEND_S3_BUCKET,

    [Parameter(Mandatory=$false)]
    [string]$CloudFrontDistributionId = $env:AWS_CLOUDFRONT_DISTRIBUTION_ID
)

$ErrorActionPreference = "Stop"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "🚀 CampusCorp Frontend S3 & CloudFront Deployment" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# 1. Build Client
Write-Host "`n[1/3] Building production React frontend..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\..\..\client"
npm run build

if (-not (Test-Path "dist\index.html")) {
    Write-Error "Build failed: dist\index.html not found."
    exit 1
}
Write-Host "✓ Build successful." -ForegroundColor Green

# 2. Check S3 Target
if (-not $FrontendBucket) {
    Write-Host "`n[NOTICE] AWS_FRONTEND_S3_BUCKET not specified. Built locally in client\dist." -ForegroundColor Magenta
    Write-Host "To deploy directly to AWS, pass -FrontendBucket <bucket-name> or set AWS_FRONTEND_S3_BUCKET."
    exit 0
}

# 3. Upload to S3
Write-Host "`n[2/3] Syncing client\dist to s3://$FrontendBucket..." -ForegroundColor Yellow
aws s3 sync dist "s3://$FrontendBucket" --delete --cache-control "public, max-age=31536000, immutable" --exclude "index.html"
aws s3 cp dist\index.html "s3://$FrontendBucket\index.html" --cache-control "no-cache, no-store, must-revalidate"
Write-Host "✓ S3 sync completed." -ForegroundColor Green

# 4. Invalidate CloudFront Cache
if ($CloudFrontDistributionId) {
    Write-Host "`n[3/3] Creating CloudFront invalidation for distribution $CloudFrontDistributionId..." -ForegroundColor Yellow
    aws cloudfront create-invalidation --distribution-id $CloudFrontDistributionId --paths "/*"
    Write-Host "✓ CloudFront invalidation created." -ForegroundColor Green
}

Write-Host "`n✅ Frontend deployment completed successfully!" -ForegroundColor Green
