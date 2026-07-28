<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? config('app.name') }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #f4f7f5;
            color: #1f2937;
            font-family: Arial, Helvetica, sans-serif;
        }

        table {
            border-collapse: collapse;
        }

        .wrapper {
            width: 100%;
            background: #f4f7f5;
            padding: 24px 12px;
        }

        .card {
            width: 100%;
            max-width: 640px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #dbe5dd;
            border-radius: 16px;
            overflow: hidden;
        }

        .hero {
            background: linear-gradient(135deg, #0f4c2c, #1f8f4a);
            color: #ffffff;
            padding: 28px 32px;
        }

        .brand {
            font-size: 13px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            opacity: 0.82;
            margin: 0 0 10px;
        }

        .title {
            font-size: 28px;
            line-height: 1.2;
            margin: 0;
        }

        .body {
            padding: 32px;
        }

        .greeting {
            font-size: 18px;
            font-weight: bold;
            color: #111827;
            margin: 0 0 18px;
        }

        .paragraph {
            font-size: 15px;
            line-height: 1.7;
            color: #374151;
            margin: 0 0 16px;
        }

        .panel {
            background: #f7faf8;
            border: 1px solid #d9e7dc;
            border-radius: 12px;
            padding: 16px 18px;
            margin: 24px 0;
        }

        .panel-title {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #0f4c2c;
            margin: 0 0 10px;
        }

        .panel-list {
            margin: 0;
            padding-left: 18px;
            color: #374151;
            font-size: 14px;
            line-height: 1.6;
        }

        .button-wrap {
            margin: 28px 0;
        }

        .button {
            display: inline-block;
            background: #1f8f4a;
            color: #ffffff !important;
            text-decoration: none;
            font-size: 15px;
            font-weight: bold;
            padding: 14px 22px;
            border-radius: 999px;
        }

        .muted {
            color: #6b7280;
            font-size: 13px;
            line-height: 1.6;
        }

        .footer {
            border-top: 1px solid #e5ebe7;
            padding: 20px 32px 28px;
            color: #6b7280;
            font-size: 12px;
            line-height: 1.6;
        }

        .footer a {
            color: #0f4c2c;
        }

        @media only screen and (max-width: 640px) {
            .hero,
            .body,
            .footer {
                padding: 24px 20px;
            }

            .title {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        {{ $preheader ?? ($title ?? config('app.name')) }}
    </div>

    <table role="presentation" class="wrapper">
        <tr>
            <td>
                <table role="presentation" class="card">
                    <tr>
                        <td class="hero">
                            <p class="brand">{{ config('app.name') }}</p>
                            <h1 class="title">{{ $title ?? config('app.name') }}</h1>
                        </td>
                    </tr>
                    <tr>
                        <td class="body">
                            @yield('content')
                        </td>
                    </tr>
                    <tr>
                        <td class="footer">
                            <div>{{ config('app.name') }} · {{ config('app.protocol') }}://{{ config('app.host') }}</div>
                            <div>Reply-To: {{ config('mail.reply_to.address') ?: 'No configurado' }}</div>
                            <div>© {{ date('Y') }} {{ config('app.name') }}. Correo transaccional automático.</div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
