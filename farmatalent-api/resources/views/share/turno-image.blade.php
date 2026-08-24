<?php
    $esc = static fn (?string $value): string => e($value ?? '');
    $titleY = 252;
    $titleStep = 72;
    $companyY = 116;
    $companyStep = 28;
?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="bg-main" x1="80" y1="40" x2="1110" y2="590" gradientUnits="userSpaceOnUse">
            <stop stop-color="#06122A"/>
            <stop offset="1" stop-color="#10294D"/>
        </linearGradient>
        <linearGradient id="panel-glow" x1="690" y1="118" x2="1110" y2="520" gradientUnits="userSpaceOnUse">
            <stop stop-color="#1A8B57"/>
            <stop offset="1" stop-color="#0F5132"/>
        </linearGradient>
        <radialGradient id="aura-left" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(180 580) rotate(-35) scale(360 280)">
            <stop stop-color="#22C55E" stop-opacity=".24"/>
            <stop offset="1" stop-color="#22C55E" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="aura-right" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1040 40) rotate(140) scale(320 240)">
            <stop stop-color="#93C5FD" stop-opacity=".18"/>
            <stop offset="1" stop-color="#93C5FD" stop-opacity="0"/>
        </radialGradient>
        <clipPath id="logo-clip">
            <circle cx="150" cy="120" r="42"/>
        </clipPath>
    </defs>

    <rect width="1200" height="630" rx="28" fill="url(#bg-main)"/>
    <rect width="1200" height="630" rx="28" fill="url(#aura-left)"/>
    <rect width="1200" height="630" rx="28" fill="url(#aura-right)"/>

    <circle cx="182" cy="540" r="178" fill="#22C55E" fill-opacity=".06"/>
    <circle cx="1110" cy="82" r="120" fill="#7DD3FC" fill-opacity=".05"/>

    <rect x="690" y="110" width="430" height="410" rx="30" fill="#FFFFFF" fill-opacity=".06"/>
    <rect x="705" y="128" width="400" height="374" rx="26" fill="url(#panel-glow)"/>
    <rect x="725" y="150" width="360" height="140" rx="22" fill="#06122A" fill-opacity=".28"/>
    <rect x="725" y="310" width="360" height="88" rx="20" fill="#FFFFFF" fill-opacity=".08"/>
    <rect x="725" y="414" width="360" height="60" rx="18" fill="#FFFFFF" fill-opacity=".1"/>

    <rect x="76" y="74" width="86" height="86" rx="43" fill="#F8FAFC" fill-opacity=".12" stroke="#FFFFFF" stroke-opacity=".18"/>
    @if ($logoDataUri)
        <image x="108" y="78" width="84" height="84" href="{{ $logoDataUri }}" preserveAspectRatio="xMidYMid meet" clip-path="url(#logo-clip)"/>
    @else
        <text x="119" y="132" fill="#FFFFFF" font-size="30" font-weight="700" font-family="Arial, Helvetica, sans-serif" letter-spacing="1.5">{{ $esc($companyInitials) }}</text>
    @endif

    <text x="220" y="92" fill="#7EE2A8" font-size="14" font-weight="700" font-family="Arial, Helvetica, sans-serif" letter-spacing="3.4">VACANTE ACTIVA</text>
    @foreach ($companyLines as $index => $line)
        <text
            x="220"
            y="{{ $companyY + ($index * $companyStep) }}"
            fill="#FFFFFF"
            font-size="30"
            font-weight="700"
            font-family="Arial, Helvetica, sans-serif"
            letter-spacing="-0.4"
        >{{ $esc($line) }}</text>
    @endforeach
    <text x="220" y="164" fill="#FFFFFF" fill-opacity=".72" font-size="18" font-weight="400" font-family="Arial, Helvetica, sans-serif">{{ $esc($professionalType) }}</text>

    @foreach ($titleLines as $index => $line)
        <text
            x="76"
            y="{{ $titleY + ($index * $titleStep) }}"
            fill="#FFFFFF"
            font-size="64"
            font-weight="700"
            font-family="Arial, Helvetica, sans-serif"
            letter-spacing="-1.8"
        >{{ $esc($line) }}</text>
    @endforeach

    <text x="76" y="388" fill="#FFFFFF" fill-opacity=".72" font-size="22" font-weight="400" font-family="Arial, Helvetica, sans-serif">
        {{ $esc($tagline) }}
    </text>

    <rect x="76" y="444" width="234" height="66" rx="33" fill="#FFFFFF"/>
    <text x="112" y="486" fill="#06122A" font-size="24" font-weight="700" font-family="Arial, Helvetica, sans-serif">Postula ahora</text>

    <text x="728" y="186" fill="#FFFFFF" fill-opacity=".62" font-size="15" font-weight="700" font-family="Arial, Helvetica, sans-serif" letter-spacing="2.2">DETALLE DEL TURNO</text>

    <text x="728" y="222" fill="#FFFFFF" font-size="18" font-weight="400" font-family="Arial, Helvetica, sans-serif">Ubicacion</text>
    <text x="728" y="255" fill="#FFFFFF" font-size="28" font-weight="700" font-family="Arial, Helvetica, sans-serif">{{ $esc($location) }}</text>

    <text x="728" y="346" fill="#FFFFFF" fill-opacity=".72" font-size="17" font-weight="400" font-family="Arial, Helvetica, sans-serif">Horario</text>
    <text x="728" y="377" fill="#FFFFFF" font-size="30" font-weight="700" font-family="Arial, Helvetica, sans-serif">{{ $esc($schedule) }}</text>

    <text x="728" y="449" fill="#FFFFFF" fill-opacity=".72" font-size="17" font-weight="400" font-family="Arial, Helvetica, sans-serif">Fecha</text>
    <text x="728" y="480" fill="#FFFFFF" font-size="26" font-weight="700" font-family="Arial, Helvetica, sans-serif">{{ $esc($date) }}</text>

    <text x="76" y="580" fill="#FFFFFF" fill-opacity=".55" font-size="20" font-weight="400" font-family="Arial, Helvetica, sans-serif">
        FarmaTalent · conecta boticas y profesionales con postulacion rapida
    </text>
</svg>
