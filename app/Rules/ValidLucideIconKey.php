<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidLucideIconKey implements ValidationRule
{
    /**
     * @var array<int, string>|null
     */
    private static ?array $keys = null;

    /**
     * @return array<int, string>
     */
    public static function keys(): array
    {
        if (self::$keys !== null) {
            return self::$keys;
        }

        $path = storage_path('app/lucide-icon-keys.json');

        if (! is_file($path)) {
            self::$keys = [];

            return self::$keys;
        }

        $contents = file_get_contents($path);

        if ($contents === false) {
            self::$keys = [];

            return self::$keys;
        }

        /** @var mixed $decoded */
        $decoded = json_decode($contents, true);

        if (! is_array($decoded)) {
            self::$keys = [];

            return self::$keys;
        }

        self::$keys = array_values(array_filter(
            $decoded,
            static fn (mixed $key): bool => is_string($key) && $key !== '',
        ));

        return self::$keys;
    }

    public static function contains(string $key): bool
    {
        return in_array($key, self::keys(), true);
    }

    /**
     * Reset the static cache (tests).
     */
    public static function flush(): void
    {
        self::$keys = null;
    }

    /**
     * @param  Closure(string, ?string=): void  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! self::contains($value)) {
            $fail('The :attribute must be a valid Lucide icon key.');
        }
    }
}
