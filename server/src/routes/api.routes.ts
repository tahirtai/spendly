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
router.put('/expenses/:id', requireAuth, validate(UpdateExpenseSchema), async (req: Request, 