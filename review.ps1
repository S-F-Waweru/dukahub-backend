$MODEL = "phi3:mini"
$SRC = "src\modules"
$OUTPUT = "review_output.md"

"# DukaHub Backend Review" | Out-File $OUTPUT
"Generated: $(Get-Date)" | Out-File $OUTPUT -Append

Get-ChildItem $SRC -Directory | ForEach-Object {
    $module = $_.Name
    Write-Host "Reviewing $module..."
    
    "`n## Module: $module" | Out-File $OUTPUT -Append
    
    $code = Get-ChildItem $_.FullName -Filter "*.ts" -Recurse | 
            Get-Content -Raw | 
            Out-String
    
    $code | ollama run $MODEL "Review this NestJS code. Be concise. List bugs, security issues, and improvements only." | 
            Out-File $OUTPUT -Append
    
    Write-Host "Done: $module"
}

Write-Host "Complete! See $OUTPUT"