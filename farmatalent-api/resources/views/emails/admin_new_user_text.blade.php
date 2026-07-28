@extends('emails.layouts.base_text')

@section('content')
Nuevo registro en la plataforma.

Nombre: {{ $userName }}
Email: {{ $userEmail }}
Tipo de cuenta: {{ $accountTypeLabel }}
@if ($professionalType)
Perfil profesional: {{ $professionalType }}
@endif
@endsection
