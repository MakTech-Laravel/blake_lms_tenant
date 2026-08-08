{{--
    Announcement email. Table-based and inline-styled on purpose: Outlook and
    most webmail clients strip <style> blocks and ignore flexbox.
--}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title }}</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif; color:#03264e;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc; padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e6e9ed;">
                    <tr>
                        <td style="background-color:#03264e; padding:24px 32px;">
                            <span style="font-size:20px; font-weight:700; color:#ffffff; letter-spacing:-0.2px;">Aqua</span><span style="font-size:20px; font-weight:700; color:#0ab1b9; letter-spacing:-0.2px;">Cert</span>
                            <div style="margin-top:4px; font-size:11px; color:#8b9bae; text-transform:uppercase; letter-spacing:1px;">{{ $categoryLabel }}</div>
                        </td>
                    </tr>

                    @if ($priority->isElevated())
                        <tr>
                            <td style="padding:0;">
                                <div style="background-color:{{ $priority === \App\Enums\NotificationPriority::Urgent ? '#fef2f2' : '#fffbeb' }}; color:{{ $priority === \App\Enums\NotificationPriority::Urgent ? '#b91c1c' : '#b45309' }}; padding:10px 32px; font-size:12px; font-weight:600;">
                                    {{ $priority->label() }} priority
                                </div>
                            </td>
                        </tr>
                    @endif

                    <tr>
                        <td style="padding:32px;">
                            <p style="margin:0 0 20px; font-size:14px; color:#566e88;">Hi {{ $recipientName }},</p>

                            <h1 style="margin:0 0 16px; font-size:22px; line-height:30px; font-weight:700; color:#03264e;">{{ $title }}</h1>

                            <div style="font-size:15px; line-height:24px; color:#355171;">
                                @foreach (preg_split('/\R{2,}/', trim($body)) as $paragraph)
                                    <p style="margin:0 0 14px;">{!! nl2br(e($paragraph)) !!}</p>
                                @endforeach
                            </div>

                            @if ($actionUrl && $actionLabel)
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px;">
                                    <tr>
                                        <td style="background-color:#0ab1b9; border-radius:8px;">
                                            <a href="{{ $actionUrl }}" style="display:inline-block; padding:12px 24px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none;">{{ $actionLabel }}</a>
                                        </td>
                                    </tr>
                                </table>
                            @endif
                        </td>
                    </tr>

                    <tr>
                        <td style="border-top:1px solid #e6e9ed; padding:20px 32px; background-color:#f8fafc;">
                            <p style="margin:0 0 6px; font-size:12px; line-height:18px; color:#566e88;">
                                Sent by {{ $senderName }}. You can review this and every other notification in
                                <a href="{{ $inboxUrl }}" style="color:#077e83; text-decoration:underline;">your inbox</a>.
                            </p>
                            <p style="margin:0; font-size:11px; color:#8b9bae;">&copy; {{ now()->year }} {{ config('app.name') }}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
