import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ljrdsplezaellsttagmq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqcmRzcGxlemFlbGxzdHRhZ21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NjA3NzYsImV4cCI6MjA4ODEzNjc3Nn0.Yq91BtVbqhk7_WYMgwiWSFFp7KrymaZTdRatGVYGXE8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
