<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WorkerMetricRequest;
use App\Http\Resources\WorkerMetricResource;
use App\Models\User;
use App\Models\WorkerMetric;
use Illuminate\Http\Request;

class WorkerMetricController extends Controller
{
    public function mine(Request $request): WorkerMetricResource
    {
        return WorkerMetricResource::make(
            WorkerMetric::firstOrCreate(['user_id' => $request->user()->id])
        );
    }

    public function show(User $user): WorkerMetricResource
    {
        return WorkerMetricResource::make(
            WorkerMetric::firstOrCreate(['user_id' => $user->id])
        );
    }

    public function update(WorkerMetricRequest $request, User $user): WorkerMetricResource
    {
        $actor = $request->user()->loadMissing('roles');

        abort_unless($actor->hasRole('super-admin'), 403, 'Solo plataforma puede editar metricas por ahora.');

        $metric = WorkerMetric::updateOrCreate(
            ['user_id' => $user->id],
            $request->validated()
        );

        return WorkerMetricResource::make($metric);
    }
}
