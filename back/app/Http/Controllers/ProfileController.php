<?php

namespace App\Http\Controllers;

use App\Models\ClientProfile;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    // Показать профиль
    public function show(Request $request)
    {
        $user = $request->user();
        $profile = $user->clientProfile()->with(['location', 'documentType'])->first();
        
        return response()->json([
            'user' => $user,
            'profile' => $profile
        ]);
    }

    // Обновить профиль
    public function update(Request $request)
    {
        $user = $request->user();
        $profile = $user->clientProfile;

        $request->validate([
            'last_name' => 'sometimes|string|max:30',
            'first_name' => 'sometimes|string|max:30',
            'middle_name' => 'nullable|string|max:30',
            'birth_date' => 'nullable|date',
            'location_id' => 'nullable|exists:locations,id',
            'document_type_id' => 'nullable|exists:document_types,id',
            'passport_series' => 'nullable|string|max:10',
            'passport_number' => 'nullable|string|max:20',
            'passport_issued_by' => 'nullable|string|max:100',
            'passport_issue_date' => 'nullable|date',
            'passport_expiry_date' => 'nullable|date',
            'driver_license_series' => 'nullable|string|max:10',
            'driver_license_number' => 'nullable|string|max:20',
            'driver_license_issued_by' => 'nullable|string|max:100',
            'driver_license_issue_date' => 'nullable|date',
            'driver_license_expiry_date' => 'nullable|date',
            'driver_categories' => 'nullable|string|max:50',
            'driver_experience_years' => 'nullable|integer|min:0',
            'bonus_malus_class' => 'nullable|string|max:10',
            'has_accidents_last_year' => 'nullable|boolean',
        ]);

        if ($profile) {
            $profile->update($request->all());
        } else {
            $profile = ClientProfile::create(array_merge(
                $request->all(),
                ['user_id' => $user->id]
            ));
        }

        // Обновляем данные пользователя если нужно
        if ($request->has('email')) {
            $user->update(['email' => $request->email]);
        }
        
        if ($request->has('phone')) {
            $user->update(['phone' => $request->phone]);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'profile' => $profile->load(['location', 'documentType'])
        ]);
    }
}