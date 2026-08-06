<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Certificate — {{ $certificateNumber }}</title>
    <style>
        @page { size: landscape; margin: 24px; }
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #03264e;
            background: #ffffff;
        }
        .frame {
            border: 4px solid #0ab1b9;
            padding: 48px 56px;
            min-height: 520px;
        }
        .brand {
            font-size: 16px;
            letter-spacing: 4px;
            text-transform: uppercase;
            color: #0ab1b9;
            font-weight: bold;
        }
        .eyebrow {
            margin-top: 28px;
            font-size: 13px;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #566e88;
        }
        .recipient {
            margin-top: 12px;
            font-size: 36px;
            font-weight: bold;
            color: #03264e;
        }
        .course {
            margin-top: 14px;
            font-size: 20px;
            color: #0ab1b9;
            font-weight: bold;
        }
        .meta {
            margin-top: 48px;
            width: 100%;
        }
        .meta td {
            font-size: 12px;
            color: #566e88;
            vertical-align: top;
            width: 33%;
        }
        .meta strong {
            display: block;
            color: #03264e;
            font-size: 14px;
            margin-top: 4px;
        }
    </style>
</head>
<body>
    <div class="frame">
        <div class="brand">AquaCert</div>
        <p class="eyebrow">Certificate of Completion</p>
        <h1 class="recipient">{{ $recipientName }}</h1>
        <p class="course">{{ $courseTitle }}</p>
        <table class="meta">
            <tr>
                <td>Certificate #<strong>{{ $certificateNumber }}</strong></td>
                <td>Issued<strong>{{ $issuedAt }}</strong></td>
                <td>Expires<strong>{{ $expiresAt }}</strong></td>
            </tr>
        </table>
    </div>
</body>
</html>
