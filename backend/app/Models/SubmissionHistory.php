<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Audit trail / riwayat perubahan status pengajuan.
 * Catatan: tabel ini append-only — tidak boleh dihapus (AGENTS.md).
 */
class SubmissionHistory extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'submission_id',
        'actor_id',
        'action',
        'from_stage',
        'to_stage',
        'note',
        'performed_at',
    ];

    protected function casts(): array
    {
        return [
            'performed_at' => 'datetime',
        ];
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}