<?php

namespace App\Observers;

use App\Models\Product;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Notifies Express API to invalidate cache when products change
 */
class ProductObserver
{
    public function created(Product $product): void
    {
        $this->invalidateCache();
    }

    public function updated(Product $product): void
    {
        $this->invalidateCache();
    }

    public function deleted(Product $product): void
    {
        $this->invalidateCache();
    }

    private function invalidateCache(): void
    {
        $url = config('services.express.url');
        $secret = config('services.express.webhook_secret');

        if (!$url) {
            return;
        }

        try {
            Http::withHeaders([
                'X-Webhook-Secret' => $secret,
            ])->post("{$url}/webhooks/cache/invalidate");
        } catch (\Exception $e) {
            Log::warning('Failed to invalidate Express cache: ' . $e->getMessage());
        }
    }
}
