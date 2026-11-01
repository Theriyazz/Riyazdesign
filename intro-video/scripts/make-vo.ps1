# Draft voiceover for the CareerLogica launch film, spoken by a voice built
# into Windows. Run with Windows PowerShell 5 (powershell.exe), which ships
# System.Speech:  powershell -File scripts/make-vo.ps1
# The lines and their order mirror VOICE in src/careerlogica/vo.tsx.
param([string]$Voice = "Microsoft Hazel Desktop", [int]$Rate = 1)

$lines = @(
  "Choosing a career is confusing.",
  "We just made it clear.",
  "Welcome to Career Logica. Two steps to career clarity.",
  "Here's how it works.",
  "Sign up as a student.",
  "Tell us who you are.",
  "Log in, and pick up where you left off.",
  "Your whole journey, on one dashboard.",
  "Step one: the psychometric test.",
  "Answer honestly. No wrong answers.",
  "You get one clear direction.",
  "Step two: book a certified counsellor.",
  "Pick a time that works.",
  "Session booked. That simple.",
  "Explore careers, and find your university.",
  "Over two thousand students guided.",
  "Find your direction.",
  "Career clarity, backed by science. Take the test today."
)

Add-Type -AssemblyName System.Speech
$out = Join-Path $PSScriptRoot "..\public\cl\vo"
New-Item -ItemType Directory -Force $out | Out-Null

$format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(48000, 16, 1)
$speech = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speech.SelectVoice($Voice)
$speech.Rate = $Rate

for ($i = 0; $i -lt $lines.Count; $i++) {
  $file = Join-Path $out ("{0:D2}.wav" -f ($i + 1))
  $speech.SetOutputToWaveFile($file, $format)
  $speech.Speak($lines[$i])
}
$speech.SetOutputToNull()
$speech.Dispose()
Write-Output "$($lines.Count) clips written with $Voice at rate $Rate"
