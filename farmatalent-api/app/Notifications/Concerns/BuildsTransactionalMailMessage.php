<?php

namespace App\Notifications\Concerns;

use Illuminate\Notifications\Messages\MailMessage;

trait BuildsTransactionalMailMessage
{
    protected function transactionalMailMessage(): MailMessage
    {
        $mail = new MailMessage();

        $replyToAddress = config('mail.reply_to.address');
        $replyToName = config('mail.reply_to.name');

        if ($replyToAddress) {
            $mail->replyTo($replyToAddress, $replyToName);
        }

        return $mail;
    }

    /**
     * @param array<string, mixed> $data
     */
    protected function viewData(array $data = []): array
    {
        return array_merge([
            'appName' => config('app.name'),
            'appHost' => config('app.host'),
            'appProtocol' => config('app.protocol'),
        ], $data);
    }
}
