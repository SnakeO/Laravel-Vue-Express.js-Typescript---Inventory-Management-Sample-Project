<?php

use App\Models\User;

describe('POST /auth/validate', function () {
    it('returns user data on valid credentials', function () {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/validate', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => ['id', 'name', 'email'],
        ]);
        $response->assertJsonPath('data.email', 'test@example.com');
    });

    it('returns 422 on invalid password', function () {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/validate', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    });

    it('returns 422 on non-existent user', function () {
        $response = $this->postJson('/api/v1/auth/validate', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    });

    it('returns 422 on missing email', function () {
        $response = $this->postJson('/api/v1/auth/validate', [
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    });

    it('returns 422 on missing password', function () {
        $response = $this->postJson('/api/v1/auth/validate', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    });
});
