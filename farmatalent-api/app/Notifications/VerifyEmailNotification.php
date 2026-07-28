<?php

namespace App\Notifications;

use App\Notifications\Concerns\BuildsTransactionalMailMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Carbon;

/**
 * Notificación de verificación de email personalizada para FarmaTalent.
 * Genera una URL firmada temporalmente que apunta al endpoint de la API,
 * la cual luego redirige al frontend.
 */
class VerifyEmailNotification extends Notification implements ShouldQueue
{
    use BuildsTransactionalMailMessage;
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $verifyUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id'   => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        return $this->transactionalMailMessage()
            ->subject('Verifica tu correo en FarmaTalent')
            ->view(
                ['emails.verify_email', 'emails.verify_email_text'],
                $this->viewData([
                    'title' => 'Verifica tu correo en FarmaTalent',
                    'preheader' => 'Activa tu cuenta y comienza a usar FarmaTalent.',
                    'userName' => $notifiable->name,
                    'actionUrl' => $verifyUrl,
                ])
            );
    }
}
