# Adding a new library

Use Nx to generate a new library:
`nx workspace-generator library <libraryName>`

eg.

`nx workspace-generator library nest/logging`

The top-level folders inside `lib/` indicate where the library is intended to be used:
```
lib/
  internal/     - internal libraries that are shared but not published on NPM
  shared/       - libraries that work in any JS project and are published on NPM
  web-debugger/ - web debugging tools and components
```

We are loosely following the advice in these articles for organizing our libraries
https://nx.dev/l/n/structure/grouping-libraries
https://medium.com/showpad-engineering/how-to-organize-and-name-applications-and-libraries-in-an-nx-monorepo-for-immediate-team-wide-9876510dbe28
