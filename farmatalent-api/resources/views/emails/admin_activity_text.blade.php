@extends('emails.layouts.base_text')

@section('content')
{{ $greeting }}

Se registró un evento administrativo en FarmaTalent.

@foreach ($lines as $line)
- {{ $line }}
@endforeach
@endsection
