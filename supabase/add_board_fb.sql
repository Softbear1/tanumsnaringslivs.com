-- Facebook-teaser för anslagstavlan: när en annons publiceras postas en teaser
-- till FB-sidan som driver trafik till hemsidan. fb_post_id lagrar postens id så
-- samma annons aldrig postas två gånger.
alter table public.board_ads add column if not exists fb_post_id text;
