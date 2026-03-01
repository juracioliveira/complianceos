$mfaKey = New-Object byte[] 32;
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($mfaKey);
$mfaKeyBase64 = [Convert]::ToBase64String($mfaKey);

$cookieSecret = [Guid]::NewGuid().ToString();

Write-Host "JWT_PRIVATE_KEY_BASE64=STUB_DEV_JWT_PRIVATE"
Write-Host "JWT_PUBLIC_KEY_BASE64=STUB_DEV_JWT_PUBLIC"
Write-Host "MFA_ENCRYPTION_KEY=$mfaKeyBase64"
Write-Host "COOKIE_SECRET=$cookieSecret"