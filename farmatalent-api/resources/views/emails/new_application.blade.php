@extends('emails.layouts.base')

@section('content')
    <p class="greeting">Tienes una nueva postulación.</p>
    <p class="paragraph"><strong>{{ $professionalName }}</strong> se postuló al turno <strong>{{ $shiftTitle }}</strong>.</p>

    <div class="panel">
        <p class="panel-title">Detalle de la postulación</p>
        <ul class="panel-list">
            <li>Profesional: {{ $professionalName }}</li>
            <li>Tipo de perfil: {{ $professionalType }}</li>
            @if ($applicationMessage)
                <li>Mensaje: {{ $applicationMessage }}</li>
            @endif
        </ul>
    </div>

    <p class="paragraph">Puedes revisar la postulación y continuar el proceso desde el panel de FarmaTalent.</p>

    <div class="button-wrap">
        <a class="button" href="{{ $actionUrl }}">Revisar postulación</a>
    </div>
@endsection
