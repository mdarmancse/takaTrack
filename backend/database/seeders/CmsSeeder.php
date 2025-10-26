<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class CmsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // CMS Permissions
            'cms.pages.view',
            'cms.pages.create',
            'cms.pages.edit',
            'cms.pages.delete',
            'cms.pages.publish',
            
            'cms.posts.view',
            'cms.posts.create',
            'cms.posts.edit',
            'cms.posts.delete',
            'cms.posts.publish',
            
            'cms.media.view',
            'cms.media.upload',
            'cms.media.edit',
            'cms.media.delete',
            
            'cms.roles.view',
            'cms.roles.create',
            'cms.roles.edit',
            'cms.roles.delete',
            'cms.roles.assign',
            
            'cms.users.view',
            'cms.users.create',
            'cms.users.edit',
            'cms.users.delete',
            
            'cms.settings.view',
            'cms.settings.edit',
            
            // Finance Permissions
            'finance.transactions.view',
            'finance.transactions.create',
            'finance.transactions.edit',
            'finance.transactions.delete',
            
            'finance.categories.view',
            'finance.categories.create',
            'finance.categories.edit',
            'finance.categories.delete',
            
            'finance.accounts.view',
            'finance.accounts.create',
            'finance.accounts.edit',
            'finance.accounts.delete',
            
            'finance.budgets.view',
            'finance.budgets.create',
            'finance.budgets.edit',
            'finance.budgets.delete',
            
            'finance.goals.view',
            'finance.goals.create',
            'finance.goals.edit',
            'finance.goals.delete',
            
            'finance.reports.view',
            'finance.reports.export',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin']);
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $editor = Role::firstOrCreate(['name' => 'editor']);
        $author = Role::firstOrCreate(['name' => 'author']);
        $viewer = Role::firstOrCreate(['name' => 'viewer']);
        $user = Role::firstOrCreate(['name' => 'user']);

        // Assign permissions to roles
        $superAdmin->givePermissionTo(Permission::all());

        $admin->givePermissionTo([
            'cms.pages.view', 'cms.pages.create', 'cms.pages.edit', 'cms.pages.delete', 'cms.pages.publish',
            'cms.posts.view', 'cms.posts.create', 'cms.posts.edit', 'cms.posts.delete', 'cms.posts.publish',
            'cms.media.view', 'cms.media.upload', 'cms.media.edit', 'cms.media.delete',
            'cms.users.view', 'cms.users.create', 'cms.users.edit', 'cms.users.delete',
            'cms.settings.view', 'cms.settings.edit',
            'finance.transactions.view', 'finance.transactions.create', 'finance.transactions.edit', 'finance.transactions.delete',
            'finance.categories.view', 'finance.categories.create', 'finance.categories.edit', 'finance.categories.delete',
            'finance.accounts.view', 'finance.accounts.create', 'finance.accounts.edit', 'finance.accounts.delete',
            'finance.budgets.view', 'finance.budgets.create', 'finance.budgets.edit', 'finance.budgets.delete',
            'finance.goals.view', 'finance.goals.create', 'finance.goals.edit', 'finance.goals.delete',
            'finance.reports.view', 'finance.reports.export',
        ]);

        $editor->givePermissionTo([
            'cms.pages.view', 'cms.pages.create', 'cms.pages.edit', 'cms.pages.publish',
            'cms.posts.view', 'cms.posts.create', 'cms.posts.edit', 'cms.posts.publish',
            'cms.media.view', 'cms.media.upload', 'cms.media.edit',
            'finance.transactions.view', 'finance.transactions.create', 'finance.transactions.edit',
            'finance.categories.view', 'finance.categories.create', 'finance.categories.edit',
            'finance.accounts.view', 'finance.accounts.create', 'finance.accounts.edit',
            'finance.budgets.view', 'finance.budgets.create', 'finance.budgets.edit',
            'finance.goals.view', 'finance.goals.create', 'finance.goals.edit',
            'finance.reports.view',
        ]);

        $author->givePermissionTo([
            'cms.pages.view', 'cms.pages.create', 'cms.pages.edit',
            'cms.posts.view', 'cms.posts.create', 'cms.posts.edit',
            'cms.media.view', 'cms.media.upload',
            'finance.transactions.view', 'finance.transactions.create', 'finance.transactions.edit',
            'finance.categories.view', 'finance.categories.create', 'finance.categories.edit',
            'finance.accounts.view', 'finance.accounts.create', 'finance.accounts.edit',
            'finance.budgets.view', 'finance.budgets.create', 'finance.budgets.edit',
            'finance.goals.view', 'finance.goals.create', 'finance.goals.edit',
        ]);

        $viewer->givePermissionTo([
            'cms.pages.view',
            'cms.posts.view',
            'cms.media.view',
            'finance.transactions.view',
            'finance.categories.view',
            'finance.accounts.view',
            'finance.budgets.view',
            'finance.goals.view',
            'finance.reports.view',
        ]);

        $user->givePermissionTo([
            'finance.transactions.view', 'finance.transactions.create', 'finance.transactions.edit',
            'finance.categories.view', 'finance.categories.create', 'finance.categories.edit',
            'finance.accounts.view', 'finance.accounts.create', 'finance.accounts.edit',
            'finance.budgets.view', 'finance.budgets.create', 'finance.budgets.edit',
            'finance.goals.view', 'finance.goals.create', 'finance.goals.edit',
        ]);

        // Create super admin user if it doesn't exist
        $superAdminUser = User::firstOrCreate(
            ['email' => 'admin@takatrack.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('password'),
            ]
        );

        $superAdminUser->assignRole('super-admin');

        // Create admin user if it doesn't exist
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
            ]
        );

        $adminUser->assignRole('admin');
    }
}