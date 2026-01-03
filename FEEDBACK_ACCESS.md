# Feedback & Bug Reports Access Guide

## Where is the data?
All bug reports and feedback submitted via the "Report a Bug" modal are stored in **Google Cloud Firestore**.

**Collection Name:** `feedback`

## How to View Data
Since the current security rules (`firestore.rules`) block public read access to protect user privacy, you cannot view these reports inside the Tripify app yet.

 **To view them:**
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project (**travelcfo-app** / **tripify**).
3. In the left sidebar, click **Build** > **Firestore Database**.
4. Click on the **Data** tab.
5. Select the **`feedback`** collection.

## Data Structure
Each document contains:
- `title`: Subject of the report.
- `description`: Detailed explanation.
- `userEmail`: Email of the reporter (or 'anonymous').
- `userAgent`: Device/Browser info.
- `status`: 'new' (default).
- `timestamp`: Time of submission.

## Future Admin Dashboard
To view this in the app, we would need to:
1. Create an **Admin Role** system.
2. Update `firestore.rules` to `allow read: if request.auth.token.admin == true;`.
3. Build an `/admin/feedback` page.
