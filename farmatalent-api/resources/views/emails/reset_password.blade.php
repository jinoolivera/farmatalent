@extends('emails.layouts.base')

@section('content')
    <p class="greeting">Hola, {{ $userName }}.</p>
    <p class="paragraph">Recibimos una solicitud para restablecer la contraseña de tu cuenta en FarmaTalent.</p>
    <p class="paragraph">Si fuiste tú, continúa con el proceso desde el siguiente botón:</p>

    <div class="button-wrap">
        <a class="button" href="{{ $actionUrl }}">Restablecer contraseña</a>
    </div>

    <div class="panel">
        <p class="panel-title">Seguridad</p>
        <ul class="panel-list">
            <li>El enlace expira en 60 minutos.</li>
            <li>Si no solicitaste este cambio, ignora este correo y tu clave seguirá siendo la misma.</li>
        </ul>
    </div>

    <p class="paragraph muted">Enlace directo:</p>
    <p class="paragraph muted"><a href="{{ $actionUrl }}">{{ $actionUrl }}</a></p>
@endsection
