import { supabase } from './lib/supabase.js';
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
      await supabase.from('ExpenseCategory').upsert(
        { name, isDefault: true },
        { onConflict: 'name' }
      );
    }

    // 2. Seed Default Super Admin Account if configured
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@spendly.io';
    const adminPassword = process.env.ADMIN_PASSWORD || 'SuperAdminPassword123!';

    // Check if Super Admin user exists
    const { data: existingUser } = await supabase
      .from('User')
      .select('*')
      .eq('email', adminEmail)
      .maybeSingle();

    if (!existingUser) {
      console.log(`[Seed] Creating default Super Admin (${adminEmail})...`);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: { fullName: 'Spendly Super Admin', role: 'SUPER_ADMIN' }
        }
      });

      const adminId = authData?.user?.id || `admin_super_1`;

      if (!authError || authData?.user) {
        await supabase.from('User').upsert({
          id: adminId,
          email: adminEmail,
          fullName: 'Spendly Super Admin',
          role: 'SUPER_ADMIN'
        });

        // Create default workspace if none exists
        const { data: ws } = await supabase
          .from('Workspace')
          .upsert({
            name: 'Spendly Main Workspace',
            code: 'SPENDLY_HOSTEL'
          }, { onConflict: 'code' })
          .select()
          .single();

        if (ws) {
          await supabase.from('WorkspaceMember').upsert({
            workspaceId: ws.id,
            userId: adminId,
            role: 'SUPER_ADMIN'
          });

          await supabase.from('MealPrice').insert({
            workspaceId: ws.id,
            halfPrice: 40,
            fullPrice: 60
          });
        }

        console.log('[Seed] Super Admin created successfully!');
      }
    } else {
      console.log('[Seed] Super Admin account verified.');
    }
  } catch (err: any) {
    console.error('[Seed Error]:', err.message);
  }
}
