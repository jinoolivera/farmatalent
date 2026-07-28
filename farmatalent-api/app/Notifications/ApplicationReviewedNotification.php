<?php

namespace App\Notifications;

use App\Notifications\Concerns\BuildsTransactionalMailMessage;
use App\Models\ShiftApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationReviewedNotification extends Notification implements ShouldQueue
{
    use BuildsTransactionalMailMessage;
    use Queueable;

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
        $actionUrl = $accepted
            ? rtrim(config('app.frontend_url'), '/') . '/app/postulaciones'
            : rtrim(config('app.frontend_url'), '/') . '/app/turnos';

        return $this->transactionalMailMessage()
            ->subject($accepted
                ? '¡Match confirmado! · ' . ($shift->title ?? 'Turno')
                : 'Actualización de tu postulación · ' . ($shift->title ?? 'Turno'))
            ->view(
                ['emails.application_reviewed', 'emails.application_reviewed_text'],
                $this->viewData([
                    'title' => $accepted ? 'Tu postulación fue aceptada' : 'Actualización de tu postulación',
                    'preheader' => $accepted
                        ? 'Ya puedes coordinar los detalles desde FarmaTalent.'
                        : 'Seguimos encontrando nuevas oportunidades para ti.',
                    'greeting' => $accepted ? 'Felicidades, ' . $notifiable->name . '.' : 'Hola, ' . $notifiable->name . '.',
                    'headline' => $accepted
                        ? $companyName . ' aceptó tu postulación al turno "' . ($shift->title ?? 'Turno') . '".'
                        : $companyName . ' decidió continuar con otro candidato para el turno "' . ($shift->title ?? 'Turno') . '".',
                    'supportingLine' => $accepted
                        ? 'Ya puedes coordinar los detalles directamente en el chat de la plataforma.'
                        : 'Sigue revisando turnos disponibles. Hay nuevas oportunidades todos los días.',
                    'companyName' => $companyName,
                    'shiftTitle' => $shift->title ?? 'Turno',
                    'statusLabel' => $accepted ? 'Aceptada' : 'No seleccionada',
                    'actionText' => $accepted ? 'Ver match y coordinar' : 'Ver más turnos',
                    'actionUrl' => $actionUrl,
                ])
            );
    }
}
