@extends('emails.layouts.base_text')

@section('content')
Hola, {{ $userName }}.

Gracias por registrarte en FarmaTalent, la plataforma para conectar talento farmacéutico con oportunidades reales.

Para activar tu cuenta y validar tu dirección de correo, usa este enlace:
{{ $actionUrl }}

Este enlace expira en 60 minutos.
Si no creaste una cuenta en FarmaTalent, puedes ignorar este mensaje.
@endsection
