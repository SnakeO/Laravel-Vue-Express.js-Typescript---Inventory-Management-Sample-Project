<?php

namespace App\Observers;

use App\Models\Order;

class OrderObserver
{
    public function created(Order $order): void
    {
        $order->product->decrement('quantity', $order->quantity);
    }

    public function deleted(Order $order): void
    {
        $order->product->increment('quantity', $order->quantity);
    }
}
