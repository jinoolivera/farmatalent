<?php

namespace App\Notifications;

use App\Notifications\Concerns\BuildsTransactionalMailMessage;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminNewUserNotification extends Notification implements ShouldQueue
{
    use BuildsTransactionalMailMessage;
    use Queueable;

    public function __construct(private User $user, private string $accountType)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return $this->transactionalMailMessage()
            ->subject('Nuevo registro en FarmaTalent: ' . $this->user->name)
            ->view(
                ['emails.admin_new_user', 'emails.admin_new_user_text'],
                $this->viewData([
                    'title' => 'Nuevo registro en FarmaTalent',
                    'preheader' => 'Se creó una nueva cuenta en la plataforma.',
                    'userName' => $this->user->name,
                    'userEmail' => $this->user->email,
                    'accountTypeLabel' => $this->accountType === 'company' ? 'Empresa / farmacia' : 'Profesional',
                    'professionalType' => $this->user->professional_type,
                ])
            );
    }
}
