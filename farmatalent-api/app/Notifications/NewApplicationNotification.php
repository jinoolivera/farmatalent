<?php

namespace App\Notifications;

use App\Notifications\Concerns\BuildsTransactionalMailMessage;
use App\Models\ShiftApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewApplicationNotification extends Notification implements ShouldQueue
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
        $shift = $this->application->shiftRequest;
        $professional = $this->application->user;
        $reviewUrl = rtrim(config('app.frontend_url'), '/') . '/app/postulaciones';

        return $this->transactionalMailMessage()
            ->subject('Nueva postulación: ' . ($shift->title ?? 'turno publicado'))
            ->view(
                ['emails.new_application', 'emails.new_application_text'],
                $this->viewData([
                    'title' => 'Nueva postulación recibida',
                    'preheader' => 'Ya tienes un nuevo candidato para uno de tus turnos.',
                    'professionalName' => $professional->name,
                    'professionalType' => $professional->professional_type ?? 'No especificado',
                    'shiftTitle' => $shift->title ?? 'Turno',
                    'applicationMessage' => $this->application->message,
                    'actionUrl' => $reviewUrl,
                ])
            );
    }
}
