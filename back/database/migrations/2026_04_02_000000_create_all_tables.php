<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Типы пользователей
        Schema::create('user_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 30);
            $table->timestamps(); // Добавлено
        });

        // 2. Локации
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('citizenship_name', 100);
            $table->string('region_name', 100);
            $table->string('city_name', 100);
            $table->string('region_code', 10)->nullable();
            $table->timestamps(); // Добавлено
        });

        // 3. Типы документов
        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->timestamps(); // Добавлено
        });

        // 4. Пользователи
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email', 50)->unique();
            $table->string('phone', 10)->unique();
            $table->string('password_hash', 255);
            $table->foreignId('user_type_id')->constrained('user_types');
            $table->timestamps(); // Изменено: вместо timestamp('created_at')
        });

        // 5. Типы полисов
        Schema::create('policy_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->timestamps(); // Добавлено
        });

        // 6. Категории ТС
        Schema::create('vehicle_categories', function (Blueprint $table) {
            $table->string('code', 10)->primary();
            $table->string('name', 50);
            $table->timestamps(); // Добавлено
        });

        // 7. Профили клиентов
        Schema::create('client_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('last_name', 30)->nullable();
            $table->string('first_name', 30)->nullable();
            $table->string('middle_name', 30)->nullable();
            $table->date('birth_date')->nullable();
            $table->foreignId('location_id')->nullable()->constrained('locations');
            
            // Паспортные данные
            $table->foreignId('document_type_id')->nullable()->constrained('document_types');
            $table->string('passport_series', 10)->nullable();
            $table->string('passport_number', 20)->nullable();
            $table->string('passport_issued_by', 100)->nullable();
            $table->date('passport_issue_date')->nullable();
            $table->date('passport_expiry_date')->nullable();
            
            // Водительские права
            $table->string('driver_license_series', 10)->nullable();
            $table->string('driver_license_number', 20)->nullable();
            $table->string('driver_license_issued_by', 100)->nullable();
            $table->date('driver_license_issue_date')->nullable();
            $table->date('driver_license_expiry_date')->nullable();
            $table->string('driver_categories', 50)->nullable();
            
            // Данные для расчета
            $table->integer('driver_experience_years')->default(0);
            $table->string('bonus_malus_class', 10)->default('M');
            $table->boolean('has_accidents_last_year')->default(false);
            $table->timestamps(); // Добавлено
        });

        // 8. Тарифы
        Schema::create('tariffs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('policy_type_id')->constrained('policy_types');
            $table->string('vehicle_category', 10);
            $table->decimal('base_rate', 10, 2);
            $table->decimal('min_rate', 10, 2);
            $table->decimal('max_rate', 10, 2);
            $table->decimal('power_coefficient', 5, 4)->default(1.0);
            $table->decimal('experience_coefficient', 5, 4)->default(1.0);
            $table->decimal('age_coefficient', 5, 4)->default(1.0);
            $table->decimal('bonus_malus_coefficient', 5, 4)->default(1.0);
            $table->decimal('region_coefficient', 5, 4)->default(1.0);
            $table->decimal('vehicle_age_coefficient', 5, 4)->default(1.0);
            $table->decimal('security_coefficient', 5, 4)->default(1.0);
            $table->decimal('franchise_coefficient', 5, 4)->default(1.0);
            $table->string('calculation_method', 50);
            
            $table->foreign('vehicle_category')->references('code')->on('vehicle_categories');
            $table->timestamps(); // Добавлено
        });

        // 9. Транспортные средства
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->nullable()->constrained('client_profiles');
            $table->string('state_number', 15)->unique();
            $table->string('brand', 30)->nullable();
            $table->string('model', 30)->nullable();
            $table->year('manufacture_year')->nullable();
            $table->integer('power_hp')->nullable();
            $table->string('category', 10)->nullable();
            $table->string('vin', 17)->unique();
            $table->decimal('engine_volume', 4, 1)->nullable();
            $table->decimal('purchase_price', 12, 2)->nullable();
            $table->integer('mileage')->default(0);
            $table->boolean('has_tracker')->default(false);
            $table->enum('parking_type', ['garage', 'street', 'parking_lot', 'other'])->nullable();
            
            $table->foreign('category')->references('code')->on('vehicle_categories');
            $table->timestamps(); // Добавлено
        });

        // 10. Полисы
        Schema::create('policies', function (Blueprint $table) {
            $table->id();
            $table->string('policy_number', 20)->unique();
            $table->foreignId('policy_type_id')->constrained('policy_types');
            $table->foreignId('client_id')->constrained('client_profiles');
            $table->foreignId('vehicle_id')->constrained('vehicles');
            $table->foreignId('tariff_id')->constrained('tariffs');
            
            // Цены
            $table->decimal('base_price', 12, 2);
            $table->decimal('final_price', 12, 2);
            $table->decimal('discount_amount', 10, 2)->default(0.00);
            
            // Период действия
            $table->date('start_date');
            $table->date('end_date');
            
            // Статус
            $table->enum('status', ['draft', 'active', 'expired', 'cancelled'])->default('draft');
            
            // Для КАСКО
            $table->decimal('franchise_amount', 10, 2)->default(0.00);
            $table->decimal('coverage_amount', 12, 2)->nullable();
            
            // Индексы
            $table->index('status');
            $table->index('client_id');
            $table->timestamps(); // Изменено: вместо timestamp('created_at')
        });

        // 11. Страховые случаи
        Schema::create('accidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('client_profiles');
            $table->foreignId('policy_id')->constrained('policies');
            $table->date('accident_date');
            $table->decimal('damage_amount', 10, 2)->nullable();
            $table->boolean('is_client_fault')->nullable();
            $table->text('description')->nullable();
            
            // Индексы
            $table->index('client_id');
            $table->index('policy_id');
            $table->timestamps(); // Добавлено
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accidents');
        Schema::dropIfExists('policies');
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('tariffs');
        Schema::dropIfExists('client_profiles');
        Schema::dropIfExists('vehicle_categories');
        Schema::dropIfExists('policy_types');
        Schema::dropIfExists('users');
        Schema::dropIfExists('document_types');
        Schema::dropIfExists('locations');
        Schema::dropIfExists('user_types');
    }
};