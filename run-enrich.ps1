$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrenNjbWZza2VybGFuYnNqdWd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDcxMzI2OCwiZXhwIjoyMDgwMjg5MjY4fQ.g86aIJzHqjWB2JkLiNNY99P16LnU6IHPaLRr4rHbblA"
}

$batchSize = if ($args[0]) { $args[0] } else { 10 }

try {
    Write-Host "Running bulk enrichment with batch_size=$batchSize..."
    $body = "{`"batch_size`": $batchSize, `"force_reenrich`": true}"
    $response = Invoke-RestMethod -Uri "https://rkzscmfskerlanbsjugy.supabase.co/functions/v1/bulk-enrich" -Method Post -Headers $headers -Body $body -TimeoutSec 600
    Write-Host "Success!"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response: $($reader.ReadToEnd())"
    }
}

