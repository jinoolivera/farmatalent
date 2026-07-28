@extends('emails.layouts.base')

@section('content')
    <p class="greeting">{{ $greeting }}</p>
    <p class="paragraph">{{ $headline }}</p>
    <p class="paragraph">{{ $supportingLine }}</p>

    <div class="panel">
        <p class="panel-title">Resumen</p>
        <ul class="panel-list">
            <li>Empresa: {{ $companyName }}</li>
            <li>Turno: {{ $shiftTitle }}</li>
            <li>Estado: {{ $statusLabel }}</li>
        </ul>
    </div>

    <div class="button-wrap">
        <a class="button" href="{{ $actionUrl }}">{{ $actionText }}</a>
    </div>
@endsection
