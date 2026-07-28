@extends('emails.layouts.base_text')

@section('content')
{{ $greeting }}

{{ $headline }}
{{ $supportingLine }}

Empresa: {{ $companyName }}
Turno: {{ $shiftTitle }}
Estado: {{ $statusLabel }}

{{ $actionText }}:
{{ $actionUrl }}
@endsection
