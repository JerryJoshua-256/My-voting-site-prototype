# URP 500 Level ballot — hosting

Student page: enter a matric number, pick one option, press Finalize (top corner).
Until Finalize, the same matric can change the choice. After Finalize, that number cannot enter again.

Options:

1. All 1,450 for Studio Work
2. 1,000 for Class due and 450 for studio work

Each finalized vote is emailed to olaniyijerry20@gmail.com with the running totals
(how many finalized votes for each option). The vote is saved even if the email is delayed.

## Host it (Vercel + a real database)

Votes disappear on a plain Vercel deploy unless a Postgres database is attached.
Do this once:

1. Create a free database at https://neon.tech and copy the connection string.
2. Push this folder to a GitHub repository (do not upload `node_modules`).
3. In Vercel: Add New Project → import that repo.
4. Environment variable: `DATABASE_URL` = the Neon connection string.
   Leave `VITE_AUTH_ENABLED` unset.
5. Build command: `npm run build`. Output is configured by the project (`nitro` / Vercel).
6. Deploy, then open the live URL.

## Turn email on (once)

The inbox must confirm the sender before class mail arrives.

1. Finalize one test vote on the live site (use your own matric if you must).
2. Open olaniyijerry20@gmail.com — including Spam.
3. Open the message from FormSubmit and click **Activate Form**.
4. Later votes then arrive on their own. Each message includes the voter and both totals.

If a notice does not arrive, open `/roll` on the live site.
Officer code: `ballot-1450-akure`
Press **Send waiting notices**. Use **Clear** only to undo a test or a mistake — that matric can vote again.

Do not share the officer code with the class.

## Before the real vote

- Publish first, activate email, then Clear any test ballot from `/roll`.
- Share only the home link with the class, not `/roll`.
- Counts in the email and on `/roll` include finalized votes only. An open ballot is not counted.
