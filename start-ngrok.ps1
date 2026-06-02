Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "       Skill Wallet ngrok Assistant       " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will start ngrok tunnel on port 8000."
Write-Host "Remember to:"
Write-Host "1. Copy the forwarding URL (https://xxxx.ngrok-free.app)"
Write-Host "2. Set NEXT_PUBLIC_API_URL in Vercel to your ngrok URL."
Write-Host "3. Update GITHUB Callback URL in GitHub Developer Settings."
Write-Host "4. Update FRONTEND_URL in backend/.env to your Vercel URL."
Write-Host ""
Write-Host "Starting ngrok tunnel..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C inside the tunnel console to stop."
Write-Host ""

ngrok http 8000
