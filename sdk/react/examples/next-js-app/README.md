
## Getting Started

## Installation
```sh
yarn
```

## Running the example

* In `pages/_app.tsx`, set `ENV_KEY` to the Environment Key.
  You can find this under Settings / Environments on the DevCycle dashboard.
* Create a new feature on the dashboard. Update the `variableKey` in `pages/index.tsx` to this value.
* If you added user targeting to your feature, update the `user_id` field in `pages/_app.tsx` based on your targeting rules.



run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
