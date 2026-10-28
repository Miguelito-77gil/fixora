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
        | Remove temporary repairer test accounts
        |--------------------------------------------------------------------------
        */

        $temporaryEmails = [
            'juan@fixora.com',
            'mark@fixora.com',
            'carlo@fixora.com',
            'miguel@fixora.com',
            'pedro@fixora.com',
        ];

        $temporaryUsers = User::whereIn('email', $temporaryEmails)->get();

        foreach ($temporaryUsers as $user) {
            RepairerProfile::where('user_id', $user->id)->delete();
            $user->tokens()->delete();
            $user->delete();
        }

        /*
        |--------------------------------------------------------------------------
        | Admin Account
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
        | Test Repairers
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
            ],
            [
                'name' => 'Chris Garcia',
                'email' => 'repairer3@fixora.com',
                'category' => 'Plumbing',
                'bio' => 'Plumbing specialist currently awaiting verification.',
                'years_experience' => 4,
                'location' => 'Lapu-Lapu City',
                'price' => 450,
                'phone' => '09170000003',
                'verification_status' => 'pending',
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
                    'photo_url' => null,
                    'available' => true,
                ]
            );
        }
    }
}