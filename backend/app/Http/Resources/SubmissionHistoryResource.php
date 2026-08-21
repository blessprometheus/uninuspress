<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\SubmissionHistory
 */
class SubmissionHistoryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'from_stage' => $this->from_stage,
            'to_stage' => $this->to_stage,
            'note' => $this->note,
            'performed_at' => $this->performed_at->toISOString(),

            'actor' => $this->whenLoaded('actor', fn () => [
                'id' => $this->actor?->id,
                'name' => $this->actor?->name,
            ]),
        ];
    }
}