import { supabaseAdmin } from './lib/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

export async function seedDatabase() {
  try {
    console.log('[Seed] Verifying database seed state...');

    // 1. Seed Default Expense Categories
    const categories = [
      'Food', 'Tea', 'Snacks', 'Grocery',
      'Laundry', 'Travel', 'Medical', 'Shopping', 'Other'
    ];

    for (const name of categories) {
      await supabaseAdmin.from('ExpenseCategory').upsert(
        { name, isDefault: true },
        { onConflict: 'name' }
      );
    }

    // 2. Seed Default Super Admin Account if configured
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@spendly.io';
    const adminPassword = process.env.ADMIN_PASSWORD || 'SuperAdminPassword123!';

    console.log(`[Seed] Verifying Super Admin account in Supabase Auth (${adminEmail})...`);

    // Fetch existing users from Supabase Auth admin API
    const { data: authUsersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    let adminId: string | null = null;

    if (!listError && authUsersData?.users) {
      const existingAuthUser = authUsersData.users.find(u => u.email?.toLowerCase() === adminEmail.toLowerCase());
      if (existingAuthUser) {
        adminId = existingAuthUser.id;
        console.log(`[Seed] Found existing Auth user for ${adminEmail} (ID: ${adminId}). Confirming email and updating password...`);
        
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(adminId, {
          email_confirm: true,
          password: adminPassword,
          user_metadata: { fullName: 'Spendly Super Admin', role: 'SUPER_ADMIN' }
        });

        if (updateError) {
          console.error('[Seed Error] Failed to confirm existing admin user:', updateError.message);
        } else {
          console.log('[Seed] Successfully confirmed admin email and updated credentials in Supabase Auth.');
        }
      }
    }

    // If no existing Auth user was found, create one
    if (!adminId) {
      console.log(`[Seed] Creating new confirmed Super Admin user in Supabase Auth (${adminEmail})...`);
      const { data: newAuthData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { fullName: 'Spendly Super Admin', role: 'SUPER_ADMIN' }
      });

      if (createError || !newAuthData.user) {
        console.error('[Seed Error] Failed to create Super Admin in Supabase Auth:', createError?.message);
      } else {
        adminId = newAuthData.user.id;
        console.log(`[Seed] Successfully created confirmed Super Admin in Supabase Auth (ID: ${adminId}).`);
      }
    }

    // Upsert into application's User table and WorkspaceMember table
    if (adminId) {
      // 1. App User record
      const { error: userTableError } = await supabaseAdmin.from('User').upsert({
        id: adminId,
        email: adminEmail,
        fullName: 'Spendly Super Admin',
        role: 'SUPER_ADMIN'
      }, { onConflict: 'id' });

      if (userTableError) {
        console.error('[Seed Error] User table upsert error:', userTableError.message);
      }

      // 2. Default Workspace
      let { data: ws } = await supabaseAdmin
        .from('Workspace')
        .select('*')
        .eq('code', 'SPENDLY_HOSTEL')
        .maybeSingle();

      if (!ws) {
        const { data: newWs } = await supabaseAdmin
          .from('Workspace')
          .insert([{ name: 'Spendly Main Workspace', code: 'SPENDLY_HOSTEL' }])
          .select()
          .single();
        ws = newWs;
      }

      if (ws) {
        // WorkspaceMember record
        await supabaseAdmin.from('WorkspaceMember').upsert({
          workspaceId: ws.id,
          userId: adminId,
          role: 'SUPER_ADMIN'
        }, { onConflict: 'workspaceId,userId' });

        // Default MealPrice record if none exists
        const { data: existingPrice } = await supabaseAdmin
          .from('MealPrice')
          .select('*')
          .eq('workspaceId', ws.id)
          .maybeSingle();

        if (!existingPrice) {
          await supabaseAdmin.from('MealPrice').insert({
            workspaceId: ws.id,
            halfPrice: 40,
            fullPrice: 60
          });
        }
      }

      console.log(`[Seed] Super Admin (${adminEmail}) fully verified, confirmed, and synced!`);
    }
  } catch (err: any) {
    console.error('[Seed Error]:', err.message);
  }
}
