import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Camera,
  CheckCircle2,
  ChevronRight,
  History,
  Info,
  Loader2,
  LogOut,
  Mail,
  Phone,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { UpdateProfileSchema } from 'spendly-shared';
import { UserAvatar, getUserInitials } from '../../components/UserAvatar';
import { SpendlyLogo } from '../../components/SpendlyLogo';
import { api, ApiError } from '../../lib/api';
import { useAuthStore, type User } from '../../store/useAuthStore';

type ProfileForm = {
  fullName: string;
  phone: string;
  avatarUrl: string;
};

function formatRole(role?: string) {
  if (!role) return 'Student';
  return role
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, accessToken, setUser, logout } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(user);
  const [form, setForm] = useState<ProfileForm>({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const data = await api.get<{ user: User }>('/user/profile');
        if (!mounted) return;
        setProfile(data.user);
        setForm({
          fullName: data.user.fullName || '',
          phone: data.user.phone || '',
          avatarUrl: data.user.avatarUrl || '',
        });
        setUser(data.user, accessToken);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const displayUser = profile || user;

  // Personal Information card meta (Role & Workspace removed as requested)
  const accountMeta = useMemo(
    () => [
      { icon: Mail, label: 'Email', value: displayUser?.email },
      { icon: Phone, label: 'Phone', value: displayUser?.phone || 'Not added' },
    ],
    [displayUser]
  );

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ avatarUrl: 'Please select a valid image file.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ avatarUrl: 'Image size must be under 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setForm((prev) => ({ ...prev, avatarUrl: result }));
        setErrors((prev) => ({ ...prev, avatarUrl: '' }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setStatus('');

    const payload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim() ? form.phone.trim() : null,
      avatarUrl: form.avatarUrl.trim() ? form.avatarUrl.trim() : null,
    };

    const parsed = UpdateProfileSchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const [field, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
        nextErrors[field] = (messages as string[])[0];
      }
      setErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    try {
      const data = await api.patch<{ user: User }>('/user/profile', parsed.data);
      const updatedProfile = {
        ...(displayUser as User),
        ...data.user,
        avatarUrl: data.user.avatarUrl ?? null,
        workspaceId: displayUser?.workspaceId || data.user.workspaceId,
        workspaceName: displayUser?.workspaceName || data.user.workspaceName,
      };
      setProfile(updatedProfile);
      setUser(updatedProfile, accessToken);
      setStatus('Profile updated successfully.');
      setTimeout(() => setStatus(''), 2500);
    } catch (err: any) {
      setErrors({ form: err instanceof ApiError ? err.message : 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="mobile-page">
      <section className="stitch-card bg-white p-6">
        <div className="flex items-center gap-4">
          <UserAvatar user={displayUser} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#767586]">Profile</p>
            <h1 className="mt-1 truncate font-display text-2xl font-extrabold text-[#0b1c30]">
              {displayUser?.fullName || 'Resident'}
            </h1>
            <p className="truncate text-xs font-medium text-[#464554]">{displayUser?.email}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#d3e4fe] bg-[#eff4ff] px-3 py-1 text-[11px] font-bold text-[#4648d4]">
              <ShieldCheck className="h-3.5 w-3.5" />
              {formatRole(displayUser?.role)}
            </div>
          </div>
        </div>
      </section>

      <section className="stitch-card bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-extrabold text-[#0b1c30]">Personal Information</h2>
            <p className="text-xs text-[#767586]">Fetched from your Spendly profile.</p>
          </div>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-[#4648d4]" />}
        </div>

        <div className="divide-y divide-slate-100">
          {accountMeta.map((item) => (
            <div key={item.label} className="flex items-center gap-3 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f8f9ff] text-[#4648d4]">
                <item.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#767586]">{item.label}</p>
                <p className="truncate text-sm font-bold text-[#0b1c30]">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="stitch-card bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <UserRound className="h-4 w-4 text-[#4648d4]" />
          <h2 className="font-display text-base font-extrabold text-[#0b1c30]">Edit Profile</h2>
        </div>

        {errors.form && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}
        {status && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-[#006c49]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{status}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#464554]">Full name</label>
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className={`input-field ${errors.fullName ? 'border-rose-400' : ''}`}
              required
            />
            {errors.fullName && <p className="mt-1 text-[11px] text-rose-500">{errors.fullName}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#464554]">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field"
              inputMode="tel"
              placeholder="Add phone number"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#464554]">Profile Photo</label>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8f9ff] p-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white bg-slate-100 shadow-sm">
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-display text-sm font-extrabold text-indigo-600 bg-indigo-50">
                    {getUserInitials(displayUser)}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 shadow-2xs text-[#4648d4] border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100"
                  >
                    <Camera className="h-3.5 w-3.5 text-[#4648d4]" />
                    <span>Choose from Gallery</span>
                  </button>
                  {form.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, avatarUrl: '' })}
                      className="text-xs text-rose-500 font-bold hover:underline px-1 py-1 flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[#767586]">Upload photo from gallery (PNG, JPG, WEBP)</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarSelect}
                className="hidden"
              />
            </div>
            {errors.avatarUrl && <p className="mt-1 text-[11px] text-rose-500">{errors.avatarUrl}</p>}
          </div>

          <button type="submit" disabled={isSaving} className="btn-primary w-full">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? 'Saving Profile' : 'Save Profile'}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="px-1 font-display text-xs font-bold uppercase tracking-wider text-[#767586]">
          Activity & Finance
        </h2>
        <Link to="/history" className="profile-row">
          <span className="profile-row-icon bg-[#eff4ff] text-[#4648d4]"><History className="h-4 w-4" /></span>
          <span className="flex-1 text-sm font-bold text-[#0b1c30]">Monthly History</span>
          <ChevronRight className="h-4 w-4 text-[#767586]" />
        </Link>
        <Link to="/reports" className="profile-row">
          <span className="profile-row-icon bg-[#e6f9f1] text-[#006c49]"><BarChart3 className="h-4 w-4" /></span>
          <span className="flex-1 text-sm font-bold text-[#0b1c30]">Reports</span>
          <ChevronRight className="h-4 w-4 text-[#767586]" />
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="px-1 font-display text-xs font-bold uppercase tracking-wider text-[#767586]">
          Application
        </h2>
        {(displayUser?.role === 'ADMIN' || displayUser?.role === 'SUPER_ADMIN') && (
          <Link to="/admin" className="profile-row">
            <span className="profile-row-icon bg-[#fff2e6] text-[#c05400]"><ShieldCheck className="h-4 w-4" /></span>
            <span className="flex-1 text-sm font-bold text-[#0b1c30]">Admin Console</span>
            <ArrowUpRight className="h-4 w-4 text-[#767586]" />
          </Link>
        )}
        <div className="profile-row opacity-75">
          <span className="profile-row-icon bg-[#f8f9ff] text-[#767586]"><Settings className="h-4 w-4" /></span>
          <span className="flex-1 text-sm font-bold text-[#0b1c30]">Settings</span>
          <span className="text-[11px] font-bold text-[#767586]">Soon</span>
        </div>
        <div className="profile-row">
          <span className="profile-row-icon bg-[#f8f9ff] flex items-center justify-center p-0.5">
            <SpendlyLogo variant="icon" size="sm" className="h-4 w-4" />
          </span>
          <span className="flex-1 text-sm font-bold text-[#0b1c30]">About Spendly</span>
          <span className="text-[11px] font-bold text-[#767586]">v1.0.0 • Mobile expense manager</span>
        </div>
      </section>

      <section className="stitch-card bg-white p-4">
        <button type="button" onClick={handleLogout} className="btn-danger w-full">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </section>
    </div>
  );
};
