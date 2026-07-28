@extends('emails.layouts.base')

@section('content')
    <p class="greeting">{{ $greeting }}</p>
    <p class="paragraph">Se registró un evento administrativo en FarmaTalent.</p>

    <div class="panel">
        <p class="panel-title">Detalle</p>
        <ul class="panel-list">
            @foreach ($lines as $line)
                <li>{{ $line }}</li>
            @endforeach
        </ul>
    </div>
@endsection
