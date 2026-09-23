<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Bukti Pengajuan - {{ $submission->title }}</title>
    <style>
        @page { margin: 28px 36px; }
        body { font-family: "DejaVu Sans", sans-serif; font-size: 11px; color: #1a1a1a; }
        .header { display: table; width: 100%; border-bottom: 3px solid #0f7a3d; padding-bottom: 10px; margin-bottom: 14px; }
        .header .logo { display: table-cell; width: 46px; vertical-align: middle; }
        .header .logo img { width: 40px; }
        .header .brand { display: table-cell; vertical-align: middle; padding-left: 10px; }
        .header .brand .name { font-size: 15px; font-weight: bold; color: #0f7a3d; }
        .header .brand .tagline { font-size: 9px; color: #666; }
        h1 { font-size: 14px; text-align: center; margin: 6px 0 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        table.info { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        table.info td { padding: 4px 6px; border: 1px solid #ddd; vertical-align: top; }
        table.info td.label { width: 32%; font-weight: bold; background: #f6f8f6; }
        table.docs { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        table.docs th, table.docs td { padding: 5px 6px; border: 1px solid #ddd; text-align: left; }
        table.docs th { background: #0f7a3d; color: #fff; font-size: 10px; }
        table.docs td { font-size: 10px; }
        .status-ok { color: #0f7a3d; font-weight: bold; }
        .status-missing { color: #b91c1c; font-weight: bold; }
        .payment-section { margin-top: 6px; padding: 10px; border: 1px solid #ddd; background: #fafafa; }
        .payment-section img { max-width: 260px; max-height: 260px; display: block; margin-top: 6px; border: 1px solid #ccc; }
        .footer-note { margin-top: 20px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 9px; color: #666; }
        .section-title { font-size: 11px; font-weight: bold; margin: 14px 0 6px; color: #0f7a3d; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">
            <img src="{{ public_path('images/logo-uninus.jpg') }}" alt="Logo">
        </div>
        <div class="brand">
            <div class="name">UNINUS PRESS</div>
            <div class="tagline">Unit Penerbitan Universitas Islam Nusantara</div>
        </div>
    </div>

    <h1>Bukti Pengajuan Naskah</h1>

    <table class="info">
        <tr>
            <td class="label">Nomor Virtual Account</td>
            <td>{{ $submission->va_number ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Judul Naskah</td>
            <td>{{ $submission->title }}</td>
        </tr>
        <tr>
            <td class="label">Nama Penulis</td>
            <td>{{ $submission->author_name }}</td>
        </tr>
        <tr>
            <td class="label">Kategori</td>
            <td>{{ $submission->category ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Status Saat Ini</td>
            <td>{{ $submission->current_status ?? $submission->current_stage }}</td>
        </tr>
        <tr>
            <td class="label">Tanggal Diajukan</td>
            <td>{{ optional($submission->submitted_at)->translatedFormat('d F Y, H:i') ?? '-' }} WIB</td>
        </tr>
        @if($submission->synopsis)
        <tr>
            <td class="label">Sinopsis</td>
            <td>{{ \Illuminate\Support\Str::limit($submission->synopsis, 400) }}</td>
        </tr>
        @endif
    </table>

    <div class="section-title">Kelengkapan Dokumen</div>
    <table class="docs">
        <thead>
            <tr>
                <th style="width: 4%;">No</th>
                <th style="width: 32%;">Jenis Dokumen</th>
                <th style="width: 40%;">Nama Berkas</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @php
                $labels = [
                    'synopsis' => 'Sinopsis',
                    'manuscript' => 'Naskah (Word/PDF)',
                    'cover_front' => 'Cover Depan',
                    'cover_back' => 'Cover Belakang',
                    'payment_receipt' => 'Kwitansi Lunas Keuangan',
                    'plagiarism_check' => 'Bukti Cek Plagiasi',
                ];
                $i = 1;
            @endphp
            @foreach($labels as $key => $label)
                @php $doc = $documents[$key] ?? null; @endphp
                <tr>
                    <td>{{ $i++ }}</td>
                    <td>{{ $label }}</td>
                    <td>{{ $doc?->file_name ?? '-' }}</td>
                    <td>
                        @if($doc)
                            <span class="status-ok">&#10003; Terunggah</span>
                        @else
                            <span class="status-missing">Belum Ada</span>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">Konfirmasi Pembayaran</div>
    <div class="payment-section">
        @if($paymentReceipt)
            <p>Kwitansi lunas keuangan telah diterima sistem: <strong>{{ $paymentReceipt->file_name }}</strong>
                (diunggah {{ $paymentReceipt->created_at->translatedFormat('d F Y, H:i') }} WIB).</p>
            @if($paymentReceiptImageDataUri)
                <img src="{{ $paymentReceiptImageDataUri }}" alt="Kwitansi Pembayaran">
            @else
                <p>Berkas kwitansi berformat dokumen (bukan gambar) — lihat lampiran asli di dashboard untuk detail.</p>
            @endif
        @else
            <p class="status-missing">Kwitansi pembayaran belum ditemukan pada pengajuan ini.</p>
        @endif
    </div>

    <div class="footer-note">
        Dokumen ini dibuat otomatis oleh sistem UNINUS Press pada
        {{ $generatedAt->translatedFormat('d F Y, H:i') }} WIB sebagai bukti pengajuan naskah dan
        konfirmasi pembayaran. Simpan/cetak dokumen ini sebagai bukti fisik pengajuan Anda.
    </div>
</body>
</html>
