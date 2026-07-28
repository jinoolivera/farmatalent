@extends('emails.layouts.base_text')

@section('content')
Tienes una nueva postulación.

{{ $professionalName }} se postuló al turno "{{ $shiftTitle }}".
Tipo de perfil: {{ $professionalType }}
@if ($applicationMessage)
Mensaje: {{ $applicationMessage }}
@endif

Revisa la postulación aquí:
{{ $actionUrl }}
@endsection
