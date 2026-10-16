# Team LU

A faithful adaptation of the Team Vale academy page for Team LU. It retains the original Spanish content, imagery, animated star plate, Eagle and Contest progress, member goal histories, calendar, and videos. A separate website editor publishes shared content updates without changing code.

The public site uses HTML, CSS, and JavaScript with no frontend build step. Netlify Functions handle authentication and publishing. Netlify Identity protects the editor, and Netlify Database stores published content through Drizzle ORM.

## Run locally

Install dependencies with `npm install`, link the project using the Netlify CLI, then run `npm run dev`. This starts Netlify development on port 8889 with platform emulation. Database migrations are applied by Netlify during deployment.

## Editor access

In the Netlify project dashboard, open Identity and invite your email address. Assign the `admin` role to the invited account. Accept the email invitation and choose a password, then visit `/editor.html` or use **Editar página** in the footer. Only accounts with the server-managed `admin` role can publish. The editor also supports password recovery.

Use the section tabs to edit page text, member names and objective histories, star progress, Eagle, Contest, and calendar events. Expand a record to edit it, add or delete records, and select **Publicar cambios** to save. The public page reads the latest published content on each visit. Concurrent publishing is detected to avoid overwriting another editor's changes.

The initial content is provided by `public/assets/default-content.json` until the first publication. This is seed content, not a writable data store. Published updates live in Netlify Database. Reference videos, channel links, calendar subscription, and photos remain the original ones as requested.

Identity invitations and password recovery links may land on the home page; the site forwards those links to the editor automatically. No administrator password is embedded in the project.
