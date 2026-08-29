// app/(dashboard)/dashboard/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Shield, Bell, Palette } from 'lucide-react';
import { toast } from 'sonner';
import type { JsonObject } from '@/app/lib/types';

interface SettingsData {
  demo_mode: { enabled: boolean };
  daily_goal: { target: number };
  order_prefix: { prefix: string };
  whatsapp_enabled: { enabled: boolean };
  notifications: { email: boolean; whatsapp: boolean };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    demo_mode: { enabled: false },
    daily_goal: { target: 5 },
    order_prefix: { prefix: 'EBU' },
    whatsapp_enabled: { enabled: false },
    notifications: { email: true, whatsapp: true },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/settings', { cache: 'no-store' });
        const result = await response.json() as { error?: string; settings?: Array<{ key: string; value: JsonObject }> };
        if (!response.ok) throw new Error(result.error || 'Failed to load settings');
        const map = Object.fromEntries((result.settings ?? []).map((item) => [item.key, item.value]));
        if (!cancelled) {
          setSettings({
            demo_mode: typeof map.demo_mode?.enabled === 'boolean' ? { enabled: map.demo_mode.enabled } : { enabled: false },
            daily_goal: typeof map.daily_goal?.target === 'number' ? { target: map.daily_goal.target } : { target: 5 },
            order_prefix: typeof map.order_prefix?.prefix === 'string' ? { prefix: map.order_prefix.prefix } : { prefix: 'EBU' },
            whatsapp_enabled: typeof map.whatsapp_enabled?.enabled === 'boolean' ? { enabled: map.whatsapp_enabled.enabled } : { enabled: false },
            notifications: {
              email: typeof map.notifications?.email === 'boolean' ? map.notifications.email : true,
              whatsapp: typeof map.notifications?.whatsapp === 'boolean' ? map.notifications.whatsapp : true,
            },
          });
        }
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : 'Failed to load settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  async function saveSettings() {
    setSaving(true);
    try { const response=await fetch('/api/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)}); const result=await response.json(); if(!response.ok)throw new Error(result.error); toast.success('Settings saved successfully'); } catch(error){console.error(error);toast.error('Failed to save settings')} finally{setSaving(false)}
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-solar-flare border-t-transparent rounded-full animate-spin"></div>
          <p className="text-warm-gray">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-midnight dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-solar-flare" />
            Settings
          </h1>
          <p className="text-sm text-warm-gray mt-1">
            Configure your EBU Flow platform
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-solar-flare text-white font-medium rounded-lg hover:bg-solar-flare/90 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-midnight/50 rounded-xl shadow-sm border border-warm-gray/10 p-6">
          <h3 className="font-semibold text-midnight dark:text-white mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-warm-gray" />
            General
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-midnight dark:text-white mb-1">
                Order Prefix
              </label>
              <input
                type="text"
                value={settings.order_prefix.prefix}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    order_prefix: { prefix: e.target.value.toUpperCase() },
                  })
                }
                className="w-full px-3 py-2 border border-warm-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-solar-flare dark:bg-midnight/50 dark:text-white"
                placeholder="EBU"
              />
              <p className="text-xs text-warm-gray mt-1">
                Orders will be formatted as: PREFIX-YYYY-XXXX
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-midnight dark:text-white mb-1">
                Daily Goal
              </label>
              <input
                type="number"
                value={settings.daily_goal.target}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    daily_goal: { target: parseInt(e.target.value) || 5 },
                  })
                }
                className="w-full px-3 py-2 border border-warm-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-solar-flare dark:bg-midnight/50 dark:text-white"
                min={1}
                max={50}
              />
              <p className="text-xs text-warm-gray mt-1">
                Target activations per day
              </p>
            </div>
          </div>
        </div>

        {/* Demo Mode */}
        <div className="bg-white dark:bg-midnight/50 rounded-xl shadow-sm border border-warm-gray/10 p-6">
          <h3 className="font-semibold text-midnight dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-warm-gray" />
            Demo Mode
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-midnight dark:text-white">Enable Demo Mode</p>
                <p className="text-xs text-warm-gray">
                  Show simulated data for B2B presentations
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.demo_mode.enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      demo_mode: { enabled: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-solar-flare"></div>
              </label>
            </div>

            {settings.demo_mode.enabled && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                ⚠️ Demo mode is active. All dashboard data will be simulated.
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Integration */}
        <div className="bg-white dark:bg-midnight/50 rounded-xl shadow-sm border border-warm-gray/10 p-6">
          <h3 className="font-semibold text-midnight dark:text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-warm-gray" />
            WhatsApp Integration
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-midnight dark:text-white">Enable WhatsApp</p>
                <p className="text-xs text-warm-gray">
                  Send automated messages to clients
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.whatsapp_enabled.enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsapp_enabled: { enabled: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-solar-flare"></div>
              </label>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              💡 Configure WhatsApp credentials in your .env.local file:
              <code className="block mt-1 text-xs bg-white p-2 rounded border border-blue-200">
                WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
                <br />
                WHATSAPP_ACCESS_TOKEN=your_access_token
              </code>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-midnight/50 rounded-xl shadow-sm border border-warm-gray/10 p-6">
          <h3 className="font-semibold text-midnight dark:text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-warm-gray" />
            Notifications
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-midnight dark:text-white">Email Notifications</p>
                <p className="text-xs text-warm-gray">Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, email: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-solar-flare"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-midnight dark:text-white">WhatsApp Notifications</p>
                <p className="text-xs text-warm-gray">Receive updates via WhatsApp</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.whatsapp}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, whatsapp: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-solar-flare"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="bg-white dark:bg-midnight/50 rounded-xl shadow-sm border border-warm-gray/10 p-6">
        <h3 className="font-semibold text-midnight dark:text-white mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-warm-gray" />
          Brand Colors
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg" style={{ background: '#FF6B35' }} />
            <div>
              <p className="text-sm font-medium text-midnight dark:text-white">Solar Flare</p>
              <p className="text-xs text-warm-gray">#FF6B35</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg" style={{ background: '#4A6CF7' }} />
            <div>
              <p className="text-sm font-medium text-midnight dark:text-white">Ultramarine</p>
              <p className="text-xs text-warm-gray">#4A6CF7</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg" style={{ background: '#D946EF' }} />
            <div>
              <p className="text-sm font-medium text-midnight dark:text-white">Hot Magenta</p>
              <p className="text-xs text-warm-gray">#D946EF</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg" style={{ background: '#0B1121' }} />
            <div>
              <p className="text-sm font-medium text-midnight dark:text-white">Midnight</p>
              <p className="text-xs text-warm-gray">#0B1121</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}