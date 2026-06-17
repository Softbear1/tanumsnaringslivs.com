-- Migration: låt företaget välja om ett blixterbjudande ska publiceras på Facebook
--
-- post_to_fb styr om /api/social/post-deals (via pg_cron) plockar upp erbjudandet.
-- Default true så att autopublicering är på som standard; företaget kan bocka ur
-- i formuläret när de skapar ett erbjudande de inte vill posta.

alter table public.flash_deals
  add column if not exists post_to_fb boolean not null default true;
