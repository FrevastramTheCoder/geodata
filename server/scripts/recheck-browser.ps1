$ErrorActionPreference = "SilentlyContinue"
$data = Get-Content "scripts/broken-to-recheck.json" -Raw | ConvertFrom-Json
$headers = @{
  "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36"
  "Accept" = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  "Accept-Language" = "en-US,en;q=0.9"
}
$results = @()
$i = 0
foreach ($rec in $data) {
  $i++
  $u = $rec.officialUrl
  $reachable = $false
  $code = $null
  try {
    $r = Invoke-WebRequest -Uri $u -Headers $headers -UseBasicParsing -TimeoutSec 20 -MaximumRedirection 10
    if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 400) { $reachable = $true; $code = $r.StatusCode }
  } catch {
    $code = try { [int]$_.Exception.Response.StatusCode } catch { $null }
  }
  $results += [PSCustomObject]@{ id = $rec.id; url = $u; reachable = $reachable; code = $code }
  if ($i % 25 -eq 0) { Write-Host "progress $i/$($data.Count)" }
}
$results | ConvertTo-Json | Set-Content "scripts/recheck-results2.json" -Encoding UTF8
$ok = ($results | Where-Object { $_.reachable }).Count
Write-Host "browser-like recheck: reachable=$ok dead=$($data.Count - $ok)"