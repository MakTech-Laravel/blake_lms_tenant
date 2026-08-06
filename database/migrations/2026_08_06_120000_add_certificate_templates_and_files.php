<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificate_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('blade_view')->default('certificates.templates.default');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->foreignId('certificate_template_id')
                ->nullable()
                ->after('course_id')
                ->constrained('certificate_templates')
                ->nullOnDelete();
            $table->timestamp('expires_at')->nullable()->after('issued_at');
            $table->string('status')->default('valid')->after('expires_at');
            $table->string('pdf_path')->nullable()->after('status');
            $table->string('preview_path')->nullable()->after('pdf_path');
        });
    }

    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropConstrainedForeignId('certificate_template_id');
            $table->dropColumn(['expires_at', 'status', 'pdf_path', 'preview_path']);
        });

        Schema::dropIfExists('certificate_templates');
    }
};
