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
        $repairers = [
            [
                'name' => 'Juan Dela Cruz',
                'email' => 'juan@fixora.com',
                'category' => 'Electronics',
                'bio' => 'Experienced electronics repairer specializing in TVs, speakers, and other electronic devices.',
                'years_experience' => 8,
                'location' => 'Cebu City',
                'price' => 500,
                'phone' => '09171234567',
                'photo_url' => null,
            ],
            [
                'name' => 'Mark Santos',
                'email' => 'mark@fixora.com',
                'category' => 'Computer',
                'bio' => 'Computer repair specialist handling laptops, desktops, software, and hardware problems.',
                'years_experience' => 6,
                'location' => 'Mandaue City',
                'price' => 400,
                'phone' => '09181234567',
                'photo_url' => null,
            ],
            [
                'name' => 'Carlo Reyes',
                'email' => 'carlo@fixora.com',
                'category' => 'Electrical',
                'bio' => 'Professional electrical repairer for residential and small business electrical concerns.',
                'years_experience' => 10,
                'location' => 'Lapu-Lapu City',
                'price' => 600,
                'phone' => '09191234567',
                'photo_url' => null,
            ],
            [
                'name' => 'Miguel Garcia',
                'email' => 'miguel@fixora.com',
                'category' => 'Motorcycle',
                'bio' => 'Motorcycle repair specialist with experience in maintenance, troubleshooting, and repairs.',
                'years_experience' => 7,
                'location' => 'Talisay City',
                'price' => 450,
                'phone' => '09201234567',
                'photo_url' => null,
            ],
            [
                'name' => 'Pedro Ramos',
                'email' => 'pedro@fixora.com',
                'category' => 'Plumbing',
                'bio' => 'Reliable plumbing repairer for leaks, pipe problems, fixtures, and general plumbing work.',
                'years_experience' => 9,
                'location' => 'Cebu City',
                'price' => 550,
                'phone' => '09211234567',
                'photo_url' => null,
            ],
        ];

        foreach ($repairers as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password123'),
                    'role' => 'repairer',
                    'verification_status' => 'verified',
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