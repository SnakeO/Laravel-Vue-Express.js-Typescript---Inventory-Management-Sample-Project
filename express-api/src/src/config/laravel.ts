export const laravelConfig = {
  apiUrl: process.env.LARAVEL_API_URL || 'http://laravel-app:8000/api/v1',
  timeout: parseInt(process.env.LARAVEL_TIMEOUT || '5000', 10),
}
