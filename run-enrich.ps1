$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer <SUPABASE_SERVICE_ROLE_KEY>"
}

$batchSize = if ($args[0]) { $args[0] } else { 10 }

try {
    Write-Host "Running bulk enrichment with batch_size=$batchSize..."
    $body = "{`"batch_size`": $batchSize, `"force_reenrich`": true}"
    $response = Invoke-RestMethod -Uri "https://YOUR_PROJECT_REF.supabase.co/functions/v1/bulk-enrich" -Method Post -Headers $headers -Body $body -TimeoutSec 600
    Write-Host "Success!"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response: $($reader.ReadToEnd())"
    }
}

