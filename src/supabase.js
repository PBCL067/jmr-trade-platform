import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function fetchTable(table, options = {}) {
  let query = supabase.from(table).select('*');
  if (options.eq)     query = query.eq(options.eq[0], options.eq[1]);
  if (options.order)  query = query.order(options.order, { ascending: options.asc ?? true });
  if (options.limit)  query = query.limit(options.limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function upsertRow(table, row) {
  const { data, error } = await supabase.from(table).upsert(row).select();
  if (error) throw error;
  return data;
}

export async function updateRow(table, id, updates) {
  const { data, error } = await supabase.from(table).update({
    ...updates,
    updated_at: new Date().toISOString(),
  }).eq('id', id).select();
  if (error) throw error;
  return data;
}

export async function deleteRow(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

export async function insertRow(table, row) {
  const { data, error } = await supabase.from(table).insert({
    ...row,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select();
  if (error) throw error;
  return data;
}


// ---- AUTH ----
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
