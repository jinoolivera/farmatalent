@extends('emails.layouts.base')

@section('content')
    <p class="greeting">Nuevo registro en la plataforma.</p>
    <p class="paragraph">Se creó una nueva cuenta en FarmaTalent y requiere seguimiento administrativo.</p>

    <div class="panel">
        <p class="panel-title">Datos del registro</p>
        <ul class="panel-list">
            <li>Nombre: {{ $userName }}</li>
            <li>Email: {{ $userEmail }}</li>
            <li>Tipo de cuenta: {{ $accountTypeLabel }}</li>
            @if ($professionalType)
                <li>Perfil profesional: {{ $professionalType }}</li>
            @endif
        </ul>
    </div>
@endsection
