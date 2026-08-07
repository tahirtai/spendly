import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { supabase, supabaseAdmin } from '../lib/supabase.js';
import {
  RegisterSchema,
  LoginSchema,
  RecordMealSchema,
  CreateExpenseSchema,
  UpdateExpenseSchema,
  SubmitPaymentSchema,
  VerifyPaymentSchema,
  UpdateMealPricesSchema,
  UpdateMemberRoleSchema,
  MonthLockSchema,
  UpdateProfileSchema,
} from 'spendly-shared';

const router = Router();

// ─── Multer: In-memory storage for file uploads ───────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPEG, and WEBP images are allowed.'));
    }
  },
});

// ─── Zod Validation Helper ────────────────────────────────────────────────────
function validate(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}

// ─── JWT Auth Middleware ──────────────────────────────────────────────────────
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authentication token.' });
  }

  const token = authHeader.substring(7);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  (req as any).authUser = data.user;
  next();
}

// ─── Helper: Get or Create Default Workspace ─────────────────────────────────
async function getOrCreateWorkspace() {
  let { data: ws } = await supabaseAdmin
    .from('Workspace')
    .select('*')
    .eq('code', 'SPENDLY_HOSTEL')
    .maybeSingle();

  if (!ws) {
    const { data: newWs, error } = await supabaseAdmin
      .from('Workspace')
      .insert([{ name: 'Spendly Main Workspace', code: 'SPENDLY_HOSTEL' }])
      .select()
      .single();

    if (error || !newWs) throw new Error('Failed to create workspace: ' + error?.message);
    ws = newWs;

    // Seed default meal prices
    await supabaseAdmin.from('MealPrice').insert([{
      workspaceId: ws.id,
      halfPrice: 40,
      fullPrice: 60
    }]);
  }
  return ws;
}

// ─── Helper: Get User's Workspace ────────────────────────────────────────────
async function getUserWorkspace(userId: string) {
  const { data } = await supabaseAdmin
    .from('WorkspaceMember')
    .select('workspace:Workspace(*)')
    .eq('userId', userId)
    .maybeSingle();
  return (data?.workspace as any) || null;
}

// ─── AUTH ENDPOINTS ───────────────────────────────────────────────────────────

