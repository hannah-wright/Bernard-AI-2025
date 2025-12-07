/**
 * Settings Page
 * 
 * User profile, security, notification preferences, and account management.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  User,
  Shield,
  Bell,
  Trash2,
  Loader2,
  Save,
  Key,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number');

interface OwnedOrg {
  id: string;
  name: string;
  memberCount: number;
}

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, refreshProfile } = useProfile();

  // Profile state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account state
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCheckingOrg, setIsCheckingOrg] = useState(false);
  const [ownedOrgs, setOwnedOrgs] = useState<OwnedOrg[]>([]);

  // Notification preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Update state when profile loads
  useEffect(() => {
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      // Load notification preferences from profile
      if (profile.email_alerts_enabled !== undefined) setEmailAlerts(profile.email_alerts_enabled);
      if (profile.email_weekly_digest !== undefined) setWeeklyDigest(profile.email_weekly_digest);
      if (profile.email_product_updates !== undefined) setMarketingEmails(profile.email_product_updates);
    }
  }, [profile]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Please sign in</h1>
          <p className="text-muted-foreground">You need to be logged in to view settings.</p>
          <Button onClick={() => navigate('/auth')} className="mt-4">Sign In</Button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    
    // Validate new password
    const result = passwordSchema.safeParse(newPassword);
    if (!result.success) {
      setPasswordError(result.error.errors[0].message);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Save notification preferences
  const handleSaveNotificationPreferences = async () => {
    setIsSavingNotifications(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email_alerts_enabled: emailAlerts,
          email_weekly_digest: weeklyDigest,
          email_product_updates: marketingEmails,
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Notification preferences saved');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save preferences');
    } finally {
      setIsSavingNotifications(false);
    }
  };

  // Check organization ownership before showing delete dialog
  const handleDeleteAccountClick = async () => {
    setIsCheckingOrg(true);
    try {
      // Check if user owns any organizations
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('owner_id', user.id);

      if (orgs && orgs.length > 0) {
        // Get member counts for each org
        const orgsWithCounts: OwnedOrg[] = [];
        for (const org of orgs) {
          const { count } = await supabase
            .from('organization_members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id);
          
          orgsWithCounts.push({
            id: org.id,
            name: org.name,
            memberCount: count || 0,
          });
        }
        setOwnedOrgs(orgsWithCounts);
        setShowDeleteWarning(true);
      } else {
        // No owned orgs, show standard confirmation
        setOwnedOrgs([]);
        setShowDeleteWarning(true);
      }
    } catch (error) {
      toast.error('Failed to check organization status');
    } finally {
      setIsCheckingOrg(false);
    }
  };

  const handleProceedToDelete = () => {
    setShowDeleteWarning(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account', {
        body: { userId: user.id },
      });

      if (error) throw error;

      await signOut();
      toast.success('Account deleted successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email addresses cannot be changed as they are permanently linked to your billing and account history.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {profile?.subscription_tier || 'Trial'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {profile?.credits_remaining || 0} credits remaining
                    </span>
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                  {isSavingProfile ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>

                  {passwordError && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Password requirements:</p>
                    <ul className="list-disc list-inside">
                      <li>At least 8 characters</li>
                      <li>One uppercase letter</li>
                      <li>One lowercase letter</li>
                      <li>One number</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !newPassword || !confirmPassword}
                  >
                    {isChangingPassword ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Key className="h-4 w-4 mr-2" />
                    )}
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Trash2 className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible actions that affect your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <h4 className="font-medium text-destructive mb-2">Delete Account</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                        <li>• All your saved filters and lists will be deleted</li>
                        <li>• Your subscription will be cancelled immediately</li>
                        <li>• Team members in your organization will lose access</li>
                        <li>• This action is permanent and cannot be reversed</li>
                      </ul>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccountClick}
                        disabled={isCheckingOrg}
                      >
                        {isCheckingOrg ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete My Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Choose what emails you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alert Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new startups match your saved filters
                    </p>
                  </div>
                  <Switch
                    checked={emailAlerts}
                    onCheckedChange={setEmailAlerts}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Summary of new startups and market trends
                    </p>
                  </div>
                  <Switch
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                  />
                </div>

                {/* Product Updates / Marketing emails - hidden until HubSpot integration */}

                <Button 
                  onClick={handleSaveNotificationPreferences}
                  disabled={isSavingNotifications}
                >
                  {isSavingNotifications ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Warning Dialog (First Step) */}
      <AlertDialog open={showDeleteWarning} onOpenChange={setShowDeleteWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Are you sure you want to delete your account?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  This will permanently delete your account and all your data. This cannot be undone.
                </p>
                
                {ownedOrgs.length > 0 && (
                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-destructive" />
                      <span className="font-medium text-destructive">
                        You own {ownedOrgs.length} organization{ownedOrgs.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    {ownedOrgs.map(org => (
                      <div key={org.id} className="ml-6 text-sm">
                        <strong>{org.name}</strong> ({org.memberCount} member{org.memberCount !== 1 ? 's' : ''})
                      </div>
                    ))}
                    <p className="mt-3 text-sm">
                      {ownedOrgs.some(o => o.memberCount > 1) ? (
                        <>
                          <strong>Ownership will be transferred</strong> to the next admin or member. 
                          If no other members exist, the organization will be deleted.
                        </>
                      ) : (
                        <>
                          <strong>Your organization{ownedOrgs.length > 1 ? 's' : ''} will be deleted</strong> since 
                          there are no other members.
                        </>
                      )}
                    </p>
                  </div>
                )}

                <div className="text-sm">
                  <p className="font-medium mb-2">The following will be permanently deleted:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• All saved filters and investment criteria</li>
                    <li>• All startup lists and notes</li>
                    <li>• Notification preferences and history</li>
                    <li>• Credit transaction history (anonymized for records)</li>
                    {ownedOrgs.length > 0 && <li>• Organization settings and invites</li>}
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProceedToDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              I understand, continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog (Second Step) */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Final Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription>
              This is your last chance to cancel. Type <strong className="text-foreground">DELETE</strong> below to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value.toUpperCase())}
              placeholder="Type DELETE to confirm"
              className="font-mono"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'DELETE' || isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Permanently Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
