<?php

namespace App\Rules;

use App\Models\Product;
use Closure;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;

class SufficientStock implements DataAwareRule, ValidationRule
{
    protected array $data = [];

    public function setData(array $data): static
    {
        $this->data = $data;

        return $this;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $productId = $this->data['product_id'] ?? null;

        if (!$productId) {
            return;
        }

        $product = Product::find($productId);

        if (!$product) {
            return;
        }

        if ($product->quantity < $value) {
            $fail("Insufficient stock. Available: {$product->quantity}, requested: {$value}.");
        }
    }
}
