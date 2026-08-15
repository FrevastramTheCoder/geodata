$ErrorActionPreference = "SilentlyContinue"
$data = Get-Content "scripts/broken-to-recheck.json" -Raw | ConvertFrom-Json
$results = @()
$i = 0
foreach ($rec in $data) {
  $i++
  $u = $rec.officialUrl
  $status = "DEAD"
  $code = $null
  try {
    $r = Invoke-WebRequest -Uri $u -Method Head -UseBasicParsing -TimeoutSec 15 -MaximumRedirection 5
    $status = "OK"
    $code = $r.StatusCode
  } catch {
    try {
      $g = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 20 -MaximumRedirection 5
      $status = "OK"
      $code = $g.StatusCode
    } catch {
      $status = "DEAD"
    }
  }
  $results += [PSCustomObject]@{ id = $rec.id; url = $u; reachable = ($status -eq "OK"); status = $code }
  if ($i % 25 -eq 0) { Write-Host "progress $i/$($data.Count)" }
}
$results | ConvertTo-Json | Set-Content "scripts/recheck-results.json" -Encoding UTF8
$ok = ($results | Where-Object { $_.reachable }).Count
Write-Host "recheck done: reachable=$ok dead=$($data.Count - $ok)"