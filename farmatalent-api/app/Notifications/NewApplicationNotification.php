<?php

namespace App\Notifications;

use App\Models\ShiftApplication;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewApplicationNotification extends Notification
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
        $shift = $this->application->shiftRequest;
        $professional = $this->application->user;
        $reviewUrl = rtrim(config('app.frontend_url'), '/') . '/app/postulaciones';

        return (new MailMessage)
            ->subject('Nueva postulación: ' . ($shift->title ?? 'turno publicado'))
            ->greeting('¡Tienes una nueva postulación!')
            ->line($professional->name . ' se postuló a tu turno "' . ($shift->title ?? 'Turno') . '".')
            ->line('Tipo de profesional: ' . ($professional->professional_type ?? '—'))
            ->when($this->application->message, fn ($mail) => $mail->line('Mensaje: "' . $this->application->message . '"'))
            ->action('Revisar postulación', $reviewUrl)
            ->salutation('El equipo de FarmaTalent');
    }
}
