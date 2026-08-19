<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Update user role enum:
     * - Admin → Superadmin
     * - Tim LPPM → Staff LPPM
     * - Add Ketua LPPM
     */
    public function up(): void
    {
        // Step 1: Widen enum to accept both old and new values
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('Admin','Tim LPPM','Superadmin','Staff LPPM','Ketua LPPM','Dosen','Reviewer','Rektorat') NOT NULL");

        // Step 2: Migrate existing data
        DB::table('users')->where('role', 'Admin')->update(['role' => 'Superadmin']);
        DB::table('users')->where('role', 'Tim LPPM')->update(['role' => 'Staff LPPM']);

        // Step 3: Narrow enum to final values only
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('Superadmin','Staff LPPM','Ketua LPPM','Dosen','Reviewer','Rektorat') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Widen enum
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('Admin','Tim LPPM','Superadmin','Staff LPPM','Ketua LPPM','Dosen','Reviewer','Rektorat') NOT NULL");

        // Migrate data back
        DB::table('users')->where('role', 'Superadmin')->update(['role' => 'Admin']);
        DB::table('users')->where('role', 'Staff LPPM')->update(['role' => 'Tim LPPM']);
        DB::table('users')->where('role', 'Ketua LPPM')->update(['role' => 'Admin']);

        // Restore original enum
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('Admin','Tim LPPM','Rektorat','Dosen','Reviewer') NOT NULL");
    }
};
