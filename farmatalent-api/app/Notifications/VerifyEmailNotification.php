<?php

namespace App\Notifications;

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
class VerifyEmailNotification extends Notification
{
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

        return (new MailMessage)
            ->subject('Verifica tu correo en FarmaTalent')
            ->greeting('¡Hola, ' . $notifiable->name . '!')
            ->line('Gracias por registrarte en FarmaTalent, el marketplace del talento farmacéutico en el Perú.')
            ->line('Haz clic en el botón para verificar tu dirección de correo y activar tu cuenta.')
            ->action('Verificar correo electrónico', $verifyUrl)
            ->line('Este enlace expira en **60 minutos**.')
            ->line('Si no creaste una cuenta en FarmaTalent, puedes ignorar este mensaje.')
            ->salutation('El equipo de FarmaTalent');
    }
}
