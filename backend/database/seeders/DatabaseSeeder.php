<?php

namespace Database\Seeders;

use App\Models\RepairerProfile;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Remove old test repairer
        |--------------------------------------------------------------------------
        */

        User::updateOrCreate(
            ['email' => 'admin@fixora.com'],
            [
                'name' => 'Fixora Administrator',
                'password' => Hash::make('Admin123!'),
                'role' => 'admin',
                'verification_status' => 'verified',
                'phone' => null,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Customer Test Account
        |--------------------------------------------------------------------------
        */

        User::updateOrCreate(
            ['email' => 'customer@fixora.com'],
            [
                'name' => 'Test Customer',
                'password' => Hash::make('Customer123!'),
                'role' => 'customer',
                'verification_status' => 'verified',
                'phone' => '09170000000',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Featured Repairers
        |--------------------------------------------------------------------------
        */

        $repairers = [
            [
                'name' => 'Alex Reyes',
                'email' => 'repairer1@fixora.com',
                'category' => 'Computer',
                'bio' => 'Computer and laptop repair specialist.',
                'years_experience' => 6,
                'location' => 'Cebu City',
                'price' => 500,
                'phone' => '09170000001',
                'verification_status' => 'verified',
                'photo_url' => 'https://res.cloudinary.com/uuxfnqxo/image/upload/v1793344214/fixora/repairers/urvqv1bhkqdhevmoekor.webp',
            ],
            [
                'name' => 'Brian Santos',
                'email' => 'repairer2@fixora.com',
                'category' => 'Electrical',
                'bio' => 'Experienced electrical repair specialist.',
                'years_experience' => 8,
                'location' => 'Mandaue City',
                'price' => 600,
                'phone' => '09170000002',
                'verification_status' => 'verified',
                'photo_url' => null,
            ],
            [
                'name' => 'Edward Sugarol',
                'email' => 'edgar@gmail.com',
                'category' => 'Electronics',
                'bio' => 'Magaling to promise.',
                'years_experience' => 5,
                'location' => 'Talisay Cebu',
                'price' => 500,
                'phone' => '09080704051',
                'verification_status' => 'verified',
                'photo_url' => null,
            ],
        ];

        foreach ($repairers as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('Repairer123!'),
                    'role' => 'repairer',
                    'verification_status' => $data['verification_status'],
                    'phone' => $data['phone'],
                ]
            );

            RepairerProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'category' => $data['category'],
                    'bio' => $data['bio'],
                    'years_experience' => $data['years_experience'],
                    'location' => $data['location'],
                    'price' => $data['price'],
                    'phone' => $data['phone'],
                    'photo_url' => $data['photo_url'],
                    'available' => true,
                ]
            );
        }
    }
}