// POST /api/auth/register
router.post('/auth/register', validate(RegisterSchema), async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Check if email already registered in our DB
    const { data: existing } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for hostel use case
      user_metadata: { fullName, role: 'STUDENT' }
    });

    if (authError || !authData.user) {
      return res.status(400).json({ error: authError?.message || 'Registration failed.' });
    }

    const userId = authData.user.id;

    // Insert user record
    const { error: userError } = await supabaseAdmin.from('User').insert([{
      id: userId,
      email,
      fullName,
      phone: phone || null,
      role: 'STUDENT'
    }]);

    if (userError) {
      console.error('[Register] User insert failed:', userError.message);
    }

    // Add to default workspace
    const ws = await getOrCreateWorkspace();
    if (ws) {
      await supabaseAdmin.from('WorkspaceMember').upsert([{
        workspaceId: ws.id,
        userId,
        role: 'STUDENT'
      }], { onConflict: 'workspaceId,userId' });
    }

    return res.json({
      success: true,
      message: 'Account created successfully. Please sign in.'
    });
  } catch (err: any) {
    console.error('[Register Error]:', err.message);
    return res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/auth/login', validate(LoginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !authData.user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userId = authData.user.id;

    // Fetch DB user record
    let { data: dbUser } = await supabaseAdmin.from('User').select('*').eq('id', userId).maybeSingle();

    // Fallback: create user record if missing (e.g., admin seeded via Supabase dashboard)
    if (!dbUser) {
      const { data: inserted } = await supabaseAdmin.from('User').upsert([{
        id: userId,
        email,
        fullName: authData.user.user_metadata?.fullName || email.split('@')[0],
        role: authData.user.user_metadata?.role || 'STUDENT'
      }], { onConflict: 'id' }).select().single();
      dbUser = inserted;
    }

    if (!dbUser) {
      return res.status(500).json({ error: 'User profile not found.' });
    }

    // Get workspace
    const ws = await getOrCreateWorkspace();
    // Ensure user is in workspace
    if (ws) {
      await supabaseAdmin.from('WorkspaceMember').upsert([{
        workspaceId: ws.id,
        userId,
        role: dbUser.role
      }], { onConflict: 'workspaceId,userId' });
    }

    return res.json({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.fullName,
        phone: dbUser.phone,
        avatarUrl: dbUser.avatarUrl,
        role: dbUser.role,
        workspaceId: ws?.id || null,
        workspaceName: ws?.name || null,
      },
      session: authData.session,
      accessToken: authData.session?.access_token || null,
    });
  } catch (err: any) {
    console.error('[Login Error]:', err.message);
    return res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// GET /api/workspaces/mine
router.get('/workspaces/mine', requireAuth, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const ws = await getUserWorkspace(authUser.id);
    if (!ws) {
      return res.status(404).json({ error: 'No workspace found for this user.' });
    }
    return res.json({ workspace: ws });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/user/profile
router.get('/user/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const { data: user } = await supabaseAdmin.from('User').select('*').eq('id', authUser.id).single();
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const ws = await getUserWorkspace(authUser.id);
    return res.json({
      user: {
        ...user,
        workspaceId: ws?.id || null,
        workspaceName: ws?.name || null,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/user/profile
router.patch('/user/profile', requireAuth, validate(UpdateProfileSchema), async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const updates: any = {};
    if (req.body.fullName !== undefined) updates.fullName = req.body.fullName;
    if (req.body.phone !== undefined) updates.phone = req.body.phone;
    if (req.body.avatarUrl !== undefined) updates.avatarUrl = req.body.avatarUrl;

    const { data, error } = await supabaseAdmin
      .from('User')
      .update(updates)
      .eq('id', authUser.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, user: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

router.get('/dashboard/summary', requireAuth, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const userId = authUser.id;
    const currentMonth = new Date().toISOString().slice(0, 7);

    const [mealsRes, expensesRes, paymentsRes] = await Promise.all([
      supabaseAdmin.from('Meal').select('totalCost, date').eq('userId', userId),
      supabaseAdmin.from('Expense').select('amount, date').eq('userId', userId),
      supabaseAdmin.from('Payment').select('amount, status').eq('userId', userId).eq('status', 'APPROVED'),
    ]);

    const monthMeals = (mealsRes.data || []).filter(m => String(m.date).startsWith(currentMonth));
    const mealTotal = monthMeals.reduce((acc, m) => acc + (m.totalCost || 0), 0);
    const mealsCount = monthMeals.filter(m => m.totalCost > 0).length;

    const monthExpenses = (expensesRes.data || []).filter(e => String(e.date).startsWith(currentMonth));
    const expenseTotal = monthExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    const totalPayments = (paymentsRes.data || []).reduce((acc, p) => acc + (p.amount || 0), 0);

    const currentMonthTotal = mealTotal + expenseTotal;
    const remainingBalance = Math.max(0, currentMonthTotal - totalPayments);

    const todayNum = new Date().getDate();
    const recordedDays = new Set(monthMeals.map(m => {
      const d = new Date(m.date);
      return d.getUTCDate();
    }));
    let missingEntries = 0;
    for (let day = 1; day < todayNum; day++) {
      if (!recordedDays.has(day)) missingEntries++;
    }

    return res.json({
      currentMonthTotal,
      remainingBalance,
      mealsThisMonth: mealsCount,
      dailyExpenses: expenseTotal,
      totalPayments,
      missingEntries,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── MEALS ENDPOINTS ──────────────────────────────────────────────────────────

// GET /api/meals/today
router.get('/meals/today', requireAuth, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const userId = authUser.id;
    const today = new Date().toISOString().split('T')[0];

    const { data: meal } = await supabaseAdmin
      .from('Meal')
      .select('*')
      .eq('userId', userId)
      .eq('date', today)
      .maybeSingle();

    return res.json(meal || {
      date: today,
      lunch: 'SKIP',
      dinner: 'SKIP',
      lunchCost: 0,
      dinnerCost: 0,
      totalCost: 0,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/meals
router.post('/meals', requireAuth, validate(RecordMealSchema), async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const userId = authUser.id;
    const { date, lunch, dinner } = req.body;

    const ws = await getOrCreateWorkspace();

    // Get latest meal price
    const { data: priceObj } = await supabaseAdmin
      .from('MealPrice')
      .select('*')
      .eq('workspaceId', ws.id)
      .order('effectiveFrom', { ascending: false })
      .limit(1)
      .maybeSingle();

    const halfPrice = priceObj?.halfPrice ?? 40;
    const fullPrice = priceObj?.fullPrice ?? 60;

    const lunchCost = lunch === 'FULL' ? fullPrice : lunch === 'HALF' ? halfPrice : 0;
    const dinnerCost = dinner === 'FULL' ? fullPrice : dinner === 'HALF' ? halfPrice : 0;
    const totalCost = lunchCost + dinnerCost;

    const { data: updatedMeal, error } = await supabaseAdmin
      .from('Meal')
      .upsert([{
        workspaceId: ws.id,
        userId,
        date,
        lunch,
        dinner,
        lunchCost,
        dinnerCost,
        totalCost,
        updatedAt: new Date().toISOString(),
      }], { onConflict: 'workspaceId,userId,date' })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, meal: updatedMeal });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/meals/month
router.get('/meals/month', requireAuth, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const userId = authUser.id;
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

    const { data: meals } = await supabaseAdmin
      .from('Meal')
      .select('*')
      .eq('userId', userId)
      .like('date', `${month}%`);

    return res.json({ meals: meals || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/meals/missing
router.get('/meals/missing', requireAuth, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const userId = authUser.id;
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

    const { data: meals } = await supabaseAdmin
      .from('Meal')
      .select('date')
      .eq('userId', userId)
      .like('date', `${month}%`);

    const recordedDates = new Set((meals || []).map(m => m.date));
    const today = new Date();
    const year = parseInt(month.split('-')[0]);
    const monthNum = parseInt(month.split('-')[1]);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const currentDay = today.getFullYear() === year && today.getMonth() + 1 === monthNum
      ? today.getDate()
      : daysInMonth;

    const missing: string[] = [];
    for (let d = 1; d < currentDay; d++) {
      const dateStr = `${month}-${String(d).padStart(2, '0')}`;
      if (!recordedDates.has(dateStr)) missing.push(dateStr);
    }

    return res.json({ missing });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── EXPENSES ENDPOINTS ───────────────────────────────────────────────────────

// GET /api/expenses
router.get('/expenses', requireAuth, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const userId = authUser.id;
    const search = (req.query.search as string || '').toLowerCase();
    const category = (req.query.category as string) || 'ALL';
    const sortBy = (req.query.sortBy as string) || 'date_desc';
    const month = req.query.month as string;

    let query = supabaseAdmin.from('Expense').select('*').eq('userId', userId);
    if (month) query = query.like('date', `${month}%`);

    const { data: expenses, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    let list = expenses || [];

    if (category !== 'ALL') list = list.filter(e => e.category === category);
    if (search) list = list.filter(e =>
      (e.note || '').toLowerCase().includes(search) ||
      (e.category || '').toLowerCase().includes(search)
    );

    if (sortBy === 'amount_desc') list.sort((a, b) => b.amount - a.amount);
    else if (sortBy === 'amount_asc') list.sort((a, b) => a.amount - b.amount);
    else list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return res.json({ expenses: list });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses
router.post('/expenses', requireAuth, validate(CreateExpenseSchema), async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const userId = authUser.id;
    const { category, amount, note, date } = req.body;

    const ws = await getOrCreateWorkspace();

    const { data, error } = await supabaseAdmin
      .from('Expense')
      .insert([{ workspaceId: ws.id, userId, category, amount, note: note || null, date }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ success: true, expense: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/expenses/:id
router.put('/expenses/:id', requireAuth, validate(UpdateExpenseSchema), async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const { category, amount, note, date } = req.body;

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('Expense')
      .select('userId')
      .eq('id', req.params.id)
      .single();

    if (!existing || existing.userId !== authUser.id) {
      return res.status(403).json({ error: 'Access denied or expense not found.' });
    }

    const { data, error } = await supabaseAdmin
      .from('Expense')
      .update({ category, amount, note: note || null, date })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, expense: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/expenses/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('Expense')
      .select('userId')
      .eq('id', req.params.id)
      .single();

    if (!existing || existing.userId !== authUser.id) {
      return res.status(403).json({ error: 'Access denied or expense not found.' });
    }

    const { error } = await supabaseAdmin.from('Expense').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── PAYMENTS ENDPOINTS ───────────────────────────────────────────────────────

// GET /api/payments
router.get('/payments', requireAuth, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const { data: payments, error } = await supabaseAdmin
      .from('Payment')
      .select('*')
      .eq('userId', authUser.id)
      .order('createdAt', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ payments: payments || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/payments
router.post('/payments', requireAuth, validate(SubmitPaymentSchema), async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const { type, amount, note, date, screenshotPath } = req.body;
    const ws = await getOrCreateWorkspace();

    const { data, error } = await supabaseAdmin
      .from('Payment')
      .insert([{
        workspaceId: ws.id,
        userId: authUser.id,
        type,
        amount,
        note: note || null,
        date,
        screenshotPath: screenshotPath || null,
        status: 'PENDING',
      }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ success: true, payment: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/payments/:id
router.delete('/payments/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('Payment')
      .select('userId, status')
      .eq('id', req.params.id)
      .single();

    if (!existing || existing.userId !== authUser.id) {
      return res.status(403).json({ error: 'Access denied or payment not found.' });
    }
    if (existing.status === 'APPROVED') {
      return res.status(400).json({ error: 'Cannot delete an approved payment.' });
    }

    const { error } = await supabaseAdmin.from('Payment').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/upload-proof — Supabase Storage upload
router.post('/payments/upload-proof', requireAuth, upload.single('screenshot'), async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({ error: 'No screenshot file provided.' });
    }

    const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const filePath = `${authUser.id}/${Date.now()}.${ext}`;

    const { data, error } = await supabaseAdmin.storage
      .from('payment-proofs')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ success: true, path: data.path });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/:id/proof-url — Get signed URL for viewing screenshot
router.get('/payments/:id/proof-url', requireAuth, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const dbUser = await supabaseAdmin.from('User').select('role').eq('id', authUser.id).single();
    const role = dbUser.data?.role;

    const { data: payment } = await supabaseAdmin
      .from('Payment')
      .select('userId, screenshotPath')
      .eq('id', req.params.id)
      .single();

    if (!payment) return res.status(404).json({ error: 'Payment not found.' });
    if (payment.userId !== authUser.id && !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    if (!payment.screenshotPath) {
      return res.status(404).json({ error: 'No screenshot attached to this payment.' });
    }

    const { data, error } = await supabaseAdmin.storage
      .from('payment-proofs')
      .createSignedUrl(payment.screenshotPath, 3600); // 1-hour signed URL

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ signedUrl: data.signedUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN ENDPOINTS ──────────────────────────────────────────────────────────

// Middleware: require admin role
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authUser = (req as any).authUser;
  if (!authUser) return res.status(401).json({ error: 'Not authenticated.' });

  const { data: user } = await supabaseAdmin.from('User').select('role').eq('id', authUser.id).single();
  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  (req as any).dbUser = user;
  next();
}

// GET /api/admin/members
router.get('/admin/members', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const ws = await getOrCreateWorkspace();
    const { data: members, error } = await supabaseAdmin
      .from('WorkspaceMember')
      .select('*, user:User(*)')
      .eq('workspaceId', ws.id)
      .order('joinedAt', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    const result = (members || []).map((m: any) => ({
      id: m.user.id,
      email: m.user.email,
      fullName: m.user.fullName,
      phone: m.user.phone,
      role: m.role,
      joinedAt: m.joinedAt,
      createdAt: m.user.createdAt,
    }));

    return res.json({ members: result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/members/:id/role
router.patch('/admin/members/:id/role', requireAuth, requireAdmin, validate(UpdateMemberRoleSchema), async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const targetUserId = req.params.id;
    const actorUser = (req as any).dbUser;

    // Super Admin can promote to any role; Admin can only set STUDENT
    if (actorUser.role === 'ADMIN' && role !== 'STUDENT') {
      return res.status(403).json({ error: 'Admins can only demote to Student.' });
    }

    const { data, error } = await supabaseAdmin
      .from('User')
      .update({ role })
      .eq('id', targetUserId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Also update WorkspaceMember role
    const ws = await getOrCreateWorkspace();
    await supabaseAdmin
      .from('WorkspaceMember')
      .update({ role })
      .eq('userId', targetUserId)
      .eq('workspaceId', ws.id);

    return res.json({ success: true, user: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/members/:id — Remove resident user account while preserving payment audit history
router.delete('/admin/members/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const actorUser = (req as any).dbUser;
    const authUser = (req as any).authUser;
    const targetUserId = req.params.id;

    if (targetUserId === authUser.id) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

    // Check target user
    const { data: targetUser } = await supabaseAdmin.from('User').select('role, fullName').eq('id', targetUserId).single();
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (targetUser.role === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Super Admin accounts cannot be deleted.' });
    }

    if (actorUser.role === 'ADMIN' && targetUser.role === 'ADMIN') {
      return res.status(403).json({ error: 'Admins cannot delete other Admin accounts. Super Admin required.' });
    }

    // Remove from active WorkspaceMember (removes from active resident list)
    await supabaseAdmin.from('WorkspaceMember').delete().eq('userId', targetUserId);

    // Clean up meals, expenses, snapshots (preserving Payment records for audit history)
    await Promise.all([
      supabaseAdmin.from('Meal').delete().eq('userId', targetUserId),
      supabaseAdmin.from('Expense').delete().eq('userId', targetUserId),
      supabaseAdmin.from('MonthlySnapshot').delete().eq('userId', targetUserId),
    ]);

    // Update User record to indicate Deleted Resident status so payment audit log retains name
    const updatedName = targetUser.fullName.includes('(Deleted)') ? targetUser.fullName : `${targetUser.fullName} (Deleted)`;
    await supabaseAdmin.from('User').update({ fullName: updatedName }).eq('id', targetUserId);

    // Revoke Supabase Auth credentials
    try {
      await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    } catch (authErr: any) {
      console.warn('[Delete Auth User Warning]:', authErr.message);
    }

    return res.json({ success: true, message: `User ${targetUser.fullName} deleted successfully. Payment audit history preserved.` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/pending-payments
router.get('/admin/pending-payments', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const ws = await getOrCreateWorkspace();
    const { data: pending, error } = await supabaseAdmin
      .from('Payment')
      .select('*, user:User(fullName, email)')
      .eq('workspaceId', ws.id)
      .eq('status', 'PENDING')
      .order('createdAt', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    const paymentsWithProofs = await Promise.all(
      (pending || []).map(async (item: any) => {
        let proofUrl = null;
        if (item.screenshotPath) {
          try {
            const { data } = await supabaseAdmin.storage
              .from('payment-proofs')
              .createSignedUrl(item.screenshotPath, 3600);
            proofUrl = data?.signedUrl || null;
          } catch {
            proofUrl = null;
          }
        }
        const userObj = item.user || { fullName: 'Deleted Resident', email: 'N/A' };
        return { ...item, user: userObj, proofUrl };
      })
    );

    return res.json({ pendingPayments: paymentsWithProofs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/payment-history — Complete payment verification audit log
router.get('/admin/payment-history', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const ws = await getOrCreateWorkspace();
    const { data: history, error } = await supabaseAdmin
      .from('Payment')
      .select('*, user:User(fullName, email)')
      .eq('workspaceId', ws.id)
      .order('createdAt', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    const paymentsWithProofs = await Promise.all(
      (history || []).map(async (item: any) => {
        let proofUrl = null;
        if (item.screenshotPath) {
          try {
            const { data } = await supabaseAdmin.storage
              .from('payment-proofs')
              .createSignedUrl(item.screenshotPath, 3600);
            proofUrl = data?.signedUrl || null;
          } catch {
            proofUrl = null;
          }
        }
        const userObj = item.user || { fullName: 'Deleted Resident', email: 'N/A' };
        return { ...item, user: userObj, proofUrl };
      })
    );

    return res.json({ payments: paymentsWithProofs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/payments/:id/status
router.patch('/admin/payments/:id/status', requireAuth, requireAdmin, validate(VerifyPaymentSchema), async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const { status, verifiedBy } = req.body;

    const { data, error } = await supabaseAdmin
      .from('Payment')
      .update({ status, verifiedBy: verifiedBy || authUser.id })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, payment: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/prices
router.get('/admin/prices', async (_req: Request, res: Response) => {
  try {
    const ws = await getOrCreateWorkspace();
    const { data: priceObj } = await supabaseAdmin
      .from('MealPrice')
      .select('*')
      .eq('workspaceId', ws.id)
      .order('effectiveFrom', { ascending: false })
      .limit(1)
      .maybeSingle();

    return res.json({
      halfPrice: priceObj?.halfPrice ?? 40,
      fullPrice: priceObj?.fullPrice ?? 60,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/prices — Update meal rates across active billing period while preserving locked history
router.post('/admin/prices', requireAuth, requireAdmin, validate(UpdateMealPricesSchema), async (req: Request, res: Response) => {
  try {
    const { halfPrice, fullPrice } = req.body;
    const ws = await getOrCreateWorkspace();
    const currentMonth = new Date().toISOString().slice(0, 7);

    // 1. Insert new MealPrice entry
    const { data: priceData, error } = await supabaseAdmin
      .from('MealPrice')
      .insert([{ workspaceId: ws.id, halfPrice, fullPrice }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // 2. Query locked months to protect older historical snapshots
    const { data: lockedSnapshots } = await supabaseAdmin
      .from('MonthlySnapshot')
      .select('month')
      .eq('workspaceId', ws.id)
      .eq('isLocked', true);

    const lockedMonths = new Set((lockedSnapshots || []).map((s: any) => s.month));

    // 3. Update current active/unlocked meals so the new price applies everywhere immediately
    const { data: activeMeals } = await supabaseAdmin
      .from('Meal')
      .select('*')
      .eq('workspaceId', ws.id)
      .like('date', `${currentMonth}%`);

    if (activeMeals && activeMeals.length > 0 && !lockedMonths.has(currentMonth)) {
      for (const meal of activeMeals) {
        const lunchCost = meal.lunch === 'FULL' ? fullPrice : meal.lunch === 'HALF' ? halfPrice : 0;
        const dinnerCost = meal.dinner === 'FULL' ? fullPrice : meal.dinner === 'HALF' ? halfPrice : 0;
        const totalCost = lunchCost + dinnerCost;

        await supabaseAdmin
          .from('Meal')
          .update({ lunchCost, dinnerCost, totalCost, updatedAt: new Date().toISOString() })
          .eq('id', meal.id);
      }
    }

    return res.json({ success: true, prices: priceData });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/month-lock
router.post('/admin/month-lock', requireAuth, requireAdmin, validate(MonthLockSchema), async (req: Request, res: Response) => {
  try {
    const { month, lock } = req.body;
    const ws = await getOrCreateWorkspace();

    if (lock) {
      // Lock: generate snapshots for all workspace members
      const { data: members } = await supabaseAdmin
        .from('WorkspaceMember')
        .select('userId')
        .eq('workspaceId', ws.id);

      const snapshots = [];
      for (const member of members || []) {
        const uid = member.userId;

        const [mealsRes, expensesRes, paymentsRes] = await Promise.all([
          supabaseAdmin.from('Meal').select('totalCost').eq('userId', uid).like('date', `${month}%`),
          supabaseAdmin.from('Expense').select('amount').eq('userId', uid).like('date', `${month}%`),
          supabaseAdmin.from('Payment').select('amount').eq('userId', uid).eq('status', 'APPROVED'),
        ]);

        const mealTotal = (mealsRes.data || []).reduce((s, m) => s + (m.totalCost || 0), 0);
        const expenseTotal = (expensesRes.data || []).reduce((s, e) => s + (e.amount || 0), 0);
        const paymentTotal = (paymentsRes.data || []).reduce((s, p) => s + (p.amount || 0), 0);
        const balanceDue = Math.max(0, mealTotal + expenseTotal - paymentTotal);

        snapshots.push({
          workspaceId: ws.id,
          userId: uid,
          month,
          mealTotal,
          expenseTotal,
          paymentTotal,
          balanceDue,
          status: 'CLOSED',
          isLocked: true,
        });
      }

      if (snapshots.length > 0) {
        const { error } = await supabaseAdmin
          .from('MonthlySnapshot')
          .upsert(snapshots, { onConflict: 'workspaceId,userId,month' });

        if (error) return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, action: 'locked', month, snapshotsCreated: snapshots.length });
    } else {
      // Unlock: update existing snapshots to OPEN
      const { error } = await supabaseAdmin
        .from('MonthlySnapshot')
        .update({ isLocked: false, status: 'OPEN' })
        .eq('workspaceId', ws.id)
        .eq('month', month);

      if (error) return res.status(400).json({ error: error.message });
      return res.json({ success: true, action: 'unlocked', month });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── REPORTS & HISTORY ────────────────────────────────────────────────────────

// GET /api/reports/monthly
router.get('/reports/monthly', requireAuth, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const userId = authUser.id;
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

    const [mealsRes, expensesRes, paymentsRes] = await Promise.all([
      supabaseAdmin.from('Meal').select('*').eq('userId', userId).like('date', `${month}%`),
      supabaseAdmin.from('Expense').select('*').eq('userId', userId).like('date', `${month}%`),
      supabaseAdmin.from('Payment').select('amount').eq('userId', userId).eq('status', 'APPROVED'),
    ]);

    const mealTotal = (mealsRes.data || []).reduce((acc, m) => acc + (m.totalCost || 0), 0);
    const expenseTotal = (expensesRes.data || []).reduce((acc, e) => acc + (e.amount || 0), 0);
    const paymentTotal = (paymentsRes.data || []).reduce((acc, p) => acc + (p.amount || 0), 0);

    const catMap: Record<string, number> = {};
    if (mealTotal > 0) catMap['Tiffin & Mess Meals'] = mealTotal;
    for (const exp of (expensesRes.data || [])) {
      catMap[exp.category] = (catMap[exp.category] || 0) + exp.amount;
    }

    const totalSpent = mealTotal + expenseTotal;
    const categories = Object.entries(catMap).map(([name, amount]) => ({
      name,
      amount,
      pct: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) + '%' : '0%',
    }));

    return res.json({
      month,
      mealTotal,
      expenseTotal,
      paymentTotal,
      remainingBalance: Math.max(0, totalSpent - paymentTotal),
      categories,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/history
router.get('/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const { data: snapshots, error } = await supabaseAdmin
      .from('MonthlySnapshot')
      .select('*')
      .eq('userId', authUser.id)
      .order('month', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ history: snapshots || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/history/snapshot-details?month=YYYY-MM
router.get('/history/snapshot-details', requireAuth, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).authUser;
    const userId = authUser.id;
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

    const [snapshotRes, mealsRes, expensesRes, paymentsRes] = await Promise.all([
      supabaseAdmin.from('MonthlySnapshot').select('*').eq('userId', userId).eq('month', month).maybeSingle(),
      supabaseAdmin.from('Meal').select('*').eq('userId', userId).like('date', `${month}%`).order('date', { ascending: true }),
      supabaseAdmin.from('Expense').select('*').eq('userId', userId).like('date', `${month}%`).order('date', { ascending: true }),
      supabaseAdmin.from('Payment').select('*').eq('userId', userId).like('date', `${month}%`).order('date', { ascending: true }),
    ]);

    const snapshot = snapshotRes.data;
    const meals = mealsRes.data || [];
    const expenses = expensesRes.data || [];
    const rawPayments = paymentsRes.data || [];

    const payments = await Promise.all(
      rawPayments.map(async (p) => {
        let proofUrl = null;
        if (p.screenshotPath) {
          try {
            const { data } = await supabaseAdmin.storage
              .from('payment-proofs')
              .createSignedUrl(p.screenshotPath, 3600);
            proofUrl = data?.signedUrl || null;
          } catch {
            proofUrl = null;
          }
        }
        return { ...p, proofUrl };
      })
    );

    const mealTotal = meals.reduce((s, m) => s + (m.totalCost || 0), 0);
    const expenseTotal = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const paymentTotal = payments.filter((p) => p.status === 'APPROVED').reduce((s, p) => s + (p.amount || 0), 0);
    const totalSpent = mealTotal + expenseTotal;
    const balanceDue = Math.max(0, totalSpent - paymentTotal);

    return res.json({
      month,
      snapshot,
      meals,
      expenses,
      payments,
      totals: {
        mealTotal: snapshot ? snapshot.mealTotal : mealTotal,
        expenseTotal: snapshot ? snapshot.expenseTotal : expenseTotal,
        paymentTotal: snapshot ? snapshot.paymentTotal : paymentTotal,
        totalSpent,
        balanceDue: snapshot ? snapshot.balanceDue : balanceDue,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/expense-categories
router.get('/expense-categories', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('ExpenseCategory')
      .select('name')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      // Return defaults if table empty
      return res.json({
        categories: ['Food', 'Tea', 'Snacks', 'Grocery', 'Laundry', 'Travel', 'Medical', 'Shopping', 'Other']
      });
    }

    return res.json({ categories: data.map(c => c.name) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
