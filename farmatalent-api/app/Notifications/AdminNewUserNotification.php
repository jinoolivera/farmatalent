<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminNewUserNotification extends Notification
{
    public function __construct(private User $user, private string $accountType)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nuevo registro en FarmaTalent: ' . $this->user->name)
            ->greeting('Nuevo registro en la plataforma')
            ->line('Nombre: ' . $this->user->name)
            ->line('Email: ' . $this->user->email)
            ->line('Tipo de cuenta: ' . ($this->accountType === 'company' ? 'Empresa / farmacia' : 'Profesional'))
            ->when($this->user->professional_type, fn ($mail) => $mail->line('Perfil profesional: ' . $this->user->professional_type))
            ->salutation('FarmaTalent · Notificación automática');
    }
}
