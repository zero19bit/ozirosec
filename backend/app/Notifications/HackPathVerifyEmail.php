<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

final class HackPathVerifyEmail extends VerifyEmail
{
    public function toMail(mixed $notifiable): MailMessage
    {
        $url = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verify your HackPath email address')
            ->greeting('Welcome to HackPath!')
            ->line('Please verify your email address to activate verified HackPath features.')
            ->action('Verify email address', $url)
            ->line('This verification link expires in 60 minutes.')
            ->line('If you did not create a HackPath account, no action is required.')
            ->line('If the button does not work, copy and paste this link into your browser:')
            ->line($url);
    }
}
