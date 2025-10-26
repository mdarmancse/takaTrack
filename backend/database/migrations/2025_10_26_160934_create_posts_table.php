<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('content')->nullable();
            $table->text('excerpt')->nullable();
            $table->string('status')->default('draft'); // draft, published, archived
            $table->string('type')->default('post'); // post, page, article
            $table->json('meta')->nullable(); // SEO meta data
            $table->json('blocks')->nullable(); // Block editor content
            $table->string('featured_image')->nullable();
            $table->json('tags')->nullable(); // Array of tags
            $table->json('categories')->nullable(); // Array of categories
            $table->timestamp('published_at')->nullable();
            $table->unsignedBigInteger('author_id');
            $table->timestamps();

            $table->foreign('author_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['status', 'published_at']);
            $table->index(['type', 'status']);
            $table->index('author_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};