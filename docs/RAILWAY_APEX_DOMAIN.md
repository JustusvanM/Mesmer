# Option 2: Use one Railway slot for gomesmer.com (apex)

Your app already redirects **www** → **gomesmer.com** and uses **gomesmer.com** as canonical. Follow these steps so both URLs reach Railway.

---

## Step 1: Railway – swap custom domain

1. Open your project on [Railway](https://railway.app) → **Settings** (or the service that serves the app).
2. Under **Public Networking** / **Custom Domains**:
   - **Remove** `www.gomesmer.com` (trash icon).
   - Click **+ Custom Domain** and add **`gomesmer.com`** (no www).
3. Railway will show DNS instructions and a target, e.g.:
   - **CNAME** target: something like `your-app.up.railway.app`, or  
   - **A** record (if they show an IP).
4. Leave this tab open; you’ll need the exact target in Step 2.

---

## Step 2: DNS at your domain registrar

Log in where **gomesmer.com** is managed (e.g. Cloudflare, Namecheap, Google Domains, TransIP).

### A. Apex domain: **gomesmer.com**

Railway usually gives a **CNAME** target. Many registrars don’t allow CNAME on the apex; use one of these:

- **If you use Cloudflare**  
  Add a **CNAME** record:
  - Name: `@` (or `gomesmer.com` / leave blank, depending on UI).
  - Target: the Railway CNAME target (e.g. `xxxx.up.railway.app`).  
  Cloudflare will flatten it to an A record at the apex.

- **If your registrar supports ALIAS / ANAME / CNAME flattening**  
  Add an **ALIAS** (or equivalent) for `gomesmer.com` pointing to the same Railway target.

- **If Railway shows an A record (IP)**  
  Add an **A** record:
  - Name: `@` (or apex).
  - Value: the IP Railway gives.

### B. www: **www.gomesmer.com**

Add a **CNAME** record:

- Name: `www`
- Target: **the same Railway target** as for gomesmer.com (e.g. `your-app.up.railway.app`).

So both apex and www point to the same Railway app. Railway will accept traffic for both; your app’s middleware will redirect **www** → **gomesmer.com**.

---

## Step 3: Wait and test

- DNS can take a few minutes up to 48 hours (often 5–15 minutes).
- Test:
  - **https://gomesmer.com** – should load (no port).
  - **https://www.gomesmer.com** – should redirect to **https://gomesmer.com** (301).

---

## Summary

| Where        | What to do |
|-------------|------------|
| **Railway** | Remove www.gomesmer.com, add **gomesmer.com** only. |
| **DNS**     | Apex (gomesmer.com) → Railway (CNAME/ALIAS/A as above). |
| **DNS**     | www → CNAME to same Railway target. |
| **App**     | Already redirects www → gomesmer.com; no code change needed. |

If your registrar doesn’t support CNAME/ALIAS at apex, use **Cloudflare** (free) as DNS: add the domain, switch nameservers, then add the CNAME at apex as in Step 2A.
