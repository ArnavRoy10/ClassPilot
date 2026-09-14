-- Run this in Supabase Dashboard → SQL Editor
-- Adds columns needed for Razorpay payment links and QR codes on fees

alter table student_fees
  add column if not exists razorpay_payment_link_id text,
  add column if not exists razorpay_payment_link_url text,
  add column if not exists razorpay_qr_code_id text,
  add column if not exists razorpay_qr_code_image text;
