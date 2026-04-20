<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ClientProfile;
use App\Models\UserType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        
        $query = User::whereHas('userType', function($q) {
            $q->where('name', 'client');
        })->with(['clientProfile', 'clientProfile.driverCategories']);
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhereHas('clientProfile', function($sub) use ($search) {
                      $sub->where('last_name', 'like', "%{$search}%")
                          ->orWhere('first_name', 'like', "%{$search}%");
                  });
            });
        }
        
        $clients = $query->paginate($perPage);
        
        return response()->json($clients);
    }

    public function show($id)
    {
        $client = User::whereHas('userType', function($q) {
            $q->where('name', 'client');
        })->with(['clientProfile', 'clientProfile.driverCategories', 'vehicles'])->findOrFail($id);
        
        return response()->json($client);
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users',
            'phone' => 'required|string|unique:users',
            'password' => 'required|min:6',
            'last_name' => 'required|string|max:30',
            'first_name' => 'required|string|max:30',
            'middle_name' => 'nullable|string|max:30',
            'birth_date' => 'nullable|date',
        ]);

        $clientType = UserType::where('name', 'client')->first();

        $user = User::create([
            'email' => $request->email,
            'phone' => $request->phone,
            'password_hash' => Hash::make($request->password),
            'user_type_id' => $clientType->id,
        ]);

        $clientProfile = ClientProfile::create([
            'user_id' => $user->id,
            'last_name' => $request->last_name,
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'birth_date' => $request->birth_date,
        ]);

        return response()->json([
            'message' => 'Client created successfully',
            'client' => $user->load(['clientProfile', 'clientProfile.driverCategories'])
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $client = User::findOrFail($id);
        
        $request->validate([
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'phone' => 'sometimes|string|unique:users,phone,' . $id,
            'last_name' => 'sometimes|string|max:30',
            'first_name' => 'sometimes|string|max:30',
            'middle_name' => 'nullable|string|max:30',
            'birth_date' => 'nullable|date',
        ]);

        $client->update($request->only(['email', 'phone']));

        if ($client->clientProfile) {
            $client->clientProfile->update($request->only([
                'last_name', 'first_name', 'middle_name', 'birth_date'
            ]));
        }

        return response()->json([
            'message' => 'Client updated successfully',
            'client' => $client->load(['clientProfile', 'clientProfile.driverCategories'])
        ]);
    }

    public function destroy($id)
    {
        $client = User::findOrFail($id);
        
        if ($client->userType->name !== 'client') {
            return response()->json(['message' => 'User is not a client'], 422);
        }
        
        $profile = $client->clientProfile;
        
        if ($profile) {
            if ($profile->policies()->where('status', 'active')->exists()) {
                return response()->json(['message' => 'Cannot delete client with active policies'], 422);
            }
            
            if ($profile->accidents()->exists()) {
                return response()->json(['message' => 'Cannot delete client with accident history'], 422);
            }
            
            $profile->driverCategories()->detach();
            $profile->vehicles()->delete();
            $profile->policies()->delete();
            $profile->accidents()->delete();
            $profile->delete();
        }
        
        $client->delete();
        
        return response()->json(['message' => 'Client deleted successfully']);
    }
}