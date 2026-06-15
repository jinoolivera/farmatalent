<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompanyRequest;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing('roles');

        $companies = $user->hasRole('super-admin')
            ? Company::query()->latest()->paginate(20)
            : $user->companies()->latest('companies.created_at')->paginate(20);

        return response()->json(
            CompanyResource::collection($companies)->response()->getData(true)
        );
    }

    public function store(CompanyRequest $request): CompanyResource
    {
        $data = $request->validated();

        $company = Company::create($data + ['status' => 'active']);
        $ownerRole = Role::where('slug', 'company-owner')->first();

        $company->users()->attach($request->user()->id, [
            'role_id' => $ownerRole?->id,
            'status' => 'active',
            'joined_at' => now(),
        ]);

        return CompanyResource::make($company->loadCount(['users', 'shiftRequests']));
    }

    public function show(Request $request, Company $company): CompanyResource
    {
        $this->authorizeCompanyAccess($request, $company);

        return CompanyResource::make($company->loadCount(['users', 'shiftRequests']));
    }

    public function update(CompanyRequest $request, Company $company): CompanyResource
    {
        $this->authorizeCompanyAccess($request, $company);

        $company->update($request->validated());

        return CompanyResource::make($company->fresh()->loadCount(['users', 'shiftRequests']));
    }

    private function authorizeCompanyAccess(Request $request, Company $company): void
    {
        $user = $request->user()->loadMissing('roles');

        abort_unless(
            $user->hasRole('super-admin') || $user->companies()->whereKey($company->id)->exists(),
            403,
            'No tienes acceso a esta empresa.'
        );
    }
}
