<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>

    <meta property="og:title" content="{{ $title }}">
    <meta property="og:description" content="{{ $description }}">
    <meta property="og:image" content="{{ $image }}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="{{ $shareUrl }}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="FarmaTalent">
    <meta property="og:locale" content="es_PE">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $title }}">
    <meta name="twitter:description" content="{{ $description }}">
    <meta name="twitter:image" content="{{ $image }}">

    <meta name="description" content="{{ $description }}">
    <script>window.location.replace("{{ $redirectUrl }}");</script>
</head>
<body style="font-family: system-ui, sans-serif; background:#0B1F3F; color:#fff; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; text-align:center;">
    <div>
        <p>Redirigiendo a FarmaTalent…</p>
        <p><a href="{{ $redirectUrl }}" style="color:#5BB07A;">Haz clic aquí si no eres redirigido automáticamente</a></p>
    </div>
</body>
</html>
