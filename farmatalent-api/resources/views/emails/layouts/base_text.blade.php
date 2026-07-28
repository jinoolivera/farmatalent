{{ $title ?? config('app.name') }}
{{ str_repeat('=', mb_strlen($title ?? config('app.name'))) }}

@yield('content')

--
{{ config('app.name') }}
{{ config('app.protocol') }}://{{ config('app.host') }}
Reply-To: {{ config('mail.reply_to.address') ?: 'No configurado' }}
Correo transaccional automático.
