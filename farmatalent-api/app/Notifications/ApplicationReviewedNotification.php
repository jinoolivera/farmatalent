<?php

namespace App\Notifications;

use App\Models\ShiftApplication;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationReviewedNotification extends Notification
{
    public function __construct(private ShiftApplication $application)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $accepted = $this->application->status === 'accepted';
        $shift = $this->application->shiftRequest;
        $companyName = $shift->company->name ?? 'la farmacia';
        $appUrl = rtrim(config('app.frontend_url'), '/') . '/app/postulaciones';

        $mail = (new MailMessage)
            ->subject($accepted
                ? '¡Match confirmado! · ' . ($shift->title ?? 'Turno')
                : 'Actualización de tu postulación · ' . ($shift->title ?? 'Turno'))
            ->greeting($accepted ? '¡Felicidades, ' . $notifiable->name . '!' : 'Hola, ' . $notifiable->name . '.');

        if ($accepted) {
            $mail->line($companyName . ' aceptó tu postulación al turno "' . ($shift->title ?? 'Turno') . '".')
                ->line('Ya puedes coordinar los detalles directamente en el chat de la plataforma.')
                ->action('Ver match y coordinar', $appUrl);
        } else {
            $mail->line($companyName . ' decidió continuar con otro candidato para el turno "' . ($shift->title ?? 'Turno') . '".')
                ->line('Sigue revisando turnos disponibles — hay nuevas oportunidades todos los días.')
                ->action('Ver más turnos', rtrim(config('app.frontend_url'), '/') . '/app/turnos');
        }

        return $mail->salutation('El equipo de FarmaTalent');
    }
}
