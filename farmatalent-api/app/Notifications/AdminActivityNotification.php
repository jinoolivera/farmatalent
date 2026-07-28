<?php

namespace App\Notifications;

use App\Notifications\Concerns\BuildsTransactionalMailMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminActivityNotification extends Notification implements ShouldQueue
{
    use BuildsTransactionalMailMessage;
    use Queueable;

    /**
     * @param array<int, string> $lines
     */
    public function __construct(
        private string $subject,
        private string $greeting,
        private array $lines,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return $this->transactionalMailMessage()
            ->subject($this->subject)
            ->view(
                ['emails.admin_activity', 'emails.admin_activity_text'],
                $this->viewData([
                    'title' => $this->subject,
                    'preheader' => 'Se registró una actividad administrativa en FarmaTalent.',
                    'greeting' => $this->greeting,
                    'lines' => $this->lines,
                ])
            );
    }
}
