<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChatMessageResource;
use App\Models\ChatMessage;
use App\Models\ShiftApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatMessageController extends Controller
{
    public function index(Request $request, ShiftApplication $shiftApplication): JsonResponse
    {
        $this->authorizeAccess($request, $shiftApplication);

        $messages = $shiftApplication->chatMessages()
            ->with('sender')
            ->latest()
            ->limit(100)
            ->get()
            ->sortBy('created_at')
            ->values();

        return response()->json([
            'data' => ChatMessageResource::collection($messages),
        ]);
    }

    public function store(Request $request, ShiftApplication $shiftApplication): ChatMessageResource
    {
        $user = $this->authorizeAccess($request, $shiftApplication);

        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $message = ChatMessage::create([
            'shift_application_id' => $shiftApplication->id,
            'sender_user_id' => $user->id,
            'message' => trim($data['message']),
        ]);

        return ChatMessageResource::make($message->load('sender'));
    }

    private function authorizeAccess(Request $request, ShiftApplication $shiftApplication)
    {
        abort_unless(
            $shiftApplication->status === 'accepted',
            403,
            'El chat operativo solo esta disponible para matches confirmados.'
        );

        $user = $request->user()->loadMissing('roles');
        $isOwner = $shiftApplication->user_id === $user->id;
        $isCompanyMember = $user->hasRole('super-admin')
            || $user->companies()->whereKey($shiftApplication->shiftRequest->company_id)->exists();

        abort_unless($isOwner || $isCompanyMember, 403, 'No tienes acceso a este chat.');

        return $user;
    }
}
