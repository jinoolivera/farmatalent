<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\User;

class CompanyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->status === 'active';
    }

    public function view(User $user, Company $company): bool
    {
        return $user->hasRole('super-admin')
            || $user->companies()->whereKey($company->id)->exists();
    }

    public function update(User $user, Company $company): bool
    {
        return $user->hasRole('super-admin')
            || $user->hasCompanyRole($company->id, 'company-owner')
            || $user->hasCompanyRole($company->id, 'company-admin');
    }
}
