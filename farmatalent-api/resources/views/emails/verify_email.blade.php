@extends('emails.layouts.base')

@section('content')
    <p class="greeting">Hola, {{ $userName }}.</p>
    <p class="paragraph">Gracias por registrarte en FarmaTalent, la plataforma para conectar talento farmacéutico con oportunidades reales.</p>
    <p class="paragraph">Para activar tu cuenta y validar tu dirección de correo, haz clic en el botón de abajo.</p>

    <div class="button-wrap">
        <a class="button" href="{{ $actionUrl }}">Verificar correo electrónico</a>
    </div>

    <div class="panel">
        <p class="panel-title">Importante</p>
        <ul class="panel-list">
            <li>Este enlace expira en 60 minutos.</li>
            <li>Si no creaste una cuenta en FarmaTalent, puedes ignorar este mensaje.</li>
        </ul>
    </div>

    <p class="paragraph muted">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
    <p class="paragraph muted"><a href="{{ $actionUrl }}">{{ $actionUrl }}</a></p>
@endsection
