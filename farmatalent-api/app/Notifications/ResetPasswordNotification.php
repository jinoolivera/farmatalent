<?php

namespace App\Notifications;

use App\Notifications\Concerns\BuildsTransactionalMailMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use BuildsTransactionalMailMessage;

    public function __construct(public readonly string $token)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = rtrim(config('app.frontend_url'), '/')
            . '/restablecer-contrasena?token=' . urlencode($this->token)
            . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        return $this->transactionalMailMessage()
            ->subject('Restablece tu contraseña en FarmaTalent')
            ->view(
                ['emails.reset_password', 'emails.reset_password_text'],
                $this->viewData([
                    'title' => 'Restablece tu contraseña en FarmaTalent',
                    'preheader' => 'Protege tu cuenta con una nueva contraseña segura.',
                    'userName' => $notifiable->name,
                    'actionUrl' => $resetUrl,
                ])
            );
    }
}
