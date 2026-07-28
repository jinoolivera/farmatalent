@extends('emails.layouts.base_text')

@section('content')
Hola, {{ $userName }}.

Recibimos una solicitud para restablecer la contraseña de tu cuenta en FarmaTalent.

Usa este enlace para continuar:
{{ $actionUrl }}

El enlace expira en 60 minutos.
Si no solicitaste este cambio, puedes ignorar este correo.
@endsection
