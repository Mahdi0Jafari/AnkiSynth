// src/store/useSettings.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ۱. تعریف تیپ‌بندی تنظیمات برای حفظ پایداری کد
interface SettingsState {
  apiKey: string;
  baseUrl: string;
  model: string;
  defaultInstructions: string; // فیلد جدید برای ذخیره دستورات همیشگی کاربر
  // متدهایی برای تغییر مقادیر
  setSettings: (settings: Partial<Omit<SettingsState, 'setSettings' | 'resetSettings'>>) => void;
  resetSettings: () => void;
}

// ۲. ساخت استور با قابلیت ماندگاری (Persistence)
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      // مقادیر اولیه
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1', 
      model: 'gpt-4o-mini',                
      defaultInstructions: '', // به صورت پیش‌فرض خالی است

      // بروزرسانی بخشی از تنظیمات
      setSettings: (newSettings) => 
        set((state) => ({ ...state, ...newSettings })),

      // بازگشت به تنظیمات کارخانه
      resetSettings: () => set({ 
        apiKey: '', 
        baseUrl: 'https://api.openai.com/v1', 
        model: 'gpt-4o-mini',
        defaultInstructions: ''
      }),
    }),
    {
      name: 'AnkiSynth-settings-storage', // نام کلید در LocalStorage
      storage: createJSONStorage(() => localStorage), 
    }
  )
);