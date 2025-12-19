<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_order_decrements_product_quantity(): void
    {
        $product = Product::factory()->create(['quantity' => 50]);

        $response = $this->postJson(route('orders.store'), [
            'product_id' => $product->id,
            'quantity' => 10,
        ]);

        $response->assertStatus(Response::HTTP_CREATED);
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'quantity' => 40,
        ]);
    }

    public function test_deleting_order_restores_product_quantity(): void
    {
        $product = Product::factory()->create(['quantity' => 50]);
        $order = Order::factory()->create([
            'product_id' => $product->id,
            'quantity' => 10,
        ]);

        $product->refresh();
        $this->assertEquals(40, $product->quantity);

        $response = $this->deleteJson(route('orders.destroy', $order));

        $response->assertNoContent();
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'quantity' => 50,
        ]);
    }

    public function test_cannot_create_order_with_insufficient_stock(): void
    {
        $product = Product::factory()->create(['quantity' => 5]);

        $response = $this->postJson(route('orders.store'), [
            'product_id' => $product->id,
            'quantity' => 10,
        ]);

        $response->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY);
        $response->assertJsonValidationErrors(['quantity']);
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'quantity' => 5,
        ]);
    }

    public function test_cannot_update_order(): void
    {
        $order = Order::factory()->create();

        $response = $this->putJson(route('orders.show', $order), [
            'quantity' => 5,
        ]);

        $response->assertStatus(Response::HTTP_METHOD_NOT_ALLOWED);
    }
}
