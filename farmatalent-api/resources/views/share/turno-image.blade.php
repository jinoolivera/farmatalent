<?php
    $esc = static fn (?string $value): string => e($value ?? '');
    $titleY = 320;
    $titleStep = 54;
    $companyY = 194;
    $companyStep = 34;
?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="bg-main" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
            <stop stop-color="#04142B"/>
            <stop offset="1" stop-color="#07254A"/>
        </linearGradient>
        <linearGradient id="right-panel" x1="770" y1="60" x2="1140" y2="570" gradientUnits="userSpaceOnUse">
            <stop stop-color="#10B981"/>
            <stop offset="1" stop-color="#115E59"/>
        </linearGradient>
        <radialGradient id="glow-left" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(180 120) rotate(25) scale(240 200)">
            <stop stop-color="#22C55E" stop-opacity=".24"/>
            <stop offset="1" stop-color="#22C55E" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="glow-right" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1090 92) rotate(20) scale(220 180)">
            <stop stop-color="#38BDF8" stop-opacity=".24"/>
            <stop offset="1" stop-color="#38BDF8" stop-opacity="0"/>
        </radialGradient>
        <clipPath id="logo-clip">
            <circle cx="137" cy="199" r="39"/>
        </clipPath>
    </defs>

    <rect width="1200" height="630" rx="30" fill="url(#bg-main)"/>
    <rect width="1200" height="630" rx="30" fill="url(#glow-left)"/>
    <rect width="1200" height="630" rx="30" fill="url(#glow-right)"/>

    <rect x="40" y="40" width="1120" height="550" rx="34" fill="#FFFFFF" fill-opacity=".07" stroke="#FFFFFF" stroke-opacity=".1"/>
    <rect x="60" y="60" width="1080" height="510" rx="30" fill="#F8FAFC"/>
    <rect x="770" y="60" width="370" height="510" rx="30" fill="url(#right-panel)"/>

    <rect x="98" y="98" width="150" height="38" rx="19" fill="#DCFCE7"/>
    <text x="122" y="122" fill="#166534" font-size="16" font-weight="700" font-family="Arial, Helvetica, sans-serif" letter-spacing="1.2">VACANTE ACTIVA</text>

    <circle cx="137" cy="199" r="39" fill="#FFFFFF" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="2"/>
    @if ($logoDataUri)
        <image x="98" y="160" width="78" height="78" href="{{ $logoDataUri }}" preserveAspectRatio="xMidYMid meet" clip-path="url(#logo-clip)"/>
    @else
        <text x="118" y="208" fill="#124436" font-size="28" font-weight="700" font-family="Arial, Helvetica, sans-serif">{{ $esc($companyInitials) }}</text>
    @endif

    <text x="196" y="178" fill="#166534" font-size="16" font-weight="700" font-family="Arial, Helvetica, sans-serif" letter-spacing=".8">Botica</text>
    @foreach ($companyLines as $index => $line)
        <text
            x="196"
            y="{{ $companyY + ($index * $companyStep) }}"
            fill="#0F172A"
            font-size="30"
            font-weight="700"
            font-family="Arial, Helvetica, sans-serif"
            letter-spacing="-0.5"
        >{{ $esc($line) }}</text>
    @endforeach

    <text x="98" y="284" fill="#475569" font-size="19" font-weight="400" font-family="Arial, Helvetica, sans-serif">{{ $esc($professionalType) }}</text>

    @foreach ($titleLines as $index => $line)
        <text
            x="98"
            y="{{ $titleY + ($index * $titleStep) }}"
            fill="#0F172A"
            font-size="48"
            font-weight="700"
            font-family="Arial, Helvetica, sans-serif"
            letter-spacing="-1.6"
        >{{ $esc($line) }}</text>
    @endforeach

    <rect x="98" y="430" width="292" height="50" rx="25" fill="#0F766E"/>
    <text x="126" y="462" fill="#FFFFFF" font-size="22" font-weight="700" font-family="Arial, Helvetica, sans-serif">Postula en FarmaTalent</text>

    <text x="804" y="112" fill="#D1FAE5" font-size="16" font-weight="700" font-family="Arial, Helvetica, sans-serif" letter-spacing="1.8">DETALLES DEL TURNO</text>
    <text x="804" y="152" fill="#FFFFFF" font-size="34" font-weight="700" font-family="Arial, Helvetica, sans-serif">{{ $esc(implode(' ', $companyLines)) }}</text>

    <rect x="804" y="222" width="302" height="126" rx="24" fill="#FFFFFF" fill-opacity=".92"/>
    <text x="828" y="246" fill="#D1FAE5" font-size="18" font-weight="700" font-family="Arial, Helvetica, sans-serif">Ubicacion</text>
    <text x="828" y="286" fill="#0F172A" font-size="20" font-weight="400" font-family="Arial, Helvetica, sans-serif">{{ $esc($location) }}</text>

    <rect x="804" y="372" width="142" height="100" rx="24" fill="#FFFFFF" fill-opacity=".92"/>
    <text x="828" y="395" fill="#D1FAE5" font-size="17" font-weight="700" font-family="Arial, Helvetica, sans-serif">Horario</text>
    <text x="828" y="428" fill="#0F172A" font-size="28" font-weight="700" font-family="Arial, Helvetica, sans-serif">{{ $esc($schedule) }}</text>

    <rect x="964" y="372" width="142" height="100" rx="24" fill="#FFFFFF" fill-opacity=".92"/>
    <text x="988" y="395" fill="#D1FAE5" font-size="17" font-weight="700" font-family="Arial, Helvetica, sans-serif">Fecha</text>
    <text x="988" y="428" fill="#0F172A" font-size="20" font-weight="700" font-family="Arial, Helvetica, sans-serif">{{ $esc($date) }}</text>

    <rect x="804" y="496" width="302" height="44" rx="22" fill="#064E3B" fill-opacity=".48"/>
    <text x="828" y="524" fill="#DCFCE7" font-size="18" font-weight="700" font-family="Arial, Helvetica, sans-serif">Encuentra personal de salud por turnos</text>

    <rect x="98" y="478" width="340" height="92" rx="22" fill="#FFFFFF"/>
    <rect x="116" y="496" width="16" height="16" rx="8" fill="#10B981"/>
    <text x="146" y="508" fill="#475569" font-size="17" font-weight="700" font-family="Arial, Helvetica, sans-serif">Ubicacion</text>
    <text x="120" y="540" fill="#0F172A" font-size="22" font-weight="700" font-family="Arial, Helvetica, sans-serif">{{ $esc($location) }}</text>

    <rect x="454" y="478" width="220" height="92" rx="22" fill="#FFFFFF"/>
    <rect x="472" y="496" width="16" height="16" rx="8" fill="#3B82F6"/>
    <text x="502" y="508" fill="#475569" font-size="17" font-weight="700" font-family="Arial, Helvetica, sans-serif">Horario</text>
    <text x="476" y="540" fill="#0F172A" font-size="22" font-weight="700" font-family="Arial, Helvetica, sans-serif">{{ $esc($schedule) }}</text>

    <rect x="690" y="478" width="220" height="92" rx="22" fill="#FFFFFF"/>
    <rect x="708" y="496" width="16" height="16" rx="8" fill="#F59E0B"/>
    <text x="738" y="508" fill="#475569" font-size="17" font-weight="700" font-family="Arial, Helvetica, sans-serif">Fecha</text>
    <text x="712" y="540" fill="#0F172A" font-size="22" font-weight="700" font-family="Arial, Helvetica, sans-serif">{{ $esc($date) }}</text>
</svg>
